import Bounds from "../../Engine/GameObject/Bounds.mjs"
import Vec3 from "../../Engine/GameObject/Vec3.mjs"

const BOUNDS_SIZE = 2048;

export default class EntryPortals {
  constructor(params) {
    this.grid = params.grid;
    this.map = params.map;
    this.duration = params.duration || 5;
    this.characters = params.characters;
    this.spawnMap = params.spawnMap;
    this.currentTime = 0;
  }

  placeObjectInArea(object, area) {
    let grids = this.grid.getFreeGrids(area, 0);
    if (grids.length > 0) {
      let loc = _.sample(grids);
      object.lastPosition = new Vec3(loc.position);
      object.position = new Vec3(loc.position);
      object.level = 0;
    } else {
      console.log("No room in area somehow...");
    }
  }

  getRandomBounds() {
    let boundsSize = Math.min(this.map.mapParams.totalMapWidth, BOUNDS_SIZE);
    return new Bounds({
      position: {
        x: _.random(1, this.map.mapParams.totalMapWidth - boundsSize - 1),
        y: _.random(1, this.map.mapParams.totalMapWidth - boundsSize - 1)
      },
      dimensions: {
        width: boundsSize,
        height: boundsSize
      }
    });
  }

  update(elapsedTime) {
    if (elapsedTime) {
      this.currentTime += elapsedTime;
      
      if (this.currentTime >= this.duration) {
        for (const character of this.characters) {
          if (character.level === "start") {
            this.placeObjectInArea(character, this.getRandomBounds());
          }
        }
      }
    }
  }
}
