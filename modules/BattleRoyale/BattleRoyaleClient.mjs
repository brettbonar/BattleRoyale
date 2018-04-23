import BattleRoyale from "./BattleRoyale.mjs"
import BattleRoyaleInterface from "./BattleRoyaleInterface.mjs"

import KEY_CODE from "../util/keyCodes.mjs"
import Game from "../Engine/Game.mjs"
import GameObject from "../Engine/GameObject/GameObject.mjs"
import Vec3 from "../Engine/GameObject/Vec3.mjs"
import Bounds from "../Engine/GameObject/Bounds.mjs"
import FloatingText from "../Graphics/FloatingText.mjs"
import PhysicsEngine from "../Engine/Physics/PhysicsEngine.mjs"
import PerspectiveRenderingEngine from "../Engine/Rendering/PerspectiveRenderingEngine.mjs"
import ParticleEngine from "../Engine/Effects/ParticleEngine.mjs"
import AnimationEffect from "../Engine/Effects/AnimationEffect.mjs"
import { SURFACE_TYPE, MOVEMENT_TYPE } from "../Engine/Physics/PhysicsConstants.mjs"
import { getDistance } from "../util.mjs"
import GameSettings from "../Engine/GameSettings.mjs"

import ObjectRenderer from "./Renderers/ObjectRenderer.mjs"
import Character from "./Characters/Character.mjs"
import Projectile from "./Objects/Projectile.mjs"
import objects from "./Objects/objects.mjs"
import equipment from "./Objects/equipment.mjs"
import Building from "./Buildings/Building.mjs"
import Magic from "./Magic/Magic.mjs"
import StaticObject from "./Objects/StaticObject.mjs"
import Item from "./Objects/Item.mjs"
import effects from "./Effects/effects.mjs"
import attacks from "./Magic/attacks.mjs"
import RenderObject from "./Objects/RenderObject.mjs"
import ImageCache from "../Engine/Rendering/ImageCache.mjs"
import ParticleEffect from "../Engine/Effects/ParticleEffect.mjs";
import FieldOfView from "../Engine/FieldOfView.mjs";
import SpawnMap from "./StartArea/SpawnMap.mjs"
import ShadowField from "./Shadow/ShadowField.mjs";
import Canvas from "../Engine/Rendering/Canvas.mjs";
import Teams from "./Teams.mjs"
import Door from "./Objects/Door.mjs";
import Portal from "./Objects/Portal.mjs";
import Boundary from "./Objects/Boundary.mjs";

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
  FLY_UP: "raiseAltitude",
  FLY_DOWN: "lowerAltitude",
  SHOW_MAP: "showMap",
  SHOW_SCORES: "showScores",
  SHOW_MENU: "showMenu"
}

let sequenceNumber = 1;

