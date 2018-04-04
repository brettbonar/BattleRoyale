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
  USE: "use",
  RAISE_ALTITUDE: "raiseAltitude",
  LOWER_ALTITUDE: "lowerAltitude"
}

let sequenceNumber = 1;

export default class BattleRoyale extends Game {
  constructor(params) {
    super(params);
    
    this.physicsEngine = new PhysicsEngine(params.quadTrees);
    this.updates = [];
    this.pendingUpdates = [];

    this.gameState = {
      objects: []
    };

    if (params.objects) {
      for (const obj of params.objects) {
        this.addObject(obj);
      }
    }

    // TODO: create static objects for map boundaries. Also for ground?

    this.updateHandlers = {
      changeDirection: (data, elapsedTime) => this.changeDirectionEvent(data, elapsedTime),
      changeTarget: (data, elapsedTime) => this.changeTargetEvent(data, elapsedTime),
      attack: (data, elapsedTime) => this.attackEvent(data, elapsedTime),
      use: (data, elapsedTime) => this.useEvent(data, elapsedTime),
      changeAltitude: (data, elapsedTime) => this.changeAltitudeEvent(data, elapsedTime)
    };
  }

  addObject(object) {
    this.gameState.objects.push(object);
    // TODO: move objects between quad trees when level changes
    if (object.collisionDimensions.length > 0) {
      //this.quadTrees[object.level].push(object);
    }
  }

  removeObject(object) {
    // TODO: move objects between quad trees when level changes
    //this.quadTrees[object.level].remove(object);
    _.pull(this.gameState.objects, object);
  }

  createProjectile(character, params, attack, timeDiff, mods, action) {
    if (attack.type === "projectile") {
      // let direction = character.state.target.minus(character.attackCenter).normalize();
      // direction.z = 0;
      this.addObject(Projectile.create({
        source: character,
        action: action,
        simulation: this.simulation,
        attack: attack,
        //direction: direction,
        modifiers: mods,
        target: character.state.target,
        playerId: params.source.playerId,
        ownerId: params.source.objectId,
        //elapsedTime: timeDiff
      }));
    }
  }

  doAttack(character, params, elapsedTime) {
    let attack = attacks[character.state.loadout.weapon.attacks[params.attackType]];
    if (attack) {
      character.doAction("attack", params.release, attack.action, elapsedTime,
        (timeDiff, mods, action) => {
          this.createProjectile(character, params, attack, timeDiff, mods, action);
        });
    }
  }

  attack(event, attackType) {
    let source = {
      playerId: this.player.playerId,
      objectId: this.gameState.player.objectId
    };

    // TODO: start animation immediately
    this.doAttack(this.gameState.player, {
      source: source,
      attackType: attackType,
      release: event.release
    });
  }

  getRenderObjects() {
    return this.gameState.objects.concat(this.particleEngine.getRenderObjects());
    // return this.gameState.staticObjects
    //   .concat(this.gameState.dynamicObjects)
    //   .concat(this.gameState.characters)
    //   .concat(this.gameState.projectiles);
  }

