import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ShadowFieldRenderer from "./ShadowFieldRenderer.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"
import Bounds from "../../Engine/GameObject/Bounds.mjs";
import Vec3 from "../../Engine/GameObject/Vec3.mjs";
import Character from "../Objects/Character.mjs"
import Teams from "../Teams.mjs";
import RenderObject from "../Objects/RenderObject.mjs";

const DAMAGE_RATE = 10;
const HEAL_RATE = 1;

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
      collapseRate: 75
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

  handleTargets(elapsedTime) {
    let healRate = HEAL_RATE * (elapsedTime / 1000);
    let damageRate = DAMAGE_RATE * (elapsedTime / 1000);
    for (const target of this.targets) {
      if (target.team === Teams.SHADOW) {
        target.state.currentHealth = Math.min(target.state.maxHealth, state.state.currentHealth + healRate);
        target.state.currentMana = Math.min(target.state.maxMana, state.state.currentMana + healRate)
      } else {
        if (target.state.currentMana) {
          target.state.currentMana = Math.max(0, target.state.currentMana - damageRate);
        } else {
          target.state.currentHealth = Math.max(0, target.state.currentHealth - damageRate * 2);
        }
      }
    }

    this.targets.clear();
  }

  update(elapsedTime) {
    if (elapsedTime) {
      this.currentTime += elapsedTime;
      this.shadowRadius = Math.max(0, this.shadowRadius - (this.collapseRate * (elapsedTime / 1000)));
      this.modelDimensions.dimensions.radius = this.shadowRadius;
      this.functions[0].bounds.dimensions.radius = this.shadowRadius;
      this.updatePosition();
      this.renderer.update(elapsedTime);

      this.handleTargets(elapsedTime);
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