export default class BattleRoyaleClient extends BattleRoyale {
  constructor(params) {
    super(Object.assign(params, { requestPointerLock: true }));

    if (params.mapCanvas) {
      this.mapCanvas = params.mapCanvas;
      this.mapContext = params.mapCanvas.getContext("2d");
    }
    let temp = Canvas.create(this.canvas);
    this.tempCanvas = temp.canvas;
    this.tempContext = temp.context;

    this.crosshairImage = ImageCache.get("/Assets/crosshairs/image0044.png");

    // this.tempContext.mozImageSmoothingEnabled = false;
    // this.tempContext.webkitImageSmoothingEnabled = false;
    // this.context.mozImageSmoothingEnabled = false;
    // this.context.webkitImageSmoothingEnabled = false;

    this.renderingEngine = new PerspectiveRenderingEngine({
      context: this.tempContext
    });

    _.each(this.maps, (map) => {
      map.createMinimap(this.renderingEngine);
    });

    this.particleEngine = new ParticleEngine({
      context: this.tempContext
    }, this.grid);

    this.menus = params.menus;
    this.updates = [];
    this.pendingUpdates = [];
    this.objectUpdates = [];

    this.gameState.cursor = {
      position: {
        x: params.canvas.width / 2,
        y: params.canvas.height / 2 + 256
      }
    };

    this.interface = new BattleRoyaleInterface({
      players: this.players
    });
    this.pendingCollisions = [];
    this.pendingRemoves = [];

    //this.addEventHandler(Game.EVENT.PAUSE, () => this.pause());
    this.keyBindings[KEY_CODE.W] = EVENTS.MOVE_UP;
    this.keyBindings[KEY_CODE.S] = EVENTS.MOVE_DOWN;
    this.keyBindings[KEY_CODE.A] = EVENTS.MOVE_LEFT;
    this.keyBindings[KEY_CODE.D] = EVENTS.MOVE_RIGHT;
    this.keyBindings[KEY_CODE.E] = EVENTS.USE;
    this.keyBindings[KEY_CODE.Q] = EVENTS.PREVIOUS_WEAPON;
    this.keyBindings[KEY_CODE.R] = EVENTS.NEXT_WEAPON;
    this.keyBindings[KEY_CODE.M] = EVENTS.SHOW_MAP;
    this.keyBindings[KEY_CODE.SPACE] = EVENTS.FLY_UP;
    this.keyBindings[KEY_CODE.SHIFT] = EVENTS.FLY_DOWN;
    this.keyBindings[KEY_CODE.TAB] = EVENTS.SHOW_SCORES;
    this.keyBindings[KEY_CODE.ESCAPE] = EVENTS.SHOW_MENU;
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
    this.addEventHandler(EVENTS.FLY_UP, (event) => this.flyUp(event));
    this.addEventHandler(EVENTS.FLY_DOWN, (event) => this.flyDown(event));
    this.addEventHandler(EVENTS.PREVIOUS_WEAPON, (event) => this.previousWeapon(event));
    this.addEventHandler(EVENTS.NEXT_WEAPON, (event) => this.nextWeapon(event));
    this.addEventHandler(EVENTS.SHOW_MAP, (event) => this.showMap(event));
    this.addEventHandler(EVENTS.SHOW_SCORES, (event) => this.showScores(event));
    this.addEventHandler(EVENTS.SHOW_MENU, (event) => this.showMenu(event));

    this.stateFunctions[Game.STATE.PLAYING].update = (elapsedTime) => this._update(elapsedTime);
    this.stateFunctions[Game.STATE.PLAYING].render = (elapsedTime) => this._render(elapsedTime);
  }

  onGameOver(scores) {
    //this.quit();
    this.menus.show("SCOREBOARD");
  }

  showMenu(event) {
    if (!event.release) {
      this.menus.toggle("IN_GAME_MENU");
      if (this.menus.isShown("IN_GAME_MENU")) {
        this.unbindPointerLock();
      } else {
        this.bindPointerLock();
      }
    }
  }

  showScores(event) {
    if (event.release) {
      this.menus.hide("SCOREBOARD");
    } else {
      this.menus.show("SCOREBOARD");
    }
  }

  onEvents(events) {
    for (const event of events) {
      this.interface.addEvent(event);
      if (event.eventType === "kill") {
        let existing = _.find(this.gameState.objects, {
          objectId: event.killed
        });
        if (existing && !existing.state.dead) {
          existing.kill();
        }
      }
    }
  }

  initObjects(objects) {
    objects = objects || [];
    _.each(this.maps, (map) => {
      map.objects = map.objects.map((obj) => this.createObject(obj));
      objects = objects.concat(map.objects);
    });

    for (const obj of objects) {
      this.addObject(obj);
    }
  }

  showMap(event) {
    if (!event.release) {
      this.interface.showFullMap = !this.interface.showFullMap;
    }
  }

