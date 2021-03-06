import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ObjectRenderer from "../Renderers/ObjectRenderer.mjs"
import objects from "./objects.mjs"
import equipment from "./equipment.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"

export default class Item extends GameObject {
  constructor(params) {
    super(Object.assign({
      static: true,
      physics: {
        surfaceType: SURFACE_TYPE.NONE
      }
    }, params));

    let item = equipment[params.itemType].world;
    _.merge(this, item);
    this.type = "Item";
    this.itemType = params.itemType;
    this.isInteractable = true;

    if (item.imageSource) {
      if (!params.simulation) {
        this.renderer = new ObjectRenderer(item);
      }
    } else if (item.images) {
      this.renderObjects = _.map(item.images, (part) => {
        let piece = new Item(_.merge({}, item, params), part);
        return piece;
      });
    }

    this.interact = (target) => {
      if (!this.done) {
        target.addItem(this.itemType);
        this.done = true;
      }
    };
  }

  getUpdateState() {
    return Object.assign(super.getUpdateState(), _.pick(this, [
      "itemType"
    ]));
  }
}
