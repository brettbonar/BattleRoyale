import BattleRoyale from "./BattleRoyale.mjs"
import BattleRoyaleInterface from "./BattleRoyaleInterface.mjs"

import KEY_CODE from "../util/keyCodes.mjs"
import Game from "../Engine/Game.mjs"
import GameObject from "../Engine/GameObject/GameObject.mjs"
import Point from "../Engine/GameObject/Point.mjs"
import Bounds from "../Engine/GameObject/Bounds.mjs"
import FloatingText from "../Graphics/FloatingText.mjs"
import PhysicsEngine from "../Engine/Physics/PhysicsEngine.mjs"
import PerspectiveRenderingEngine from "../Engine/Rendering/PerspectiveRenderingEngine.mjs"
import ParticleEngine from "../Engine/Effects/ParticleEngine.mjs"
import { SURFACE_TYPE, MOVEMENT_TYPE } from "../Engine/Physics/PhysicsConstants.mjs"
import { getDistance } from "../util.mjs"
import GameSettings from "../Engine/GameSettings.mjs"

import ObjectRenderer from "./Renderers/ObjectRenderer.mjs"
import Character from "./Objects/Character.mjs"
import Projectile from "./Objects/Projectile.mjs"
import objects from "./Objects/objects.mjs"
import equipment from "./Objects/equipment.mjs"
import Building from "./Buildings/Building.mjs"
import Magic from "./Magic/Magic.mjs"
import StaticObject from "./Objects/StaticObject.mjs"
import Item from "./Objects/Item.mjs"
import AnimationEffect from "./Effects/AnimationEffect.mjs"
import effects from "./Effects/effects.mjs"
import attacks from "./Magic/attacks.mjs"
import RenderObject from "./Objects/RenderObject.mjs"
import ImageCache from "../Engine/Rendering/ImageCache.mjs"
import ParticleEffect from "../Engine/Effects/ParticleEffect.mjs";

const EVENTS = {
  MOVE_UP: "moveUp",
  MOVE_DOWN: "moveDown",
  MOVE_LEFT: "moveLeft",
  MOVE_RIGHT: "moveRight",
  PRIMARY_FIRE: "primaryFire",
  SECONDARY_FIRE: "secondaryFire",
  PREVIOUS_WEAPON: "previousWeapon",
  NEXT_WEAPON: "nextWeapon",
  USE: "use",
  RAISE_ALTITUDE: "raiseAltitude",
  LOWER_ALTITUDE: "lowerAltitude",
  SHOW_MAP: "showMap"
}

let sequenceNumber = 1;

export default class BattleRoyaleClient extends BattleRoyale {
  constructor(params) {
    super(Object.assign(params, { requestPointerLock: true }));

    if (params.mapCanvas) {
      this.mapCanvas = params.mapCanvas;
      this.mapContext = params.mapCanvas.getContext("2d");
    }

    this.maps = params.maps;
    this.physicsEngine = new PhysicsEngine(params.quadTrees);

    this.renderingEngine = new PerspectiveRenderingEngine({
      context: this.context
    });
    this.particleEngine = new ParticleEngine({
      context: this.context
    });
    this.menus = params.menus;
    this.updates = [];
    this.pendingUpdates = [];
    this.objectUpdates = [];

    this.gameState = {
      cursor: {
        position: {
          x: params.canvas.width / 2 + 64,
          y: params.canvas.height / 2 + 64
        }
      },
      objects: []
    };

    if (params.objects) {
      for (const obj of params.objects) {
        this.addObject(obj);
      }
    }
    this.interface = new BattleRoyaleInterface();

    //this.addEventHandler(Game.EVENT.PAUSE, () => this.pause());
    this.keyBindings[KEY_CODE.W] = EVENTS.MOVE_UP;
    this.keyBindings[KEY_CODE.S] = EVENTS.MOVE_DOWN;
    this.keyBindings[KEY_CODE.A] = EVENTS.MOVE_LEFT;
    this.keyBindings[KEY_CODE.D] = EVENTS.MOVE_RIGHT;
    this.keyBindings[KEY_CODE.E] = EVENTS.USE;
    this.keyBindings[KEY_CODE.Q] = EVENTS.PREVIOUS_WEAPON;
    this.keyBindings[KEY_CODE.R] = EVENTS.NEXT_WEAPON;
    this.keyBindings[KEY_CODE.M] = EVENTS.SHOW_MAP;
    this.keyBindings[KEY_CODE.UP] = EVENTS.RAISE_ALTITUDE;
    this.keyBindings[KEY_CODE.DOWN] = EVENTS.LOWER_ALTITUDE;
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
    this.addEventHandler(EVENTS.PRIMARY_FIRE, (event) => this.attack(event, 1));
    this.addEventHandler(EVENTS.SECONDARY_FIRE, (event) => this.attack(event, 2));
    this.addEventHandler(EVENTS.USE, (event) => this.use(event));
    this.addEventHandler(EVENTS.RAISE_ALTITUDE, (event) => this.changeAltitude(event, 10));
    this.addEventHandler(EVENTS.LOWER_ALTITUDE, (event) => this.changeAltitude(event, -10));
    this.addEventHandler(EVENTS.PREVIOUS_WEAPON, (event) => this.previousWeapon(event));
    this.addEventHandler(EVENTS.NEXT_WEAPON, (event) => this.nextWeapon(event));
    this.addEventHandler(EVENTS.SHOW_MAP, (event) => this.showMap(event));

    this.stateFunctions[Game.STATE.PLAYING].update = (elapsedTime) => this._update(elapsedTime);
    this.stateFunctions[Game.STATE.PLAYING].render = (elapsedTime) => this._render(elapsedTime);
  }

