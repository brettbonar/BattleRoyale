import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ObjectRenderer from "../Renderers/ObjectRenderer.mjs"
import objects from "./objects.mjs"
import items from "./items.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"
import RenderObject from "./RenderObject.mjs"

export default class StaticObject extends GameObject {
  constructor(params) {
    let object = objects[params.objectType];
    super(Object.assign({
      static: true,
      renderClipped: object.renderClipped
    }, params));
    _.merge(this, object);
    this.type = "StaticObject";

    if (!params.simulation) {
      if (object.imageSource) {
        this.renderer = new ObjectRenderer(object);
      } else if (object.images) {
        this.renderObjects = _.map(object.images, (part) => {
          return new RenderObject(params, part);
        });
      }
    }

    this.updatePosition();
  }

  getUpdateState() {
    return Object.assign(super.getUpdateState(), _.pick(this, [
      "objectType"
    ]));
  }
}
