import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ShadowFieldRenderer from "./ShadowFieldRenderer.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"
import Bounds from "../../Engine/GameObject/Bounds.mjs";
import Vec3 from "../../Engine/GameObject/Vec3.mjs";
import Character from "../Characters/Character.mjs"
import Teams from "../Teams.mjs";
import RenderObject from "../Objects/RenderObject.mjs";
import characters from "../Characters/characters.mjs"
import equipment from "../Objects/equipment.mjs"
import effects from "../Effects/effects.mjs";

const MIN_RADIUS = 500;
const DAMAGE_RATE = 15;
const HEAL_RATE = 1;
const BUFFER_RADIUS = 512;
const COLLAPSE_RATE = 15;

const SHADOW_SPAWNS = [
  {
    name: "Shadow Bat",
    characterInfo: {
      type: "shadow_bat"
    },
    weight: 4
  },
  {
    name: "Shadow Wolf",
    characterInfo: {
      type: "shadow_wolf"
    },
    weight: 10
  },
  {
    name: "Shadow Ranger",
    characterInfo: {
      type: "humanoid",
      gender: "male",
      body: "shadow_acolyte"
    },
    state: {
      maxMana: 0,
      maxHealth: 30,
      canPickUp: false,
      loadout: {
        weapon: "shadowBow",
        torso: "shadowLeatherChestMale",
        legs: "shadowPantsMale",
        head: "shadowHoodMale",
        feet: "blackShoesMale",
        belt: "shadowBeltMale",
        shoulders: "shadowLeatherShouldersMale",
        hands: "shadowBracersMale"
      },
      items: ["shadowBow"]
    },
    weight: 10
  }
];

export default class ShadowField extends GameObject {
  constructor(params) {
    super(params);
    this.type = "ShadowField";
    this.renderClipped = true;
    this.physics.surfaceType = SURFACE_TYPE.GAS;
    this.shadowCenter = new Vec3(params.shadowCenter);
    this.shadowRadius = params.shadowRadius;
    this.currentTime = 0;
    this.targets = new Set();
    this.bufferRadius = BUFFER_RADIUS;
    this.spawnedCharacters = [];
    this.interactsWith = ["Character"];

    this.shadowSpawns = [];
    for (const spawn of SHADOW_SPAWNS) {
      for (let i = 0; i < spawn.weight; i++) {
        this.shadowSpawns.push(spawn);
      }
    }

    this.modelDimensions = {
      offset: this.shadowCenter.minus(this.position),
      dimensions: {
        radius: this.shadowRadius
      },
      boundsType: Bounds.TYPE.INVERSE_CIRCLE
    };
    this.functions = [{
      bounds: {
        offset: this.shadowCenter.minus(this.position),
        dimensions: {
          radius: this.shadowRadius
        },
        boundsType: Bounds.TYPE.INVERSE_CIRCLE
      },
      cb: (obj) => this.onCollision(obj)
    }];

    _.defaults(this, {
      collapseRate: COLLAPSE_RATE
    });

    if (!params.simulation) {
      this.renderer = new ShadowFieldRenderer(params);
    }

    this.updatePosition();
  }

  onCollision(object) {
    if (object instanceof Character) {
      this.targets.add(object);
    }
  }

  getRandomSpawn(target) {
    let spawn = _.sample(this.shadowSpawns);

    // Center spawn on top of player
    let position = target.center.minus({
      x: characters[spawn.characterInfo.type].dimensions.down.dimensions.width / 2,
      y: characters[spawn.characterInfo.type].dimensions.down.dimensions.height / 2,
      z: 0
    });

    return {
      character: new Character({
        level: target.level,
        team: Teams.SHADOW,
        characterInfo: spawn.characterInfo,
        isPlayer: true,
        playerId: target.playerId,
        simulation: true,
        state: spawn.state,
        position: position
      }),
      type: spawn.name
    };
  }

  handleTargets(elapsedTime) {
    let updates = [];

    let healRate = HEAL_RATE * (elapsedTime / 1000);
    let damageRate = DAMAGE_RATE * (elapsedTime / 1000);
    for (const target of this.targets) {
      if (target.team === Teams.SHADOW && !target.state.dead) {
        target.state.currentHealth = Math.min(target.state.maxHealth, target.state.currentHealth + healRate);
        target.state.currentMana = Math.min(target.state.maxMana, target.state.currentMana + healRate)
      } else if (target.team !== Teams.SHADOW) {
        if (target.state.dead && target.isPlayer && !this.spawnedCharacters.includes(target)) {
          let spawn = this.getRandomSpawn(target);
          updates.push({
            effect: {
              position: target.center,
              level: target.level,
              effect: "smoke"
            }
          });
          updates.push({
            delay: 5000,
            event: {
              eventType: "playerAvatarChange",
              playerId: target.playerId,
              objectId: spawn.character.objectId,
              type: spawn.type
            },
            //remove: target,
            create: spawn.character
          });
          this.spawnedCharacters.push(target);
        } else if (!target.state.dead) {
          if (target.state.currentMana) {
            let diff = target.state.currentMana - damageRate;
            target.state.currentMana = Math.max(0, diff);
            if (diff < 0) {
              target.damage(this, -diff);
            }
          } else {
            target.damage(this, damageRate);
          }
        }
      }
    }

    this.targets.clear();

    return updates;
  }

  update(elapsedTime) {
    if (elapsedTime) {
      this.currentTime += elapsedTime;
      this.shadowRadius = Math.max(MIN_RADIUS, this.shadowRadius - (this.collapseRate * (elapsedTime / 1000)));
      if (this.shadowRadius === MIN_RADIUS) {
        this.bufferRadius = Math.max(100, this.bufferRadius - (this.collapseRate * (elapsedTime / 1000)));
      }
      this.modelDimensions.dimensions.radius = this.shadowRadius;
      this.functions[0].bounds.dimensions.radius = this.shadowRadius;
      this.updatePosition();
      this.renderer.update(elapsedTime);

      return this.handleTargets(elapsedTime);
    }
  }

  render(context, elapsedTime, clipping, player) {
    // TRICKY: there are performance issues with adding this to every grid, so check here
    // if it is in view
    let bounds = new Bounds({
      position: player.center.minus({
        x: context.canvas.width / 2 + 1,
        y: context.canvas.height / 2 + 1
      }),
      dimensions: {
        width: context.canvas.width + 2,
        height: context.canvas.height + 2
      }
    });
    if (this.modelBounds.intersects(bounds)) {
      super.render(context, elapsedTime, clipping, player);
    }
  }

  getUpdateState() {
    return Object.assign(super.getUpdateState(), _.pick(this, [
      "shadowCenter",
      "shadowRadius",
      "collapseRate"
    ]));
  }
}
