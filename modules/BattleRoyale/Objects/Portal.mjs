import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ObjectRenderer from "../Renderers/ObjectRenderer.mjs"
import objects from "./objects.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"
import RenderObject from "./RenderObject.mjs"

export default class Portal extends GameObject {
  constructor(params) {
    let object = objects[params.objectType];
    super(Object.assign({
      static: true,
      renderClipped: object.renderClipped
    }, params));
    _.merge(this, object);
    this.type = "Portal";

    if (!params.simulation) {
      if (object.imageSource) {
        this.renderer = new ObjectRenderer(object);
      } else if (_.isArray(object.images)) {
        this.renderObjects = _.map(object.images, (part) => {
          return new RenderObject(params, part);
        });
      } else if (_.isObject(object.images)) {
        this.renderer = new ObjectRenderer(object, object.images);
      }
    }

    this.updatePosition();
  }

  getUpdateState() {
    return Object.assign(super.getUpdateState(), _.pick(this, [
      "objectType",
      "state",
      "isInteractable"
    ]));
  }
}
