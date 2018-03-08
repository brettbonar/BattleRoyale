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
import equipment from "./Objects/equipment.js"
import objects32 from "./Objects/objects-32.js"
import Building from "./Buildings/Building.js";
import Magic from "./Magic/Magic.js";
import GenericObject from "./Objects/GenericObject.js";

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
    this.map = params.map;
    this.undergroundMap = params.undergroundMap;

    this.physicsEngine = new PhysicsEngine();
    this.renderingEngine = new PerspectiveRenderingEngine({
      context: this.context
    });
    this.particleEngine = new ParticleEngine({
      context: this.context
    });
    this.menus = params.menus;
    let scale = this.canvas.width / 1000;

    let player = new Character({
      body: "tanned",
      gender: "male",
      isPlayer: true,
      loadout: {
        weapon: equipment.spear,
        torso: equipment.leatherChestMale,
        legs: equipment.tealPantsMale,
        head: equipment.clothHoodMale,
        feet: equipment.brownShoesMale,
        hands: equipment.leatherBracersMale
      },
      fireReady: true,
      position: {
        x: 255,
        y: 255
      }
    });

    let target = new Character({
      body: "darkelf",
      gender: "female",
      loadout: {
        weapon: equipment.spear,
        torso: equipment.leatherChestMale,
        legs: equipment.tealPantsMale,
        head: equipment.clothHoodMale,
        feet: equipment.brownShoesMale,
        hands: equipment.leatherBracersMale
      },
      isOtherPlayer: true,
      fireReady: true,
      position: {
        x: 550,
        y: 550
      }
    });

    let target2 = new Character({
      body: "darkelf",
      gender: "female",
      loadout: {
        weapon: equipment.spear,
        torso: equipment.leatherChestMale,
        legs: equipment.tealPantsMale,
        head: equipment.clothHoodMale,
        feet: equipment.brownShoesMale,
        hands: equipment.leatherBracersMale
      },
      fireReady: true,
      position: {
        x: 800,
        y: 800
      }
    });

    this.gameState = {
      cursor: {
        position: {
          x: params.canvas.width / 2,
          y: params.canvas.height / 2
        }
      },
      player: player,
      characters: [player, target, target2],
      projectiles: [],
      dynamicObjects: [
        // new Character({
        //   body: "darkelf",
        //   gender: "female",
        //   loadout: {
        //     weapon: "../../Assets/character/weapons/right hand/either/axe.png",
        //     torso: "../../Assets/character/torso/corset_female/corset_red.png",
        //     pants: "../../Assets/character/legs/pants/female/red_pants_female.png",
        //     head: "../../Assets/character/head/tiaras_female/silver.png",
        //     feet: "../../Assets/character/feet/shoes/female/black_shoes_female.png",
        //     hands: "../../Assets/character/hands/gloves/female/golden_gloves_female.png"          
        //   },
        //   position: {
        //     x: 550,
        //     y: 550
        //   }
        // })
      ],
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

    // for (let i = 0; i < 10; i++) {
    //   //let type = _.sample(_.filter(objects, { biome: "plain" }));
    //   //let type = _.sample(objects);
    //   let type = objects.plainTree;
    //   this.gameState.staticObjects.push(new GenericObject({
    //     position: {
    //       x: _.random(0, this.canvas.width),
    //       y: _.random(0, this.canvas.height)
    //     }
    //   }, type));
    // }

    // let x = 250;
    // let y = 250;
    // for (let i = 0; i < 10; i++) {
    //   for (let j = 0; j < 5; j++) {
    //     let type = _.sample(_.filter(objects, { group: "corn" }));
    //     this.gameState.staticObjects.push(new GenericObject({
    //       position: {
    //         x: x + i * (objects.corn1.imageDimensions.width * 3/4) + y,
    //         y: y + j * (objects.corn1.imageDimensions.height / 3)
    //       }
    //     }, type));
    //   }
    // }

    // this.gameState.staticObjects.push(new GenericObject({
    //   position: {
    //     x: 100,
    //     y: 350
    //   }
    // }, objects.caveEntrance));
    // this.gameState.staticObjects.push(new GenericObject({
    //   position: {
    //     x: 100,
    //     y: 450,
    //     z: -1
    //   }
    // }, objects.caveExit));

    this.gameState.staticObjects.push(new Building({
      type: "house",
      position: {
        x: 500,
        y: 500
      }
    }));
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

    if (!this.gameState.player.position.z) {
      this.map.render(this.context, this.gameState.player.position);
    } else if (this.gameState.player.position.z === -1) {
      this.undergroundMap.render(this.context, this.gameState.player.position);
    }
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
    for (const obj of this.getPhysicsObjects()) {
      obj.update(elapsedTime);
    }
    let collisions = this.physicsEngine.update(elapsedTime, this.getPhysicsObjects());

    for (const collision of collisions) {
      if (collision.source instanceof Projectile) {
        if (collision.target instanceof Character) {
          collision.target.damage(collision.source);    
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

    _.remove(this.gameState.dynamicObjects, "done");
    _.remove(this.gameState.projectiles, "done");
    // TODO: remove objects outside of game bounds
  }
}
