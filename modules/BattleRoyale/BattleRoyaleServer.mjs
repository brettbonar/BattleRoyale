import BattleRoyale from "./BattleRoyale.mjs"

import KEY_CODE from "../util/keyCodes.mjs"
import Game from "../Engine/Game.mjs"
import GameObject from "../Engine/GameObject/GameObject.mjs"
import Vec3 from "../Engine/GameObject/Vec3.mjs"
import Bounds from "../Engine/GameObject/Bounds.mjs"
import FloatingText from "../Graphics/FloatingText.mjs"
import PhysicsEngine from "../Engine/Physics/PhysicsEngine.mjs"
import PerspectiveRenderingEngine from "../Engine/Rendering/PerspectiveRenderingEngine.mjs"
import ParticleEngine from "../Engine/Effects/ParticleEngine.mjs"
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
import lootTable from "./Objects/lootTable.mjs";
import Teams from "./Teams.mjs";

export default class BattleRoyaleServer extends BattleRoyale {
  constructor(params) {
    super(params);
    this.updateHandlers = {
      changeDirection: (data, elapsedTime) => this.changeDirectionEvent(data, elapsedTime),
      changeTarget: (data, elapsedTime) => this.changeTargetEvent(data, elapsedTime),
      attack: (data, elapsedTime) => this.attackEvent(data, elapsedTime),
      use: (data, elapsedTime) => this.useEvent(data, elapsedTime),
      nextWeapon: (data, elapsedTime) => this.nextWeaponEvent(data, elapsedTime),
      previousWeapon: (data, elapsedTime) => this.previousWeaponEvent(data, elapsedTime)
    };
    this.initTreasure();
  }

  spawnTreasure(source, tileType) {
    let treasure = _.sample(lootTable[tileType]);
    let item = equipment[treasure.itemType].world;

    let collisionBounds = source.collisionBounds;
    let minY = _.minBy(collisionBounds, (bounds) => bounds.bottom.y).y;
    let maxY = minY + 16;
    let middleX = _.sumBy(collisionBounds, (bounds) => bounds.center.x) / collisionBounds.length;
    middleX -= item.dimensions.width / 2;
    let minX = middleX - 16;
    let maxX = middleX + 16;

    // TODO: use weight
    this.addObject(new Item({
      itemType: treasure.itemType,
      position: {
        x: _.random(minX, maxX),
        y: _.random(minY, maxY)
      },
      simulation: true
    }));
    source.state = "opened";
    source.isInteractable = false;
    source._modified = true;
  }

  initTreasure() {
    for (const obj of this.gameState.objects) {
      if (obj.interactionType === "treasure") {
        let tileType = this.maps[obj.level].getTileAtPos(obj.position).type;
        obj.state = "closed";
        obj.interact = () => this.spawnTreasure(obj, tileType);
      }
    }
  }

  updateState(data, elapsedTime, eventTime) {
    if (this.updateHandlers[data.type]) {
      //handler(data, elapsedTime);
      this.updates.push({
        update: data,
        elapsedTime: 0,//elapsedTime,
        eventTime: eventTime
      });
    } else {
      console.log("Unknown update: ", data.type);
      console.log(data);
    }
  }

  nextWeaponEvent(data, elapsedTime) {
    let object = _.find(this.gameState.objects, {
      playerId: data.source.playerId,
      objectId: data.source.objectId
    });
    if (object && !object.state.dead) {
      object.nextWeapon();
    }
  }

  previousWeaponEvent(data, elapsedTime) {
    let object = _.find(this.gameState.objects, {
      playerId: data.source.playerId,
      objectId: data.source.objectId
    });
    if (object && !object.state.dead) {
      object.previousWeapon();
    }
  }
  
  // For testing
  changeAltitudeEvent(data, elapsedTime) {
    let object = _.find(this.gameState.objects, {
      playerId: data.source.playerId,
      objectId: data.source.objectId
    });
    if (object) {
      object.position.z += data.z;
      object.position.z = Math.max(0, object.position.z);
    }
  }

