import BattleRoyale from "./BattleRoyale.mjs"

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

export default class BattleRoyaleServer extends BattleRoyale {
  constructor(params) {
    super(params);
    this.updateHandlers = {
      changeDirection: (data, elapsedTime) => this.changeDirectionEvent(data, elapsedTime),
      changeTarget: (data, elapsedTime) => this.changeTargetEvent(data, elapsedTime),
      attack: (data, elapsedTime) => this.attackEvent(data, elapsedTime),
      use: (data, elapsedTime) => this.useEvent(data, elapsedTime),
      changeAltitude: (data, elapsedTime) => this.changeAltitudeEvent(data, elapsedTime),
      nextWeapon: (data, elapsedTime) => this.nextWeaponEvent(data, elapsedTime),
      previousWeapon: (data, elapsedTime) => this.previousWeaponEvent(data, elapsedTime)
    };
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
    if (object) {
      object.nextWeapon();
    }
  }

  previousWeaponEvent(data, elapsedTime) {
    let object = _.find(this.gameState.objects, {
      playerId: data.source.playerId,
      objectId: data.source.objectId
    });
    if (object) {
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
    if (object) {
      let target = this.getInteraction(object);
      if (target) {
        target.interact(object);
      }
    }
  }

  changeTargetEvent(data, elapsedTime) {
    let object = _.find(this.gameState.objects, {
      playerId: data.source.playerId,
      objectId: data.source.objectId
    });
    if (object) {
      //object.target = data.target;
      object.setTarget(data.target);
      object.revision = data.source.revision;
      object.elapsedTime = elapsedTime || 0;
    }
  }

  changeDirectionEvent(data, elapsedTime) {
    let object = _.find(this.gameState.objects, {
      playerId: data.source.playerId,
      objectId: data.source.objectId
    });
    if (object) {
      object.setDirection(data.direction);
      object.revision = data.source.revision;
      object.elapsedTime = elapsedTime || 0;
    }
  }

  attackEvent(data, elapsedTime) {
    let object = _.find(this.gameState.objects, {
      playerId: data.source.playerId,
      objectId: data.source.objectId
    });
    if (object) {
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

  attack(event, attackType) {
    let source = {
      playerId: this.player.playerId,
      objectId: this.gameState.player.objectId
    };

    this.doAttack(this.gameState.player, {
      source: source,
      attackType: attackType,
      release: event.release
    });
  }
}
