import KEY_CODE from "../util/keyCodes.mjs"
import Game from "../Engine/Game.mjs"
import GameObject from "../Engine/GameObject/GameObject.mjs"
import Bounds from "../Engine/GameObject/Bounds.mjs"
import FloatingText from "../Graphics/FloatingText.mjs"
import PhysicsEngine from "../Engine/Physics/PhysicsEngine.mjs"
import PerspectiveRenderingEngine from "../Engine/Rendering/PerspectiveRenderingEngine.mjs"
import ParticleEngine from "../Engine/Effects/ParticleEngine.mjs"
import { MOVEMENT_TYPE } from "../Engine/Physics/PhysicsConstants.mjs"

import ObjectRenderer from "./Renderers/ObjectRenderer.mjs"
import Character from "./Objects/Character.mjs"
import Projectile from "./Objects/Projectile.mjs"
import objects from "./Objects/objects.mjs"
import equipment from "./Objects/equipment.mjs"
import Building from "./Buildings/Building.mjs";
import Magic from "./Magic/Magic.mjs";
import GenericObject from "./Objects/GenericObject.mjs";
import AnimationEffect from "./Effects.js/AnimationEffect.mjs";
import effects from "./Effects.js/effects.mjs";

window.debug = true;

const EVENTS = {
  MOVE_UP: "moveUp",
  MOVE_DOWN: "moveDown",
  MOVE_LEFT: "moveLeft",
  MOVE_RIGHT: "moveRight",
  PRIMARY_FIRE: "primaryFire",
  SECONDARY_FIRE: "secondaryFire"
}

export default class BattleRoyale extends Game {
  constructor(params) {
    super(Object.assign(params, { requestPointerLock: true }));
    this.maps = params.maps;

    this.physicsEngine = new PhysicsEngine();
    this.renderingEngine = new PerspectiveRenderingEngine({
      context: this.context
    });
    this.particleEngine = new ParticleEngine({
      context: this.context
    });
    this.menus = params.menus;
    let scale = this.canvas.width / 1000;

    this.gameState = {
      cursor: {
        position: {
          x: params.canvas.width / 2,
          y: params.canvas.height / 2
        }
      },
      characters: [],
      projectiles: [],
      dynamicObjects: [],
      staticObjects: []
    };

    //this.addEventHandler(Game.EVENT.PAUSE, () => this.pause());
    this.keyBindings[KEY_CODE.W] = EVENTS.MOVE_UP;
    this.keyBindings[KEY_CODE.S] = EVENTS.MOVE_DOWN;
    this.keyBindings[KEY_CODE.A] = EVENTS.MOVE_LEFT;
    this.keyBindings[KEY_CODE.D] = EVENTS.MOVE_RIGHT;
    this.keyBindings["leftClick"] = EVENTS.PRIMARY_FIRE;
    this.keyBindings["rightClick"] = EVENTS.SECONDARY_FIRE;
    this.activeEvents = [];

    // this.eventHandlers = {};
    // this.eventHandlers[EVENT.PAUSE] = () => {
    //   this.pause();
    // };
    this.addEventHandler(EVENTS.MOVE_UP, (event) => this.move(event));
    this.addEventHandler(EVENTS.MOVE_DOWN, (event) => this.move(event));
    this.addEventHandler(EVENTS.MOVE_LEFT, (event) => this.move(event));
    this.addEventHandler(EVENTS.MOVE_RIGHT, (event) => this.move(event));
    this.addEventHandler(EVENTS.PRIMARY_FIRE, (event) => this.primaryFire(event));
    this.addEventHandler(EVENTS.SECONDARY_FIRE, (event) => this.secondaryFire(event));

    this.stateFunctions[Game.STATE.PLAYING].update = (elapsedTime) => this._update(elapsedTime);
    this.stateFunctions[Game.STATE.PLAYING].render = (elapsedTime) => this._render(elapsedTime);

    // this.stateFunctions[Game.STATE.PAUSED].update = _.noop;//(elapsedTime) => this._update(elapsedTime);
    // this.stateFunctions[Game.STATE.PAUSED].render = _.noop;//(elapsedTime) => this._render(elapsedTime);
    // this.stateFunctions[Game.STATE.DONE].processInput = _.noop;
    // this.stateFunctions[Game.STATE.DONE].update = (elapsedTime) => this._update(elapsedTime);
    // this.stateFunctions[Game.STATE.DONE].render = (elapsedTime) => this._render(elapsedTime);
    // this.stateFunctions[Game.STATE.GAME_OVER].processInput = _.noop;
    // this.stateFunctions[Game.STATE.GAME_OVER].update = (elapsedTime) => this.updateGameOver(elapsedTime);
    // this.stateFunctions[Game.STATE.GAME_OVER].render = (elapsedTime) => this.renderGameOver(elapsedTime);
    // this.stateFunctions[Game.STATE.INITIALIZING].update = _.noop;//(elapsedTime) => this._update(elapsedTime);
    // this.stateFunctions[Game.STATE.INITIALIZING].render = _.noop;//(elapsedTime) => this._render(elapsedTime);

  }

