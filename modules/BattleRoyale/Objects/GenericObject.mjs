import GameObject from "../../Engine/GameObject/GameObject.mjs";
import ObjectRenderer from "../Renderers/ObjectRenderer.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs";

export default class GenericObject extends GameObject {
  constructor(params, object) {
    super(params);
    Object.assign(this, object);

    if (object.imageSource) {
      this.renderer = new ObjectRenderer(object);
    } else if (object.images) {
      this.parts = _.map(object.images, (part) => {
        let piece = new GenericObject(_.merge({}, object, params), part);
        piece.physics.surfaceType = SURFACE_TYPE.NONE;
        return piece;
      });
    }
  }

  get perspectivePosition() {
    if (this.perspectiveOffset) {
      return {
        x: this.position.x + this.perspectiveOffset.x,
        y: this.position.y + this.perspectiveOffset.y
      };
    }
    return this.position;
  }

  getAllRenderObjects() {
    return this.parts || this;
  }
}
