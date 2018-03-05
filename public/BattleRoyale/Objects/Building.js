import GameObject from "../../Engine/GameObject/GameObject.js"
import BuildingRenderer from "../Renderers/BuildingRenderer.js"

export default class Building extends GameObject {
  constructor(params) {
    super(params);
    this.renderer = new BuildingRenderer(params.type);
  }
}