  updateObjects(objects) {
    for (const object of objects) {
      object.simulation = false;
      if (object.type === "Character") {
        let character = new Character(object);
        if (character.isPlayer) {
          this.gameState.player = character;
        }
        this.gameState.characters.push(character);
      } else if (object.type === "Building") {
        this.gameState.staticObjects.push(new Building(object));
      }
    }
  }

  handleMouseMove(event) {
    // TODO: put in cursor update function
    let x = this.gameState.cursor.position.x + event.movementX;
    let y = this.gameState.cursor.position.y + event.movementY;
    this.gameState.cursor.position.x = x;
    this.gameState.cursor.position.y = y;
    if (this.gameState.cursor.position.x > this.canvas.width) {
      this.gameState.cursor.position.x = this.canvas.width;
    } else if (this.gameState.cursor.position.x < 0) {
      this.gameState.cursor.position.x = 0;
    }
    if (this.gameState.cursor.position.y > this.canvas.height) {
      this.gameState.cursor.position.y = this.canvas.height;
    } else if (this.gameState.cursor.position.y < 0) {
      this.gameState.cursor.position.y = 0;
    }
    //this.gameState.cursor.position.x =  Math.min(Math.max(x, 0), this.gameSettings.playArea.width - this.gameState.cursor.width);
  }
  
  normalize(point) {
    if (point) {
      let norm = Math.sqrt(point.x * point.x + point.y * point.y);
      if (norm !== 0) {
        return {
          x: point.x / norm,
          y: point.y / norm
        }
      }
    }
    return point;
  }

  primaryFire(event) {
    if (event.release) {
      this.gameState.player.fireReady = true;
    } else if (this.gameState.player.fireReady) {
      this.gameState.player.attack(1000);
      this.gameState.player.fireReady = false;
      let direction = this.normalize({
        x: this.gameState.cursor.position.x - this.canvas.width / 2,
        y: this.gameState.cursor.position.y - this.canvas.height / 2 + 32
      });
      this.gameState.projectiles.push(new Projectile({
        position: {
          x: this.gameState.player.position.x + (this.gameState.player.width + 5) * direction.x,
          y: this.gameState.player.position.y + (this.gameState.player.height + 5) * direction.y - 10,
          z: this.gameState.player.position.z
        },
        direction: direction
      }));
    }
  }

  secondaryFire(event) {
    if (event.release) {
      this.gameState.player.fireReady = true;
    } else if (this.gameState.player.fireReady) {
      this.gameState.player.attack(2000);
      this.gameState.player.fireReady = false;
      let position = {
        x: this.gameState.player.position.x + (this.gameState.cursor.position.x - this.canvas.width / 2),
        y: this.gameState.player.position.y + (this.gameState.cursor.position.y - this.canvas.height / 2)
      };
      this.gameState.dynamicObjects.push(new Magic({
        target: position,
        source: this.gameState.player.center,
        type: "snake"
      }));
    }
  }

