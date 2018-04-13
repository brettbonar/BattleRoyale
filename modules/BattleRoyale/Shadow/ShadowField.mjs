import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ShadowFieldRenderer from "./ShadowFieldRenderer.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"
import Bounds from "../../Engine/GameObject/Bounds.mjs";
import Vec3 from "../../Engine/GameObject/Vec3.mjs";

export default class ShadowField extends GameObject {
  constructor(params) {
    super(params);
    this.type = "ShadowField";
    this.renderClipped = true;
    this.physics.surfaceType = SURFACE_TYPE.NONE;
    this.shadowCenter = new Vec3(params.shadowCenter);
    this.shadowRadius = params.shadowRadius;
    // this.modelDimensions = {
    //   offset: this.shadowCenter.minus(this.position),
    //   dimensions: {
    //     radius: this.shadowRadius
    //   },
    //   boundsType: Bounds.TYPE.INVERSE_CIRCLE
    // };
    this.collisionDimensions = {
      offset: this.shadowCenter.minus(this.position),
      dimensions: {
        radius: this.shadowRadius
      },
      boundsType: Bounds.TYPE.INVERSE_CIRCLE
    };
    this.physics.surfaceType = SURFACE_TYPE.GAS;

    _.defaults(this, {
      collapseRate: 15
    });

    if (!params.simulation) {
      this.renderer = new ShadowFieldRenderer(params);
    }
    this.updatePosition();
  }

  update(elapsedTime) {
    if (elapsedTime) {
      this.shadowRadius = Math.max(0, this.shadowRadius - (this.collapseRate * (elapsedTime / 1000)));
      //this.modelDimensions.dimensions.radius = this.shadowRadius;
      this.collisionDimensions.dimensions.radius = this.shadowRadius;
      this.updatePosition();
    }
    this.renderer.update(elapsedTime);
  }

  getUpdateState() {
    return Object.assign(super.getUpdateState(), _.pick(this, [
      "shadowCenter",
      "shadowRadius",
      "collapseRate"
    ]));
  }
}
