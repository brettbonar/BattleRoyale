import Grid from "./Grid.mjs"

export default class LevelGrids {
  constructor(size) {
    this.size = size;
    this.levelGrids = {};
  }

  add(object) {
    if (!this.levelGrids[object.level]) {
      this.levelGrids[object.level] = new Grid(this.size);
    }
    this.levelGrids[object.level].add(object);
  }

  remove(object) {
    _.each(this.levelGrids, (grid) => grid.remove(object));
  }

  update(object) {
    this.remove(object);
    this.add(object);
  }

  getFreeGrids(bounds, level) {
    if (this.levelGrids[level]) {
      return this.levelGrids[level].getFreeGrids(bounds);
    }
    return [];
  }

  getAdjacentCollision(object) {
    if (this.levelGrids[object.level]) {
      return this.levelGrids[object.level].getAdjacentCollision(object);
    }
    return [];
  }
  
  getRenderObjects(bounds, level) {
    if (this.levelGrids[level]) {
      return this.levelGrids[level].getRenderObjects(bounds);
    }

    return [];
  }
  
  getRenderObjectsAllLevels(bounds) {
    let objects = [];

    _.each(this.levelGrids, (grid, level) => {
      objects = objects.concat(this.levelGrids[level].getRenderObjects(bounds));
    });

    return objects;
  }
}
