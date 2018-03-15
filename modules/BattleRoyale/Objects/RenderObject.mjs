import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ObjectRenderer from "../Renderers/ObjectRenderer.mjs"
import objects from "./objects.mjs"
import items from "./items.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"

export default class RenderObject extends GameObject {
  constructor(params, rendering) {
    super(Object.assign({
      static: true,
      physics: {
        surfaceType: SURFACE_TYPE.NONE
      }
    }, params));
    this.type = "RenderObject";
    this.renderer = new ObjectRenderer(rendering);
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