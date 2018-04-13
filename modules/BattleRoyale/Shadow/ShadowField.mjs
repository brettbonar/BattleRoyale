import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ShadowFieldRenderer from "./ShadowFieldRenderer.mjs";

export default class ShadowField extends GameObject {
  constructor(params) {
    super(params);
    this.type = "ShadowField";
    this.renderClipped = true;
    this.perspectiveOffset = {
      y: 16
    };
    if (!params.simulation) {
      this.renderer = new ShadowFieldRenderer(params);
    }
    this.updatePosition();
  }
}