  showMap(event) {
    if (!event.release) {
      this.interface.showFullMap = !this.interface.showFullMap;
    }
  }

  previousWeapon(event) {
    if (event.release) return;
    this.sendEvent({
      type: "previousWeapon",
      source: {
        playerId: this.player.playerId,
        objectId: this.gameState.player.objectId
      }
    })
  }

  nextWeapon(event) {
    if (event.release) return;
    this.sendEvent({
      type: "nextWeapon",
      source: {
        playerId: this.player.playerId,
        objectId: this.gameState.player.objectId
      }
    })
  }

  changeAltitude(event, amount) {
    this.sendEvent({
      type: "changeAltitude",
      source: {
        playerId: this.player.playerId,
        objectId: this.gameState.player.objectId
      },
      z: amount
    });
  }

  createObject(object) {
    object.simulation = this.simulation;
    if (object.type === "Character") {
      let character = new Character(object);
      if (character.playerId === this.player.playerId) {
        this.gameState.player = character;
        character.isThisPlayer = true;
      } else if (character.isPlayer) {
        character.isOtherPlayer = true;
      }
      return character;
    } else if (object.type === "Building") {
      return new Building(object);
    } else if (object.type === "Magic") {
      return new Magic(object);
    } else if (object.type === "StaticObject") {
      return new StaticObject(object);
    } else if (object.type === "Projectile") {
      object.source = _.find(this.gameState.objects, { objectId: object.ownerId });
      return new Projectile(object);
    } else if (object.type === "Item") {
      return new Item(object);
    } else {
      console.log("Unsupported object type in createObject: " + object.type);
    }
  }

  applyUpdate(update) {
    if (update.type === "changeDirection") {
      let obj = _.find(this.gameState.objects, update.source);
      if (obj) {
        obj.setDirection(update.direction);
      }
    } else if (update.type === "changeTarget") {
      let obj = _.find(this.gameState.objects, update.source);
      if (obj) {
        obj.setTarget(update.target);
      }
    }
  }

  clearAndApplyUpdates(object) {
    for (const update of this.pendingUpdates) {
      if (update.source.revision <= object.revision) {
        _.pull(this.pendingUpdates, update);
      } else {
        //this.applyUpdate(update);
      }
    }
  }

  processUpdates(elapsedTime) {
    let now = performance.now();
    for (const update of this.objectUpdates) {
      for (const object of update.objects) {
        object.simulation = this.simulation;
        let existing = _.find(this.gameState.objects, {
          objectId: object.objectId,
          playerId: object.playerId
        });
        if (existing) {
          //if (existing.revision <= object.revision) {
            existing.updateState(object, update.elapsedTime);
          //}
            //existing.updateState(object, object.elapsedTime - (now - update.time));
          //}
          this.clearAndApplyUpdates(object);
        } else {
          let obj = this.createObject(object);
          obj.elapsedTime = (now - update.time) - elapsedTime;
          this.addObject(obj);
        }
      }
    }

    this.objectUpdates.length = 0;
  }

  onCollisions(collisions) {
    for (const collision of collisions) {
      this.handleCollision({
        source: this.getObject(collision.sourceId),
        target: this.getObject(collision.targetId),
        position: new Point(collision.position),
        sourceBounds: collision.sourceBounds
      });
    }
  }

  handleCollision(collision) {
    if (collision.source.physics.surfaceType === SURFACE_TYPE.PROJECTILE ||
        collision.source.physics.surfaceType === SURFACE_TYPE.GAS) {

      // Don't let stream weapons interact with themselves
      if (collision.target && collision.source.actionId === collision.target.actionId && collision.source.effect.path === "stream") {
        return;
      }
      
      if (collision.source.rendering.hitEffect && !collision.source.collided) {
        collision.source.collided = true;
        if (collision.source.effect.path !== "beam") {
          collision.source.visible = false;
        }

        if (collision.source.rendering.hitEffect.particleEffect) {
          this.particleEngine.addEffect(new ParticleEffect({
            position: collision.position.plus({
              x: collision.sourceBounds.width / 2,
              y: collision.sourceBounds.height / 2
            }),
            direction: collision.source.direction,
            speed: collision.source.speed,
            rotation: collision.source.rotation,
            effect: effects[collision.source.rendering.hitEffect.particleEffect]
          }));
        } else {
          this.addObject(new RenderObject({
            position: collision.position,
            //dimensions: collision.source.dimensions,
            rotation: collision.source.rotation
          }, collision.source.rendering.hitEffect));
        }
      }
    }
  }