  getPhysicsObjects() {
    return this.gameState.objects;
    // return this.gameState.staticObjects
    //   .concat(this.gameState.dynamicObjects)
    //   .concat(this.gameState.characters)
    //   .concat(this.gameState.projectiles);
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

  onCollision(result) {
    if (result.create && this.simulation) {
      result.create.simulation = this.simulation;
      if (result.create.type === "Magic") {
        this.addObject(Magic.create(result.create));
      }
      this.removeObject(result.remove);
    }
  }

  handleCollision(collision) {
    if (collision.source.physics.surfaceType === SURFACE_TYPE.PROJECTILE ||
        collision.source.physics.surfaceType === SURFACE_TYPE.GAS) {
      
      // Don't let stream weapons interact with themselves
      if (collision.source.actionId === collision.target.actionId && collision.source.effect.path === "stream") {
        return;
      }

      if (_.get(collision.target, "physics.surfaceType") === SURFACE_TYPE.CHARACTER) {
        // TODO: something else
        if (!collision.source.damagedTargets.includes(collision.target) && collision.source.damageReady) {
          collision.target.damage(collision.source);
          collision.source.damagedTargets.push(collision.target);
          // TODO: add effect based on character
          if (collision.target.damagedEffect && !this.simulation) {
            // this.particleEngine.addEffect(new AnimationEffect({
            //   position: {
            //     x: collision.target.center.x,
            //     y: collision.target.center.y
            //   },
            //   duration: 1000
            // }, collision.target.damagedEffect));
          }
        }
        // if (!character.dead && character.currentHealth <= 0) {
        //   character.kill();
        // }
        if (!collision.source.effect.punchThrough && collision.source.effect.path !== "beam") {
          this.removeObject(collision.source);
        }
      } else {
        if (collision.source.physics.surfaceType === SURFACE_TYPE.PROJECTILE &&
            collision.source.physics.elasticity === 0 && collision.source.effect.path !== "beam") {
          this.removeObject(collision.source);
        }
      }

      if (!this.simulation && collision.source.rendering.hitEffect && collision.source.damageReady) {
        if (collision.source.rendering.hitEffect.particleEffect) {
          this.particleEngine.addEffect(new ParticleEffect({
            position: collision.source.position.plus({
              x: collision.sourceBounds.width / 2,
              y: collision.sourceBounds.height / 2
            }),
            direction: collision.source.direction,
            speed: collision.source.speed,
            rotation: collision.source.rotation,
            effect: effects[collision.source.rendering.hitEffect.particleEffect]
          }));
        } else {
          this.gameState.objects.push(new RenderObject({
            position: collision.position,
            //dimensions: collision.source.dimensions,
            rotation: collision.source.rotation
          }, collision.source.rendering.hitEffect));
        }
      }

      if (collision.source.effect.path === "beam") collision.source.damageReady = false;
    } else {
      // collision.source.position.x = collision.source.lastPosition.x;
      // collision.source.position.y = collision.source.lastPosition.y;
    }

    if (collision.source.onCollision) {
      this.onCollision(collision.source.onCollision(collision));
    }
  }

  _update(elapsedTime) {
    for (const obj of this.gameState.objects) {
      obj.elapsedTime = 0;
      if (obj.done && (this.simulation || obj.type === "RenderObject")) {
        this.removeObject(obj);
      }
    }

    // TODO: move above physics?
    let updates = [];
    for (const obj of this.getPhysicsObjects()) {
      obj.elapsedTime = 0;
      // TODO: fix this hack
      // TODO: remove objects outside of game bounds
      if (obj.done && (this.simulation || obj.type === "RenderObject")) {
        this.removeObject(obj);
      } else {
        let update = obj.update(elapsedTime);
        if (update) {
          this.onCollision(update);
        }
        // Test if a beam intersects any other beams
        // TODO: fix this so it doesn't ignore people in path of beam
        // TODO: make beams consist of start box, end box, and lines for center and sides
        if (obj instanceof Projectile && obj.effect.path === "beam") {
          for (const target of this.gameState.objects) {
            if (target instanceof Projectile && target.effect.path === "beam") {
              obj.beamIntersects(target);
            }
          }
        }
      }
    }

    this.physicsEngine.update(elapsedTime, this.getPhysicsObjects());

    // TODO: don't simulate projectile collisions on client. Send collision results to client instead.
    let collisions = this.physicsEngine.getCollisions(this.getPhysicsObjects());
    // this.physicsEngine.getCollisions(_.map(collisions, "source"))
    //   .filter((obj) => !(obj instanceof Projectile && obj.effect.path === "beam"));
    for (const collision of collisions) {
      this.handleCollision(collision);
    }

    for (const character of this.gameState.objects) {
      if (character instanceof Character && !character.dead && character.currentHealth <= 0) {
        character.kill();
      }
    }
  }
}
