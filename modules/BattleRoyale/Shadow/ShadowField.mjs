import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ShadowFieldRenderer from "./ShadowFieldRenderer.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"

export default class ShadowField extends GameObject {
  constructor(params) {
    super(params);
    this.type = "ShadowField";
    this.renderClipped = true;
    this.physics.surfaceType = SURFACE_TYPE.NONE;
    this.shadowCenter = params.shadowCenter;
    this.shadowRadius = params.shadowRadius;

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
