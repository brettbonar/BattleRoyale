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

const DAMAGE_RATE = 100;
const HEAL_RATE = 1;

const SHADOW_SPAWNS = [
  // {
  //   name: "Shadow Bat",
  //   characterInfo: {
  //     type: "shadow_bat"
  //   },
  //   weight: 5
  // },
  // {
  //   name: "Shadow Wolf",
  //   characterInfo: {
  //     type: "shadow_wolf"
  //   },
  //   weight: 10
  // },
  {
    name: "Shadow Ranger",
    characterInfo: {
      type: "humanoid",
      gender: "male",
      body: "shadow_acolyte"
    },
    state: {
      loadout: {
        weapon: equipment.shadowBow,
        torso: equipment.shadowLeatherChestMale,
        legs: equipment.shadowPantsMale,
        head: equipment.shadowHoodMale,
        feet: equipment.blackShoesMale,
        belt: equipment.shadowBeltMale,
        shoulders: equipment.shadowLeatherShouldersMale,
        hands: equipment.shadowBracersMale,
        back: equipment.shadowQuiver,
        offhand: equipment.shadowArrow
      }
    },
    weight: 10
  }
];

export default class ShadowField extends GameObject {
  constructor(params) {
    super(params);
    this.type = "ShadowField";
    this.renderClipped = true;
    this.physics.surfaceType = SURFACE_TYPE.NONE;
    this.shadowCenter = new Vec3(params.shadowCenter);
    this.shadowRadius = params.shadowRadius;
    this.currentTime = 0;
    this.targets = new Set();

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
    this.physics.surfaceType = SURFACE_TYPE.GAS;

    _.defaults(this, {
      collapseRate: 15
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

    return new Character({
      level: target.level,
      team: Teams.SHADOW,
      characterInfo: spawn.characterInfo,
      isPlayer: true,
      playerId: target.playerId,
      simulation: true,
      state: spawn.state,
      position: position
    });
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
        if (target.state.dead && target.isPlayer) {
          let spawn = this.getRandomSpawn(target);
          updates.push({
            remove: target,
            create: spawn,
            event: {
              eventType: "playerAvatarChange",
              playerId: target.playerId,
              objectId: spawn.objectId
            }
          });
        } else if (!target.state.dead) {
          if (target.state.currentMana) {
            target.state.currentMana = Math.max(0, target.state.currentMana - damageRate);
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
      this.shadowRadius = Math.max(0, this.shadowRadius - (this.collapseRate * (elapsedTime / 1000)));
      this.modelDimensions.dimensions.radius = this.shadowRadius;
      this.functions[0].bounds.dimensions.radius = this.shadowRadius;
      this.updatePosition();
      this.renderer.update(elapsedTime);

      return this.handleTargets(elapsedTime);
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
