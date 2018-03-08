import Bounds from "../../Engine/GameObject/Bounds.js"
import GameObject from "../../Engine/GameObject/GameObject.js"
import BuildingPart from "./BuildingPart.js"
import buildings from "./buildings.js"

export default class Building extends GameObject {
  constructor(params) {
    super(params);
    this.building = buildings[params.type];
    this.bounds = this.building.bounds;
    this.losDimensions = this.bounds;
    this.hitboxDimensions = this.bounds;
    this.terrainDimensions = this.bounds;
    this.outside = true;

    this.losFade = false;
    this.exterior = new BuildingPart(params, this.building.exterior);
    this.interior = new BuildingPart(params, this.building.interior);

    this.exteriorDoors = [];
    this.interiorDoors = [];
    // this.openDoors = [];
    // this.closedDoors = [];
    // for (const door of this.building.doors) {
    //   if (door.exterior) {
    //     this.exteriorDoors.push(new BuildingPart(params, door.exterior));
    //   }
    //   if (door.interior) {
    //     this.interiorDoors.push(new BuildingPart(params, door.exterior));
    //   }
    // }
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
  
  // get terrainBoundingBox() {
  //   let bounds = super.terrainBoundingBox;
  //   if (this.outside) {
  //     bounds = bounds.concat(this.getAllBounds(this.position, _.flatten(_.map(this.exteriorDoors, "terrainDimensions"))));
  //   } else {
  //     bounds = bounds.concat(this.getAllBounds(this.position, _.flatten(_.map(this.interiorDoors, "terrainDimensions"))));
  //   }
  //   return bounds;
  // }

  // get losBoundingBox() {
  //   let bounds = super.losBoundingBox;
  //   if (this.outside) {
  //     bounds = bounds.concat(this.getAllBounds(this.position, _.flatten(_.map(this.exteriorDoors, "losDimensions"))));
  //   } else {
  //     bounds = bounds.concat(this.getAllBounds(this.position, _.flatten(_.map(this.interiorDoors, "losDimensions"))));
  //   }
  //   return bounds;
  // }

  // get hitbox() {
  //   let bounds = super.hitbox;
  //   if (this.outside) {
  //     bounds = bounds.concat(this.getAllBounds(this.position, _.flatten(_.map(this.exteriorDoors, "hitboxDimensions"))));
  //   } else {
  //     bounds = bounds.concat(this.getAllBounds(this.position, _.flatten(_.map(this.interiorDoors, "hitboxDimensions"))));
  //   }
  //   return bounds;
  // }

  update(elapsedTime) {
    this.outside = true;
  }

  getAllRenderObjects() {
    if (this.outside) {
      return [this.exterior, this.interior].concat(this.exteriorDoors);
    }
    return [this.interior].concat(this.interiorDoors);
  }
}