  move(event) {
    let direction = {
      x: 0,
      y: 0
    };
    if (event.release) {
      _.pull(this.activeEvents, event.event);
    } else {
      this.activeEvents.push(event.event);
    }

    if (this.activeEvents.includes(EVENTS.MOVE_UP)) {
      direction.y -= 1;
    }
    if (this.activeEvents.includes(EVENTS.MOVE_DOWN)) {
      direction.y += 1;
    }
    if (this.activeEvents.includes(EVENTS.MOVE_LEFT)) {
      direction.x -= 1;
    }
    if (this.activeEvents.includes(EVENTS.MOVE_RIGHT)) {
      direction.x += 1;
    }
    this.gameState.player.setDirection(direction);
  }

  getRenderObjects() {
    return this.gameState.staticObjects
      .concat(this.gameState.dynamicObjects)
      .concat(this.gameState.characters)
      .concat(this.gameState.projectiles);
  }

  getPhysicsObjects() {
    return this.gameState.staticObjects
      .concat(this.gameState.dynamicObjects)
      .concat(this.gameState.characters)
      .concat(this.gameState.projectiles);
  }

  _render(elapsedTime) {
    this.context.save();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.maps[this.gameState.player.position.z]) {
      this.maps[this.gameState.player.position.z].render(this.context, this.gameState.player.position);
    }
    this.renderingEngine.render(this.getRenderObjects(), elapsedTime, this.gameState.player.position);
    this.particleEngine.render(elapsedTime, this.gameState.player.position);

    // TODO: put somewhere else
    // Render cursor
    this.context.beginPath();
    this.context.arc(this.gameState.cursor.position.x, this.gameState.cursor.position.y, 5, 0, 2 * Math.PI);
    this.context.closePath();

    this.context.strokeStyle = "red";
    this.context.stroke();

    this.context.restore();
  }

  _update(elapsedTime) {
    this.gameState.player.setTarget({
      x: this.gameState.cursor.position.x + (this.gameState.player.position.x - this.canvas.width / 2),
      y: this.gameState.cursor.position.y + (this.gameState.player.position.y - this.canvas.height / 2)
    });
    this.gameState.player.update(elapsedTime);
    for (const obj of this.getPhysicsObjects()) {
      obj.update(elapsedTime);
    }
    let collisions = this.physicsEngine.update(elapsedTime, this.getPhysicsObjects());

    for (const collision of collisions) {
      if (collision.source instanceof Projectile) {
        if (collision.target instanceof Character) {
          collision.target.damage(collision.source);
          // TODO: add effect based on character
          if (collision.target.damagedEffect) {
            this.particleEngine.addEffect(new AnimationEffect({
              position: {
                x: collision.target.center.x,
                y: collision.target.center.y
              },
              duration: 1000
            }, collision.target.damagedEffect));
          }
          // if (!character.dead && character.currentHealth <= 0) {
          //   character.kill();
          // }
          if (!collision.source.projectile.punchThrough) {
            _.remove(this.gameState.projectiles, collision.source);
          }
        } else {
          _.remove(this.gameState.projectiles, collision.source);
        }
      } else {
        // collision.source.position.x = collision.source.lastPosition.x;
        // collision.source.position.y = collision.source.lastPosition.y;
      }
    }

    for (const projectile of this.gameState.projectiles) {
      if (projectile.distanceTravelled >= projectile.projectile.effect.range) {
        _.remove(this.gameState.projectiles, projectile);
      }
    }

    for (const character of this.gameState.characters) {
      if (!character.dead && character.currentHealth <= 0) {
        character.kill();
      }
    }

    this.particleEngine.update(elapsedTime);

    _.remove(this.gameState.dynamicObjects, "done");
    _.remove(this.gameState.projectiles, "done");
    // TODO: remove objects outside of game bounds
  }
}
