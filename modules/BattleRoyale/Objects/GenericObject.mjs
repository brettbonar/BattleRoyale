import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ObjectRenderer from "../Renderers/ObjectRenderer.mjs"
import objects from "./objects.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"

export default class GenericObject extends GameObject {
  constructor(params) {
    super(params);
    let object = objects[params.objectType];
    Object.assign(this, object);
    this.type = "GenericObject";

    if (object.imageSource) {
      if (!params.simulation) {
        this.renderer = new ObjectRenderer(object);
      }
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

  getUpdateState() {
    return Object.assign(super.getUpdateState(), _.pick(this, [
      "objectType"
    ]));
  }
}