  useEvent(data, elapsedTime) {
    let object = _.find(this.gameState.objects, {
      playerId: data.source.playerId,
      objectId: data.source.objectId
    });
    if (object && !object.state.dead) {
      let target = this.getInteraction(object);
      if (target && target.isInteractable) {
        target.interact(object);
      }
    }
  }

  changeTargetEvent(data, elapsedTime) {
    let object = _.find(this.gameState.objects, {
      playerId: data.source.playerId,
      objectId: data.source.objectId
    });
    if (object && !object.state.dead) {
      //object.target = data.target;
      object.setTarget(data.target);
      object.revision = data.source.revision;
      //object.elapsedTime = elapsedTime || 0;
    }
  }

  changeDirectionEvent(data, elapsedTime) {
    let object = _.find(this.gameState.objects, {
      playerId: data.source.playerId,
      objectId: data.source.objectId
    });
    if (object && !object.state.dead) {
      object.revision = data.source.revision;
      if (data.position) {
        // TODO: could remove this so players cant cheat
        object.position = new Vec3(data.position);
      }
      if (_.isNumber(data.direction.z) && data.direction.z !== 0 && !object.state.canFly) {
        return;
      }
      object.setDirection(data.direction);
      //object.elapsedTime = elapsedTime || 0;
    }
  }

  attackEvent(data, elapsedTime) {
    let object = _.find(this.gameState.objects, {
      playerId: data.source.playerId,
      objectId: data.source.objectId
    });
    if (object && !object.state.dead) {
      object.revision = data.source.revision;
      this.doAttack(object, data, elapsedTime);
    }
  }

  processUpdates(elapsedTime, currentTime) {
    for (const update of this.updates) {
      let handler = this.updateHandlers[update.update.type];
      elapsedTime = update.elapsedTime + ((currentTime - update.eventTime) - elapsedTime);
      handler(update.update, elapsedTime);
    }
    this.updates.length = 0;
  }

  onKill(character) {
    if (character.isPlayer) {
      this.broadcastEvents.push({
        eventType: "kill",
        killed: character.playerId,
        killedBy: character.killedBy
      });
    }
  }

  handleCollision(collision) {
    if (collision.source.physics.surfaceType === SURFACE_TYPE.PROJECTILE ||
        collision.source.physics.surfaceType === SURFACE_TYPE.GAS) {
      
      if (!collision.source.effect) {
        return;
      }

      // Don't let stream weapons interact with themselves
      if (collision.source.actionId === collision.target.actionId && collision.source.effect.path === "stream") {
        return;
      }

      if (collision.source.effect.noFriendlyFire) {
        // Don't damage self or other teammates if no FF is on
        if ((collision.source.team === Teams.SOLO && collision.source.source === collision.target) ||
             collision.source.team !== Teams.SOLO && collision.source.team === collision.target.team) {
          return;
        }
      }

      if (collision.source.team !== Teams.SOLO &&
          collision.source.effect.noFriendlyFire && collision.source.team === collision.target.team) {
        return;
      }

      if (_.get(collision.target, "physics.surfaceType") === SURFACE_TYPE.CHARACTER) {
        // TODO: something else
        if (!collision.source.damagedTargets.includes(collision.target) && collision.source.damageReady) {
          collision.target.damage(collision.source, collision.source.effect.damage);
          collision.source.damagedTargets.push(collision.target);
        }

        if (collision.source.physics.surfaceType !== SURFACE_TYPE.GAS) {
          if (!collision.source.effect.punchThrough && collision.source.effect.path !== "beam") {
            this.removeObject(collision.source);
          }
        }
      } else {
        if (collision.source.physics.surfaceType === SURFACE_TYPE.PROJECTILE &&
            collision.source.physics.elasticity === 0 && collision.source.effect.path !== "beam") {
          this.removeObject(collision.source);
        }
      }
      if (collision.source.effect.path === "beam") collision.source.damageReady = false;
    } else {
      // collision.source.position.x = collision.source.lastPosition.x;
      // collision.source.position.y = collision.source.lastPosition.y;
    }

    if (collision.source.onCollision) {
      this.handleObjectUpdate(collision.source.onCollision(collision));
    }
  }
}