  previousWeapon(event) {
    if (event.release) return;
    this.gameState.player.previousWeapon();
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
    this.gameState.player.nextWeapon();
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
        //this.addObject(new FOV(character));
      } else if (character.isPlayer) {
        character.isOtherPlayer = true;
      }
      return character;
    } else if (object.type === "Building") {
      return new Building(object);
    } else if (object.type === "Magic") {
      object.source = _.find(this.gameState.objects, { objectId: object.ownerId });
      return new Magic(object);
    } else if (object.type === "StaticObject") {
      return new StaticObject(object);
    } else if (object.type === "Door") {
      return new Door(object);
    } else if (object.type === "Projectile") {
      object.source = _.find(this.gameState.objects, { objectId: object.ownerId });
      return new Projectile(object);
    } else if (object.type === "Item") {
      return new Item(object);
    } else if (object.type === "Portal") {
      return new Portal(object);
    } else if (object.type === "Boundary") {
      return new Boundary(object);
    } else if (object.type === "GameObject") {
      return new GameObject(object);
    } else if (object.type === "SpawnMap") {
      return new SpawnMap(object, this.maps[object.mapLevel]);
    } else if (object.type === "ShadowField") {
      return new ShadowField(object);
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
          // Don't recreate an object that has been removed
          if (!this.pendingRemoves.includes(object.objectId)) {
            let obj = this.createObject(object);
            obj.elapsedTime = (now - update.time) - elapsedTime;
            this.addObject(obj);
          }
        }
      }
    }

    this.objectUpdates.length = 0;
  }

  onCollisions(collisions) {
    for (const collision of collisions) {
      let pending = this.pendingCollisions.find((col) => {
        return col.source.objectId === collision.sourceId && col.target.objectId === collision.targetId;
      });
      if (pending) {
        _.pull(this.pendingCollisions, pending);
      } else {
        this.handleCollision({
          source: this.getObject(collision.sourceId),
          target: this.getObject(collision.targetId),
          position: new Vec3(collision.position),
          sourceBounds: collision.sourceBounds
        }, true);
      }
    }
  }

  handleCollision(collision, fromServer) {
    if (collision.source && 
        (collision.source.physics.surfaceType === SURFACE_TYPE.PROJECTILE ||
        collision.source.physics.surfaceType === SURFACE_TYPE.GAS)) {

      if (!collision.source.effect) {
        return;
      }
      
      if (collision.source.effect.noFriendlyFire) {
        // Don't damage self or other teammates if no FF is on
        if ((collision.source.team === Teams.SOLO && collision.source.source === collision.target) ||
             collision.source.team !== Teams.SOLO && collision.source.team === collision.target.team) {
          return;
        }
      }

      if (!collision.source.collided && collision.source.damageReady) {
        collision.source.collided = true;

        if (collision.target && collision.target.damagedEffect &&
            collision.source.effect.triggerDamagedEffect) {
          this.particleEngine.addEffect(new AnimationEffect({
            position: {
              x: collision.target.center.x,
              y: collision.target.center.y
            },
            level: collision.target.level
          }, effects[collision.target.damagedEffect]));
        }
        
        if (collision.source.rendering.hitEffect) {
          if (!collision.source.effect.persistAfterHit) {
            collision.source.done = true;
          }

          if (collision.source.rendering.hitEffect.particleEffect) {
            this.particleEngine.addEffect(new ParticleEffect({
              position: collision.position,
              level: collision.source.level,
              direction: collision.source.direction,
              speed: collision.source.speed,
              rotation: collision.source.rotation,
              effect: effects[collision.source.rendering.hitEffect.particleEffect]
            }));
          } else {
            let position = collision.position;
            // If location is "self" then put hit effect on same position as projectile.
            // Otherwise place it at the collision position
            if (collision.source.rendering.hitEffect.location === "self") {
              position = collision.source.position;
            }
            this.addObject(new RenderObject({
              position: position,
              //dimensions: collision.source.dimensions,
              rotation: collision.source.rotation,
              level: collision.source.level
            }, collision.source.rendering.hitEffect));
          }
        }
      }

      if (!fromServer) {
        this.pendingCollisions.push(collision);
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
      _.pull(this.pendingRemoves, obj.objectId);
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
    return new Vec3({
      x: this.gameState.player.center.x + (this.gameState.cursor.position.x - this.canvas.width / 2),
      y: this.gameState.player.center.y + (this.gameState.cursor.position.y - this.canvas.height / 2),
    });
  }

  attack(event, attackType) {
    let source = {
      playerId: this.player.playerId,
      objectId: this.gameState.player.objectId
    };

    let params = {
      source: source,
      attackType: attackType,
      release: event.release
    };

    let action = this.getAction(this.gameState.player, params);
    if (action && (this.gameState.player.canQueueAction(action.action) || this.gameState.player.isActionQueued(action.action))) {
      let actionId = this.doAttack(this.gameState.player, params, action, 0, true);
      this.sendEvent({
        type: "attack",
        source: source,
        attackType: attackType,
        release: event.release,
        actionId: actionId
      });
    }
  }

  flyDown(event) {
    if (!this.gameState.player.state.canFly) return;

    let direction = this.gameState.player.direction;
    if (event.release) {
      direction.z = 0;
    } else {
      direction.z = -1.0;
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

  flyUp(event) {
    if (!this.gameState.player.state.canFly) return;

    let direction = this.gameState.player.direction;

    if (event.release) {
      direction.z = 0;
    } else {
      direction.z = 1.0;
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

  move(event) {
    let direction = new Vec3({
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

  getVisibleBounds() {
    return new Bounds({
      position: this.gameState.player.center.minus({
        x: this.context.canvas.width / 2 + 1,
        y: this.context.canvas.height / 2 + 1
      }),
      dimensions: {
        width: this.context.canvas.width + 2,
        height: this.context.canvas.height + 2
      }
    });
  }

  getRenderObjects(bounds) {
    return this.grid.getRenderObjects(bounds, this.gameState.player.level);
  }

  handleUpdate(update) {
    if (update.effect) {
      this.particleEngine.addEffect(new AnimationEffect({
        position: update.effect.position,
        level: update.effect.level
      }, effects[update.effect.effect]));
    }
  }

  renderInteractions() {
    if (this.interaction && this.gameState.player.state.canInteract) {
      this.tempContext.save();
      this.tempContext.fillStyle = "green";
      this.tempContext.fillRect(this.interaction.center.x - 8,
        this.interaction.position.y - 20, 
        16, 16);
      this.tempContext.restore();
    }
  }

  _render(elapsedTime) {    
    this.tempContext.save();

    let visibleBounds = this.getVisibleBounds();
    
    this.tempContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.maps[this.gameState.player.level]) {
      this.maps[this.gameState.player.level].render(this.tempContext, this.gameState.player.center);
    }

    this.tempContext.save();
    // Translate to player position
    this.tempContext.translate(
      -(this.gameState.player.center.x - this.tempContext.canvas.width / 2),
      -(this.gameState.player.center.y - this.tempContext.canvas.height / 2));
    // this.tempContext.translate(
    //   -(this.gameState.player.center.x - this.tempContext.canvas.width / 2) + 0.5,
    //   -(this.gameState.player.center.y - this.tempContext.canvas.height / 2) + 0.5);

    let renderObjects = this.getRenderObjects(visibleBounds);
    let fov;
    if (!this.gameState.player.state.dead) {
      fov = new FieldOfView(this.gameState.player.fovDimensions, renderObjects);
    }
    this.renderingEngine.render(this.tempContext, renderObjects, elapsedTime,
      this.gameState.player, fov);
    //this.particleEngine.render(elapsedTime, this.gameState.player.center);
    this.renderInteractions();
    
    this.tempContext.restore();

    // Render cursor
    if (this.crosshairImage.complete) {
      this.tempContext.drawImage(this.crosshairImage,
        this.gameState.cursor.position.x - this.crosshairImage.width / 2,
        this.gameState.cursor.position.y - this.crosshairImage.height / 2);
    }

    this.tempContext.restore();

    // if (this.ui.complete) {
    //   this.tempContext.drawImage(this.ui, this.tempContext.canvas.width / 2 - 512,
    //     this.tempContext.canvas.height - 104, 1024, 104);
    // }
    this.interface.render(this.tempContext, this.gameState.player, this.maps);

    this.context.drawImage(this.tempCanvas, 0, 0, this.tempCanvas.width, this.tempCanvas.height);
  }

  sendEvent(params) {
    if (params.source) {
      params.source.revision = ++this.gameState.player.revision;
    }
    this.pendingUpdates.push(params);
    this.socket.emit("update", params);
  }

  showInteractions() {
    if (this.gameState.player.state.canInteract && !this.gameState.player.state.dead) {
      // TODO: put this in GameObject? Some other Interface?
      this.interaction = this.getInteraction(this.gameState.player);
    }
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
