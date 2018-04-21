import Bounds from "../../Engine/GameObject/Bounds.mjs"
import Vec3 from "../../Engine/GameObject/Vec3.mjs"
import Portal from "../Objects/Portal.mjs"
import objects from "../Objects/objects.mjs";


export default class EntryPortals {
  constructor(params) {
    this.grid = params.grid;
    this.map = params.map;
    this.duration = params.duration || 15000;
    this.portalDuration = params.portalDuration || 10000;
    this.portalFrequency = params.portalFrequency || 0.5;
    this.portalSpawnTime = 1000 / this.portalFrequency;
    this.characters = params.characters;
    this.spawnMap = params.spawnMap;

    this.currentTime = 0;
    this.currentSpawnTime = 0;
  }

  placeObjectInArea(object, area) {
    let grids = this.grid.getFreeGrids(area, 0);
    if (grids.length > 0) {
      let loc = _.sample(grids);
      object.lastPosition = new Vec3(loc.position);
      object.position = new Vec3(loc.position);
      object.level = 0;
      object.updatePosition();
      this.grid.update(object);
    } else {
      console.log("No room in area somehow...");
    }
  }

  getRandomBounds() {
    // TODO: 128 is portal size, don't hardcode
    let scale = objects.portal.dimensions.width / this.spawnMap.dimensions.width;
    let boundsSize = Math.min(this.map.mapParams.totalMapWidth, this.map.mapParams.totalMapWidth * scale);
    return new Bounds({
      position: {
        x: _.random(1, this.map.mapParams.totalMapWidth - boundsSize - 1),
        y: _.random(1, this.map.mapParams.totalMapHeight - boundsSize - 1)
      },
      dimensions: {
        width: boundsSize,
        height: boundsSize
      }
    });
  }

  update(elapsedTime) {
    if (elapsedTime) {
      let updates = [];

      this.currentTime += elapsedTime;
      this.currentSpawnTime += elapsedTime;

      while (this.currentSpawnTime >= this.portalSpawnTime) {
        this.currentSpawnTime -= this.portalSpawnTime;
        let bounds = this.getRandomBounds();
        let mapScale = this.spawnMap.width / this.map.mapParams.totalMapWidth;
        updates.push({
          create: new Portal({
            position: {
              x: this.spawnMap.position.x + bounds.ul.x * mapScale,
              y: this.spawnMap.position.y + bounds.ul.y * mapScale
            },
            level: "start",
            grid: this.grid,
            duration: this.portalDuration,
            area: bounds,
            simulation: true
          })
        })
      }
      
      if (this.currentTime >= this.duration) {
        for (const character of this.characters) {
          if (character.level === "start") {
            this.placeObjectInArea(character, this.getRandomBounds());
          }
        }
        this.done = true;
      }

      return updates;
    }
  }
}
