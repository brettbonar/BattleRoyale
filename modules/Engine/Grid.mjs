import Bounds from "./GameObject/Bounds.mjs"
import Vec3 from "./GameObject/Vec3.mjs"

export default class Grid {
  constructor(size) {
    this.size = size;
    this.collisionGrid = [];
    this.renderGrid = [];
    this.collisionAll = [];
    this.renderAll = [];
  }

  setGrid(grid, object, x, y) {
    if (!grid[x]) {
      grid[x] = [];
    }
    if (!grid[x][y]) {
      grid[x][y] = [];
    }

    grid[x][y].push(object);
  }

  addInverseCircleToGrid(grid, allGrid, object, extents) {
    let grids = [];
    if (extents.radius > 0) {
      let xstart = Math.max(0, Math.floor(extents.ul.x / this.size));
      let xend = Math.max(0, Math.floor(extents.lr.x / this.size));
      let ystart = Math.max(0, Math.floor(extents.ul.y / this.size));
      let yend = Math.max(0, Math.floor(extents.lr.y / this.size));

      let center = new Vec3({
        x: extents.center.x / this.size,
        y: extents.center.y / this.size
      });
      let distance = Math.max(0, extents.radius / this.size - 1);

      for (let x = xstart; x <= xend; x++) {
        for (let y = ystart; y <= yend; y++) {
          if (center.distanceTo({ x: x, y: y }) > distance) {
            this.setGrid(grid, object, x, y);
            grids.push({
              x: x,
              y: y
            });
          }
        }
      }

      return grids;
    } else {
      allGrid.push(object);
      return [];
    }
  }

  addBoxToGrid(grid, allGrid, object, extents) {
    let grids = [];

    let xstart = Math.max(0, Math.floor(extents.ul.x / this.size));
    let xend = Math.max(0, Math.floor(extents.lr.x / this.size));
    let ystart = Math.max(0, Math.floor(extents.ul.y / this.size));
    let yend = Math.max(0, Math.floor(extents.lr.y / this.size));

    for (let x = xstart; x <= xend; x++) {
      for (let y = ystart; y <= yend; y++) {
        this.setGrid(grid, object, x, y);
        grids.push({
          x: x,
          y: y
        });
      }
    }

    return grids;
  }

  addToGrid(grid, allGrid, object, extents) {
    // TODO: allow multiple extents combining positive and negative
    if (extents.type === Bounds.TYPE.INVERSE_CIRCLE) {
      return this.addInverseCircleToGrid(grid, allGrid, object, extents);
    }
    return this.addBoxToGrid(grid, allGrid, object, extents);
  }

  add(object) {
    let collisionExtents = object.collisionExtents;
    if (collisionExtents) {
      object.collisionGrids =
        this.addToGrid(this.collisionGrid, this.collisionAll, object, collisionExtents);
    }
    let modelBounds = object.modelBounds;
    if (modelBounds) {
      object.renderGrids =
        this.addToGrid(this.renderGrid, this.renderAll, object, modelBounds);
    }
  }

  remove(object) {
    if (object.collisionGrids) {
      for (const grid of object.collisionGrids) {
        if (this.collisionGrid[grid.x] && this.collisionGrid[grid.x][grid.y]) {
          _.pull(this.collisionGrid[grid.x][grid.y], object);
        }
      }
    }
    _.pull(this.collisionAll, object);

    if (object.renderGrids) {
      for (const grid of object.renderGrids) {
        if (this.renderGrid[grid.x] && this.renderGrid[grid.x][grid.y]) {
          _.pull(this.renderGrid[grid.x][grid.y], object);
        }
      }
    }
    _.pull(this.renderAll, object);
  }

  update(object) {
    this.remove(object);
    this.add(object);
  }

  getAdjacentCollision(object) {
    if (object.collisionGrids) {
      return object.collisionGrids.reduce((objs, grid) => {
        return objs.concat(this.collisionGrid[grid.x][grid.y]);
      }, this.collisionAll);
    }
    return this.collisionAll;
  }
  
  getRenderObjects(bounds) {
    let objs = this.renderAll;

    let xstart = Math.max(0, Math.floor(bounds.ul.x / this.size));
    let xend = Math.max(0, Math.floor(bounds.lr.x / this.size));
    let ystart = Math.max(0, Math.floor(bounds.ul.y / this.size));
    let yend = Math.max(0, Math.floor(bounds.lr.y / this.size));

    for (let x = xstart; x <= xend; x++) {
      for (let y = ystart; y <= yend; y++) {
        if (this.renderGrid[x] && this.renderGrid[x][y]) {
          objs = objs.concat(this.renderGrid[x][y]);
        }
      }
    }

    return _.uniq(objs);
  }
}
