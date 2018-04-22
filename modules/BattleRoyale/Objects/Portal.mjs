import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ObjectRenderer from "../Renderers/ObjectRenderer.mjs"
import objects from "./objects.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"
import RenderObject from "./RenderObject.mjs"
import StaticObject from "./StaticObject.mjs"
import Bounds from "../../Engine/GameObject/Bounds.mjs"
import Vec3 from "../../Engine/GameObject/Vec3.mjs"

export default class Portal extends StaticObject {
  constructor(params) {
    super(Object.assign({
      objectType: "portal"
    }, params));

    this.type = "Portal";
    this.duration = params.duration;
    this.grid = params.grid;
    this.area = params.area;
    this.currentTime = 0;
  }

  placeObjectInArea(object, area) {
    let grids = this.grid.getFreeGrids(area, 0);
    if (grids.length > 0) {
      let loc = _.sample(grids);
      object.lastPosition = new Vec3(loc.position);
      object.position = new Vec3(loc.position);
      object.setLevel(0);
      object.updatePosition();
      this.grid.update(object);
    } else {
      console.log("No room in area somehow...");
    }
  }

  interact(target) {
    this.placeObjectInArea(target, this.area);
  }
  
  update(elapsedTime) {
    this.currentTime += elapsedTime;

    let fadeTime = Math.min(0, (this.currentTime - (this.duration / 2)) / (this.duration / 2));
    this.renderer.opacity = 1.0 - Math.max(1.0, fadeTime);
    this.renderer.update(elapsedTime);

    if (this.currentTime >= this.duration) {
      this.done = true;
    }
  }
}
