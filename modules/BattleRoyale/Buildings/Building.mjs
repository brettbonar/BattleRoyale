import Bounds from "../../Engine/GameObject/Bounds.mjs"
import GameObject from "../../Engine/GameObject/GameObject.mjs"
import RenderObject from "../Objects/RenderObject.mjs"
import buildings from "./buildings.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs";

export default class Building extends GameObject {
  constructor(params) {
    super(Object.assign({
      static: true
    }, params));
    this.type = "Building";
    this.building = buildings[params.buildingType];
    this.dimensions = this.building.dimensions;
    //this.losDimensions = this.building.bounds;
    this.collisionDimensions = this.building.collisionDimensions;
    this.outside = true;

    this.losFade = false;

    if (!params.simulation) {
      this.exterior = new RenderObject(Object.assign({}, params, this.building), this.building.exterior);
      this.interior = new RenderObject(Object.assign({
        perspectiveOffset: {
          y: 0
        }
      }, params, this.building), this.building.interior);
    }
    
    this.exteriorDoors = [];
    this.interiorDoors = [];
    // this.openDoors = [];
    // this.closedDoors = [];
    
    this.renderObjects = [this.exterior, this.interior].concat(this.exteriorDoors);
  }

  insideCb(target) {
    if (target.isThisPlayer) {
      this.renderObjects = [this.interior].concat(this.interiorDoors);
    }
  }

  getAllFunctionBounds() {
    // TODO: optimize, only need to update position every time
    return this.functionBounds = this.building.interior.bounds.map((bounds) => {
      return {
        bounds: new Bounds(Object.assign({
          position: this.position.plus(bounds.offset)
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
    this.renderObjects = [this.exterior, this.interior].concat(this.exteriorDoors);
  }

  getUpdateState() {
    return Object.assign(super.getUpdateState(), _.pick(this, [
      "buildingType"
    ]));
  }
}
