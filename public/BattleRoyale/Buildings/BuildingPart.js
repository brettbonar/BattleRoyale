import GameObject from "../../Engine/GameObject/GameObject.js"
import BuildingRenderer from "./BuildingRenderer.js"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.js";

export default class BuildingPart extends GameObject {
  constructor(params, building) {
    super(params);
    this.physics.surfaceType = SURFACE_TYPE.NONE;
    this.building = building;
    Object.assign(this, building);
    // this.bounds = building.bounds;
    // this.losDimensions = this.bounds;
    // this.hitboxDimensions = this.bounds;
    // this.terrainDimensions = this.bounds;
    this.renderer = new BuildingRenderer(building);
  }
  
  get perspectivePosition() {
    if (this.building.perspectiveOffset) {
      return {
        x: this.position.x + this.building.perspectiveOffset.x,
        y: this.position.y + this.building.perspectiveOffset.y
      };
    }
    return this.position;
  }
}
