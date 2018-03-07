import GameObject from "../../Engine/GameObject/GameObject.js"
import BuildingRenderer from "../Renderers/BuildingRenderer.js"

export default class BuildingPart extends GameObject {
  constructor(params, building) {
    super(params);
    this.building = building;
    this.bounds = building.bounds;
    this.renderer = new BuildingRenderer(building);
    this.losObstacle = true;
    this.losFade = false;
  }
  
  get perspectivePosition() {
    if (this.building.renderOffset) {
      return {
        x: this.position.x + this.building.renderOffset.x,
        y: this.position.y + this.building.renderOffset.y
      };
    }
    return this.position;
  }
}
