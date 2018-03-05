import KEY_CODE from "../util/keyCodes.js"
import Game from "../Engine/Game.js"
import GameObject from "../Engine/GameObject/GameObject.js"
import Bounds from "../Engine/GameObject/Bounds.js"
import FloatingText from "../Graphics/FloatingText.js"
import PhysicsEngine from "../Engine/Physics/PhysicsEngine.js"
import PerspectiveRenderingEngine from "../Engine/Rendering/PerspectiveRenderingEngine.js"
import ParticleEngine from "../Engine/Effects/ParticleEngine.js"
import { MOVEMENT_TYPE } from "../Engine/Physics/PhysicsConstants.js"

import ObjectRenderer from "./Renderers/ObjectRenderer.js"
import Character from "./Objects/Character.js"
import Projectile from "./Objects/Projectile.js"
import objects from "./Objects/objects.js"
import objects32 from "./Objects/objects-32.js"
import Building from "./Objects/Building.js";

const EVENTS = {
  MOVE_UP: "moveUp",
  MOVE_DOWN: "moveDown",
  MOVE_LEFT: "moveLeft",
  MOVE_RIGHT: "moveRight",
  PRIMARY_FIRE: "primaryFire"
}

export default class BattleRoyale extends Game {
  constructor(params) {
    super(Object.assign(params, { requestPointerLock: true }));
    this.map = params.map;
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
      player: new Character({
        body: "tanned",
        gender: "male",
        loadout: {
          weapon: "../../Assets/character/weapons/both hand/spear.png",
          torso: "../../Assets/character/torso/leather/chest_male.png",
          pants: "../../Assets/character/legs/pants/male/teal_pants_male.png",
          head: "../../Assets/character/head/hoods/male/cloth_hood_male.png",
          feet: "../../Assets/character/feet/shoes/male/brown_shoes_male.png",
          hands: "../../Assets/character/hands/bracers/male/leather_bracers_male.png"          
        },
        position: {
          x: 255,
          y: 255
        }
      }),
      cursor: {
        position: {
          x: params.canvas.width / 2,
          y: params.canvas.height / 2
        }
      },
      dynamicObjects: [],
      staticObjects: []
    };


    //this.addEventHandler(Game.EVENT.PAUSE, () => this.pause());
    this.keyBindings[KEY_CODE.W] = EVENTS.MOVE_UP;
    this.keyBindings[KEY_CODE.S] = EVENTS.MOVE_DOWN;
    this.keyBindings[KEY_CODE.A] = EVENTS.MOVE_LEFT;
    this.keyBindings[KEY_CODE.D] = EVENTS.MOVE_RIGHT;
    this.keyBindings["leftclick"] = EVENTS.PRIMARY_FIRE;

    // this.eventHandlers = {};
    // this.eventHandlers[EVENT.PAUSE] = () => {
    //   this.pause();
    // };
    this.addEventHandler(EVENTS.MOVE_UP, (event) => this.move(event));
    this.addEventHandler(EVENTS.MOVE_DOWN, (event) => this.move(event));
    this.addEventHandler(EVENTS.MOVE_LEFT, (event) => this.move(event));
    this.addEventHandler(EVENTS.MOVE_RIGHT, (event) => this.move(event));
    this.addEventHandler(EVENTS.PRIMARY_FIRE, (event) => this.primaryFire(event));

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

    // for (let i = 0; i < 10; i++) {
    //   let type = _.sample(_.filter(objects, { biome: "death" }));
    //   //let type = _.sample(objects);
    //   //type = objects.deadTree;
    //   this.gameState.staticObjects.push(new GameObject(Object.assign({
    //     position: {
    //       x: _.random(0, this.canvas.width),
    //       y: _.random(0, this.canvas.height)
    //     },
    //     renderer: new ObjectRenderer(Object.assign({}, type))
    //   }, type)));
    // }

    // let x = 250;
    // let y = 250;
    // for (let i = 0; i < 10; i++) {
    //   for (let j = 0; j < 5; j++) {
    //     let type = _.sample(_.filter(objects, { group: "corn" }));
    //     this.gameState.staticObjects.push(new GameObject(Object.assign({
    //       position: {
    //         x: x + i * (objects.corn1.imageDimensions.width * 3/4) + y,
    //         y: y + j * (objects.corn1.imageDimensions.height / 3)
    //       },
    //       renderer: new ObjectRenderer(Object.assign({}, type))
    //     }, type)));
    //   }
    // }

    // this.gameState.staticObjects.push(new Building({
    //   type: "house",
    //   position: {
    //     x: 500,
    //     y: 500
    //   }
    // }));
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
      this.fireReady = true;
    } else if (this.fireReady) {
      this.fireReady = false;
      let direction = this.normalize({
        x: this.gameState.cursor.position.x - this.canvas.width / 2,
        y: this.gameState.cursor.position.y - this.canvas.height / 2
      });
      this.gameState.dynamicObjects.push(new Projectile({
        position: {
          x: this.gameState.player.position.x + direction.x * 16,
          y: this.gameState.player.position.y + direction.y * 16,
        },
        direction: direction
      }));
    }
  }

  move(event) {
    if (event.event === EVENTS.MOVE_UP) {
      this.gameState.player.setDirection({ y: event.release ? 0 : -1 });
    } else if (event.event === EVENTS.MOVE_DOWN) {
      this.gameState.player.setDirection({ y: event.release ? 0 : 1 });
    } else if (event.event === EVENTS.MOVE_LEFT) {
      this.gameState.player.setDirection({ x: event.release ? 0 : -1 });
    } else if (event.event === EVENTS.MOVE_RIGHT) {
      this.gameState.player.setDirection({ x: event.release ? 0 : 1 });
    }
  }

  getRenderObjects() {
    return this.gameState.staticObjects.concat(this.gameState.dynamicObjects).concat([this.gameState.player]);
  }

  getPhysicsObjects() {
    return this.gameState.staticObjects.concat(this.gameState.dynamicObjects).concat([this.gameState.player]);
  }

  _render(elapsedTime) {
    this.context.save();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.map.render(this.context, this.gameState.player.position);
    this.renderingEngine.render(this.getRenderObjects(), elapsedTime, this.gameState.player.position);

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
    let collisions = this.physicsEngine.update(elapsedTime, this.getPhysicsObjects());

    for (const collision of collisions) {
      if (collision.source instanceof Projectile) {
        _.remove(this.gameState.dynamicObjects, collision.source);
      }
    }

    // TODO: remove objects outside of game bounds
  }
}