  updateObjects(data) {
    this.objectUpdates.push({
      objects: data.objects,
      time: performance.now(),
      elapsedTime: data.elapsedTime
    });
  }

  removeObjects(objects) {
    // TODO: optimize
    for (const obj of this.gameState.objects) {
      if (objects.includes(obj.objectId)) {
        this.removeObject(obj);
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

  use(event) {
    if (event.release) {
      this.sendEvent({
        type: "use",
        source: {
          playerId: this.player.playerId,
          objectId: this.gameState.player.objectId
        }
      });
    }
  }

  getAbsoluteCursorPosition() {
    return new Point({
      x: this.gameState.player.center.x + (this.gameState.cursor.position.x - this.canvas.width / 2),
      y: this.gameState.player.center.y + (this.gameState.cursor.position.y - this.canvas.height / 2),
    });
  }

  attack(event, attackType) {
    let source = {
      playerId: this.player.playerId,
      objectId: this.gameState.player.objectId
    };

    // TODO: start animation immediately
    // this.doAttack(this.gameState.player, {
    //   source: source,
    //   attackType: attackType,
    //   release: event.release
    // });

    this.sendEvent({
      type: "attack",
      source: source,
      attackType: attackType,
      release: event.release
    });
  }

  move(event) {
    let direction = new Point({
      x: 0,
      y: 0,
      z: this.gameState.player.direction.z || 0
    });
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

    this.sendEvent({
      type: "changeDirection",
      source: {
        playerId: this.player.playerId,
        objectId: this.gameState.player.objectId
      },
      direction: direction,
      position: this.gameState.player.position
    });
  }

  renderInteractions() {
    if (this.interaction) {
      this.context.save();
      this.context.fillStyle = "green";
      this.context.fillRect(this.interaction.center.x - 8,
        this.interaction.position.y - 20, 
        16, 16);
      this.context.restore();
    }
  }

  _render(elapsedTime) {
    this.context.save();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.maps[this.gameState.player.level]) {
      this.maps[this.gameState.player.level].render(this.context, this.gameState.player.center);
    }

    this.context.save();
    // Translate to player position
    // TODO: translate to player center?
    this.context.translate(-(this.gameState.player.center.x - this.context.canvas.width / 2),
    -(this.gameState.player.center.y - this.context.canvas.height / 2));

    this.renderingEngine.render(this.getRenderObjects(), elapsedTime, this.gameState.player.center);
    //this.particleEngine.render(elapsedTime, this.gameState.player.center);
    this.renderInteractions();
    this.context.restore();

    // TODO: put somewhere else
    // Render cursor
    this.context.beginPath();
    this.context.arc(this.gameState.cursor.position.x, this.gameState.cursor.position.y, 5, 0, 2 * Math.PI);
    this.context.closePath();

    this.context.strokeStyle = "red";
    this.context.stroke();

    this.context.restore();

    // if (this.ui.complete) {
    //   this.context.drawImage(this.ui, this.context.canvas.width / 2 - 512,
    //     this.context.canvas.height - 104, 1024, 104);
    // }
    this.interface.render(this.context, this.gameState.player, this.maps);
  }

  getInteraction(target) {
    let interactions = _.filter(this.gameState.objects, (obj) => {
      return obj.interactionsBoundingBox.some((box) => box.intersects(target.boundingBox));
    });
    return _.minBy(interactions, (interaction) => {
      // TODO: may want to consider interaction dimensions offset
      return getDistance(target.position, interaction.position);
    });
  }

  sendEvent(params) {
    if (params.source) {
      params.source.revision = ++this.gameState.player.revision;
    }
    this.pendingUpdates.push(params);
    this.socket.emit("update", params);
  }

  showInteractions() {
    // TODO: put this in GameObject? Some other Interface?
    this.interaction = this.getInteraction(this.gameState.player);
  }

  _update(elapsedTime) {
    this.processUpdates(elapsedTime);
    super._update(elapsedTime);

    let target = this.getAbsoluteCursorPosition();
    if (!this.gameState.player.state.target || !target.equals(this.gameState.player.state.target)) {
      this.gameState.player.setTarget(target);

      this.sendEvent({
        type: "changeTarget",
        source: {
          playerId: this.player.playerId,
          objectId: this.gameState.player.objectId
        },
        target: target
      });
    }
    this.showInteractions();
    this.particleEngine.update(elapsedTime);


    // this.sendEvent({
    //   type: "changeDirection",
    //   source: {
    //     playerId: this.player.playerId,
    //     objectId: this.gameState.player.objectId
    //   },
    //   direction: this.gameState.player.direction,
    //   position: this.gameState.player.position
    // });
  }
}
