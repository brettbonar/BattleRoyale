import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ObjectRenderer from "../Renderers/ObjectRenderer.mjs"
import objects from "./objects.mjs"
import items from "./items.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"
import RenderObject from "./RenderObject.mjs";

export default class StaticObject extends GameObject {
  constructor(params) {
    super(Object.assign({
      static: true
    }, params));
    let object = objects[params.objectType];
    Object.assign(this, object);
    this.type = "StaticObject";

    if (!params.simulation) {
      if (object.imageSource) {
        this.renderer = new ObjectRenderer(object);
      } else if (object.images) {
        this.parts = _.map(object.images, (part) => {
          return new RenderObject(params, part);
        });
      }
    }
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
