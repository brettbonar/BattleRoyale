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
import Character from "./Objects/Character.mjs"
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
import ParticleEffect from "../Engine/Effects/ParticleEffect.mjs"
import Grid from "../Engine/Grid.mjs"
import LevelGrids from "../Engine/LevelGrids.mjs";
import magicEffects from "./Magic/magicEffects.mjs";

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
    
    // TODO: create a separate render grid?
    this.grid = new LevelGrids(400);
    this.physicsEngine = new PhysicsEngine(this.grid);
    this.updates = [];
    this.collisions = [];
    this.modified = [];
    this.maps = params.maps;
    // TODO: create grid for each level

    this.gameState = {
      objects: []
    };

    this.initObjects(params.objects);
    // TODO: create static objects for map boundaries. Also for ground?
  }

  initObjects(objects) {
    objects = objects || [];
    _.each(this.maps, (map) => {
      objects = objects.concat(map.objects);
    });

    for (const obj of objects) {
      this.addObject(obj);
    }
  }

  getObject(objectId) {
    return _.find(this.gameState.objects, { objectId: objectId });
  }

  addObject(object) {
    this.gameState.objects.push(object);
    // TODO: move objects between quad trees when level changes
    //this.quadTrees[object.level].push(object);
    this.grid.add(object);
  }

  removeObject(object) {
    // TODO: move objects between quad trees when level changes
    //this.quadTrees[object.level].remove(object);
    this.grid.remove(object);
    _.pull(this.gameState.objects, object);
  }

  createAttack(character, params, attack, timeDiff, mods, action) {
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
    } else if (attack.type === "magic") {
      this.addObject(Magic.create({
        type: "Magic",
        attackType: attack.name,
        position: character.state.target,
        direction: character.state.target.minus(character.attackCenter),
        simulation: this.simulation
      }));
    }
  }

  doAttack(character, params, elapsedTime) {
    let attack = attacks[character.state.loadout.weapon.attacks[params.attackType]];
    if (!attack) {
      attack = magicEffects[character.state.loadout.weapon.attacks[params.attackType]];
    }
    if (attack) {
      character.doAction("attack", params.release, attack.action, elapsedTime,
        (timeDiff, mods, action) => {
          this.createAttack(character, params, attack, timeDiff, mods, action);
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
  
  getPhysicsObjects() {
    return this.gameState.objects;
    // return this.gameState.staticObjects
    //   .concat(this.gameState.dynamicObjects)
    //   .concat(this.gameState.characters)
    //   .concat(this.gameState.projectiles);
  }

  getInteraction(target) {
    let interactions = _.filter(this.gameState.objects, (obj) => {
      return obj.isInteractable && obj.interactionsBoundingBox.some((box) => 
        target.collisionBounds.some((targetBounds) => box.intersects(targetBounds)));
    });
    return _.minBy(interactions, (interaction) => {
      // TODO: may want to consider interaction dimensions offset
      return getDistance(target.center, interaction.position);
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

  handleCollision(collision) {}

  _update(elapsedTime) {
    // for (const obj of this.gameState.objects) {
    //   //obj.elapsedTime = 0;
    //   if (obj.done && (this.simulation || obj.type === "RenderObject")) {
    //     this.removeObject(obj);
    //   }
    // }

    // TODO: move above physics?
    let updates = [];
    for (const obj of this.gameState.objects) {
      //obj.elapsedTime = 0;
      // TODO: fix this hack
      // TODO: remove objects outside of game bounds
      if (obj.done) {
        this.removeObject(obj);

        // TODO: remove this hack
        if (!this.simulation) {
          this.pendingRemoves.push(obj.objectId);
        }
      } else {
        let update = obj.update(elapsedTime);
        if (update) {
          this.onCollision(update);
        }
        // Test if a beam intersects any other beams
        // TODO: fix this so it doesn't ignore people in path of beam
        // TODO: make beams consist of start box, end box, and lines for center and sides
        // if (obj instanceof Projectile && obj.effect.path === "beam") {
        //   for (const target of this.gameState.objects) {
        //     if (target instanceof Projectile && target.effect.path === "beam") {
        //       obj.beamIntersects(target);
        //     }
        //   }
        // }
      }
    }

    this.physicsEngine.update(elapsedTime, this.getPhysicsObjects(), this.grid);

    // TODO: don't simulate projectile collisions on client. Send collision results to client instead.
    this.collisions = this.physicsEngine.getCollisions(this.getPhysicsObjects(), this.grid);
    // this.physicsEngine.getCollisions(_.map(collisions, "source"))
    //   .filter((obj) => !(obj instanceof Projectile && obj.effect.path === "beam"));
    for (const collision of this.collisions) {
      this.handleCollision(collision);
    }

    this.modified = [];
    for (const obj of this.gameState.objects) {
      if (obj.elapsedTime) {
        obj.elapsedTime = 0;
      }
      if (obj._modified) {
        this.modified.push(obj);

        // TODO: may do this twice for some objects if it is updated in physics engine
        this.grid.update(obj);
        obj._modified = false;
      }
      if (obj instanceof Character && !obj.dead && obj.currentHealth <= 0) {
        obj.kill();
        if (this.onKill) {
          this.onKill(obj);
        }
      }
    }
  }
}
