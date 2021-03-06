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

import actions from "./Scripts/actions.mjs"
import createScript from "./Scripts/Script.mjs"
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
import RenderObject from "./Objects/RenderObject.mjs"
import ImageCache from "../Engine/Rendering/ImageCache.mjs"
import ParticleEffect from "../Engine/Effects/ParticleEffect.mjs"
import Grid from "../Engine/Grid.mjs"
import LevelGrids from "../Engine/LevelGrids.mjs";
import magicEffects from "./Magic/magicEffects.mjs";
import attacks from "./Magic/attacks.mjs"

let sequenceNumber = 1;

export default class BattleRoyale extends Game {
  constructor(params) {
    super(params);
    
    // TODO: create a separate render grid?
    this.players = params.players;
    this.grid = new LevelGrids(100);
    this.physicsEngine = new PhysicsEngine(this.grid);
    this.updates = [];
    this.delayedUpdates = [];
    this.collisions = [];
    this.modified = [];
    this.maps = params.maps;
    // TODO: create grid for each level

    this.gameState = {
      objects: [],
      killed: [],
      characters: [],
      scripts: [],
      collisions: []
    };
    this.broadcastEvents = [];

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
    if (object instanceof Character) {
      this.gameState.characters.push(object);
    }
    this.grid.add(object);
  }

  removeObject(object) {
    this.grid.remove(object);
    _.pull(this.gameState.objects, object);
    if (object instanceof Character) {
      _.pull(this.gameState.characters, object);
    }
    if (object.audio && object.audio.length > 0) {
      for (const audio of object.audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      object.audio.length = 0;
    }
  }

  addScript(script) {
    this.gameState.scripts.push(script);
  }

  createAttack(character, params, attack, timeDiff, mods, action, animateOnly) {
    if (attack.type === "projectile" && !animateOnly) {
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
    } else if (attack.type === "magic" && !animateOnly) {
      this.addObject(Magic.create({
        type: "Magic",
        source: character,
        attackType: attack.name,
        direction: character.state.target.minus(character.attackCenter).normalize(),        
        position: character.state.target,
        simulation: this.simulation
      }));
    } else if (attack.type === "script") {
      this.addScript(createScript(attack.effect.runScript, {
        source: character,
        //elapsedTime: timeDiff
      }));
    }
  }

  getAction(character, params) {
    let weapon = equipment[character.state.loadout.weapon];
    if (character.state.dead || !weapon) return;

    let action = attacks[weapon.attacks[params.attackType]];
    if (!action) {
      action = magicEffects[weapon.attacks[params.attackType]];
    }
    if (!action) {
      action = actions[weapon.attacks[params.attackType]];
    }

    return action;
  }

  doAttack(character, params, attack, elapsedTime, animateOnly) {
    return character.doAction("attack", params.release, attack.action, elapsedTime, 
      (timeDiff, mods, action) => {
      this.createAttack(character, params, attack, timeDiff, mods, action, animateOnly);
    }, null, params.actionId);
  }
  
  getPhysicsObjects() {
    return this.gameState.objects;
    // return this.gameState.staticObjects
    //   .concat(this.gameState.dynamicObjects)
    //   .concat(this.gameState.characters)
    //   .concat(this.gameState.projectiles);
  }

  getInteraction(target) {
    if (!target.state.canInteract) {
      return null;
    }

    let interactions = _.filter(this.grid.getAdjacentCollision(target), (obj) => {
      return obj.isInteractable && (!(obj instanceof Item) || target.state.canPickUp) &&
        obj.interactionsBounds.some((box) => 
          target.collisionBounds.some((targetBounds) => box.intersects(targetBounds)));
    });
    return _.minBy(interactions, (interaction) => {
      // TODO: may want to consider interaction dimensions offset
      return getDistance(target.center, interaction.center);
    });
  }

  handleObjectUpdate(result) {
    let updates = _.castArray(result);
    for (const update of updates) {
      if (update.delay) {
        this.delayedUpdates.push({
          elapsedTime: 0,
          update: update
        });
      } else {
        this.handleUpdate(update);
      }
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

    let updates = [];
    for (const script of this.gameState.scripts) {
      let update = script.update(elapsedTime);
      if (update) {
        this.handleObjectUpdate(update);
      }
    }
    _.remove(this.gameState.scripts, "done");

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
        if (obj._modified) {
          // TODO: may do this twice for some objects if it is updated in physics engine
          this.grid.update(obj);
        }
        if (update) {
          this.handleObjectUpdate(update);
        }
      }
    }

    this.physicsEngine.update(elapsedTime, this.getPhysicsObjects(), this.grid);

    // TODO: don't simulate projectile collisions on client. Send collision results to client instead.
    this.gameState.collisions = this.gameState.collisions.concat(
      this.physicsEngine.getCollisions(this.getPhysicsObjects(), this.grid));
    // this.physicsEngine.getCollisions(_.map(collisions, "source"))
    //   .filter((obj) => !(obj instanceof Projectile && obj.effect.path === "beam"));

    // if (this.gameState.collisions.length > 0) {
    //   console.log(this.gameState.collisions);
    // }

    for (const collision of this.gameState.collisions) {
      this.handleCollision(collision);
    }

    for (const character of this.gameState.characters) {
      if (character.state.dead && !this.gameState.killed.includes(character)) {
        this.gameState.killed.push(character);
        if (this.onKill) {
          this.onKill(character);
        }
      }
    }

    for (let i = this.delayedUpdates.length - 1; i >= 0; i--) {
      let update = this.delayedUpdates[i];
      update.elapsedTime += elapsedTime;
      if (update.elapsedTime >= update.update.delay) {
        this.handleUpdate(update.update);
        this.delayedUpdates.splice(i, 1);
      }
    }

    this.collisions = this.gameState.collisions.slice();
    this.gameState.collisions.length = 0;
  }
}
