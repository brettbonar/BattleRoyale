import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ObjectRenderer from "../Renderers/ObjectRenderer.mjs"
import objects from "./objects.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"
import RenderObject from "./RenderObject.mjs"

export default class Door extends GameObject {
  constructor(params) {
    super(params);
    this.type = "Door";
    
    let object = objects[params.objectType];

    this.object = object;
    this.renderClipped = object.renderClipped;
    this.state = "closed";
    this.isInteractable = true;
    this.renderer = new ObjectRenderer(object, object.images);

    this.updatePosition();
  }

  updateStateDimensions() {
    if (this.object) {
      this.dimensions = this.object.stateDimensions[this.state].dimensions;
      this.collisionDimensions = this.object.stateDimensions[this.state].collisionDimensions;
      this.interactionDimensions = this.object.stateDimensions[this.state].interactionDimensions;
    }
  }

  interact(target) {
    this.state = this.state === "opened" ? "closed" : "opened";
    this.updatePosition();
  }

  updatePosition() {
    super.updatePosition();
    this.updateStateDimensions();
  }

  getUpdateState() {
    return Object.assign(super.getUpdateState(), _.pick(this, [
      "objectType",
      "state",
      "isInteractable"
    ]));
  }
}
