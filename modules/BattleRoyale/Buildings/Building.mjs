import Bounds from "../../Engine/GameObject/Bounds.mjs"
import GameObject from "../../Engine/GameObject/GameObject.mjs"
import BuildingPart from "./BuildingPart.mjs"
import buildings from "./buildings.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs";

export default class Building extends GameObject {
  constructor(params) {
    super(Object.assign({
      static: true
    }, params));
    this.type = "Building";
    this.building = buildings[params.buildingType];
    this.losDimensions = this.building.bounds;
    this.hitboxDimensions = this.building.bounds;
    this.terrainDimensions = this.building.bounds;
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
    if (target.isThisPlayer) {
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

  getUpdateState() {
    return Object.assign(super.getUpdateState(), _.pick(this, [
      "buildingType"
    ]));
  }
}