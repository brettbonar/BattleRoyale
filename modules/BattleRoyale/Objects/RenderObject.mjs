import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ObjectRenderer from "../Renderers/ObjectRenderer.mjs"
import objects from "./objects.mjs"
import items from "./items.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"
import Dimensions from "../../Engine/GameObject/Dimensions.mjs";

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
    this.perspectiveDimensions = rendering.perspectiveDimensions || this.perspectiveDimensions;
    this.losFade = params.losFade || rendering.losFade;
    this.fadeEndOffset = rendering.fadeEndOffset;
    this.fadeDimensions = rendering.fadeDimensions;
    this.dimensions = rendering.dimensions || this.dimensions;
    this.perspectiveOffset = rendering.perspectiveOffset || this.perspectiveOffset;

    if (rendering.collisionDimensions) {
      this.collisionDimensions = this.parseDimensions(rendering.collisionDimensions);
    }

    if (rendering.offset) {
      this.position.add(rendering.offset);
    }
    this.updatePosition();
  }

  getUpdateState() {
    return Object.assign(super.getUpdateState(), _.pick(this, [
      "objectType"
    ]));
  }

  update(elapsedTime) {
    // TODO: get rid of this hack
    this.renderer.update(elapsedTime);
    if (this.renderer.done) {
      this.done = true;
    }
  }
}
