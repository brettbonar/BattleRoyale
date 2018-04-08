import GameObject from "../../Engine/GameObject/GameObject.mjs"
import FOVRenderer from "../Renderers/FOVRenderer.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"
import Vec3 from "../../Engine/GameObject/Vec3.mjs"

export default class FOV extends GameObject {
  constructor(source) {
    super({
      physics: {
        surfaceType: SURFACE_TYPE.NONE
      }
    });
    this.position = source.center;
    this.type = "FOV";
    this.renderer = new FOVRenderer(source);
    this.source = source;
    this.dimensions = {
      radius: source.fov.range,
      zheight: 1
    };
    //this.renderClipped = true;

    this.updatePosition();
  }

  get fov() {
    return this.source.fov;
  }

  update(elapsedTime) {
    this.position = this.source.center;
    this.updatePosition();
    this.perspectivePosition = new Vec3();
  }
}
