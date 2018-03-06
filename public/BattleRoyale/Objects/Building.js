import Bounds from "../../Engine/GameObject/Bounds.js"
import GameObject from "../../Engine/GameObject/GameObject.js"
import BuildingPart from "./BuildingPart.js"
import buildings from "../Objects/buildings.js"

export default class Building extends GameObject {
  constructor(params) {
    super(params);
    this.building = buildings[params.type];
    this.bounds = this.building.bounds;
    this.outside = true;

    this.exterior = new BuildingPart(params, this.building.exterior);
    this.interior = new BuildingPart(params, this.building.interior);
  }

  insideCb(target) {
    if (target.isPlayer) {
      this.outside = false;
    }
  }

  getAllFunctionBounds() {
    // TODO: optimize, only need to update position every time
    return this.functionBounds = this.building.interior.bounds.map((bounds) => {
      return {
        box: new Bounds(Object.assign({
          position: {
            x: this.position.x + bounds.offset.x,
            y: this.position.y + bounds.offset.y
          }
        }, bounds)),
        cb: (target) => this.insideCb(target)
      };
    });
  }

  update(elapsedTime) {
    this.outside = true;
  }

  getAllRenderObjects() {
    if (this.outside) {
      return [this.exterior, this.interior];
    }
    return [this.interior];
  }
}
