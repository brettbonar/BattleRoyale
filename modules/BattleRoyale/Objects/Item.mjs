import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ObjectRenderer from "../Renderers/ObjectRenderer.mjs"
import objects from "./objects.mjs"
import items from "./items.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"

export default class Item extends GameObject {
  constructor(params) {
    super(Object.assign({
      static: true,
      physics: {
        surfaceType: SURFACE_TYPE.NONE
      }
    }, params));

    let item = items[params.itemType];
    _.merge(this, item);
    this.type = "Item";

    if (item.imageSource) {
      if (!params.simulation) {
        this.renderer = new ObjectRenderer(item);
      }
    } else if (item.images) {
      this.parts = _.map(item.images, (part) => {
        let piece = new Item(_.merge({}, item, params), part);
        return piece;
      });
    }

    this.interact = (target) => {
      if (!this.done) {
        target.state.inventory.push(this.itemType);
        this.done = true;
      }
    };
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
      "itemType"
    ]));
  }
}
