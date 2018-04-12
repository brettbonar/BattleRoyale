export default class Grid {
  constructor(size) {
    this.size = size;
    this.collisionGrid = [];
    this.renderGrid = [];
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

  addToGrid(grid, object, extents) {
    let grids = [];

    let xstart = Math.floor(extents.ul.x / this.size);
    let xend = Math.floor(extents.lr.x / this.size);
    let ystart = Math.floor(extents.ul.y / this.size);
    let yend = Math.floor(extents.lr.y / this.size);

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

  add(object) {
    let collisionExtents = object.collisionExtents;
    if (collisionExtents) {
      object.collisionGrids = this.addToGrid(this.collisionGrid, object, collisionExtents);
    }
    let modelBounds = object.modelBounds;
    if (modelBounds) {
      object.renderGrids = this.addToGrid(this.renderGrid, object, modelBounds);
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
    if (object.renderGrids) {
      for (const grid of object.renderGrids) {
        if (this.renderGrid[grid.x] && this.renderGrid[grid.x][grid.y]) {
          _.pull(this.renderGrid[grid.x][grid.y], object);
        }
      }
    }
  }

  update(object) {
    this.remove(object);
    this.add(object);
  }

  getAdjacentCollision(object) {
    if (object.collisionGrids) {
      return object.collisionGrids.reduce((objs, grid) => {
        return objs.concat(this.collisionGrid[grid.x][grid.y]);
      }, []);
    }
    return [];
  }
  
  getRenderObjects(bounds) {
    let objs = [];

    let xstart = Math.floor(bounds.ul.x / this.size);
    let xend = Math.floor(bounds.lr.x / this.size);
    let ystart = Math.floor(bounds.ul.y / this.size);
    let yend = Math.floor(bounds.lr.y / this.size);

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
