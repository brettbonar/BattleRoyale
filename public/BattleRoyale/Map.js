// import perlin from "./Perlin.js"
import { getDistance, normalize } from "../Engine/util.js"

const BIOMES = {
  FOREST: "forest",
  DESERT: "desert",
  DEATH: "death",
  PLAIN: "plain",
  WATER: "water",
  FIRE: "fire"
};

const GROWTH_TYPE = {
  JAGGED: "jagged",
  SMOOTH: "smooth"
};

class Biome {
  constructor(params) {
    Object.assign(this, params);  
  }
}

class Tile {
  constructor(params) {
    Object.assign(this, params);
  }
}

class Cell {
  constructor(params) {
    Object.assign(this, params);
    this.neighbors = {
      left: null,
      right: null,
      top: null,
      bottom: null
    };
  }
}

const TERRAIN_PRIORITY = {
  [BIOMES.DEATH]: 1,
  [BIOMES.FIRE]: 0,
  [BIOMES.WATER]: -1,
  [BIOMES.DESERT]: 2,
  [BIOMES.FOREST]: 3,
  [BIOMES.PLAIN]: 4
};

const TERRAIN_OFFSETS = {
  [BIOMES.DEATH]: {
    x: 32 * 10,
    y: 32 * 3
  },
  [BIOMES.FIRE]: {
    x: 32 * 16,
    y: 32 * 3
  },
  [BIOMES.WATER]: {
    x: 32 * 28,
    y: 32 * 3
  },
  [BIOMES.DESERT]: {
    x: 32 * 19,
    y: 32 * 9
  },
  [BIOMES.FOREST]: {
    x: 32 * 7,
    y: 32 * 9
  },
  [BIOMES.PLAIN]: {
    x: 32,
    y: 32 * 9
  }
};

export default class Map {
  constructor(params) {
    Object.assign(this, params);
    _.defaults(this, {
      mapSize: 100,
      cellSize: 32,
      tileSize: 32,
      map: [],
      seeds: {
        "forest": 4,
        "desert": 3,
        "death": 2,
        "plain": 6,
        "water": 2,
        "fire": 2
      },
      weights: {
        "forest": 25,
        "desert": 15,
        "death": 1,
        "plain": 40,
        "water": 1,
        "fire": 1
      }
    });
    this.biomes = {
      forest: new Biome({
        type: BIOMES.FOREST,
        growthType: GROWTH_TYPE.SMOOTH
      }),
      desert: new Biome({
        type: BIOMES.DESERT,
        growthType: GROWTH_TYPE.SMOOTH
      }),
      death: new Biome({
        type: BIOMES.DEATH,
        growthType: GROWTH_TYPE.JAGGED
      }),
      plain: new Biome({
        type: BIOMES.PLAIN,
        growthType: GROWTH_TYPE.SMOOTH
      }),
      water: new Biome({
        type: BIOMES.WATER,
        growthType: GROWTH_TYPE.JAGGED
      }),
      fire: new Biome({
        type: BIOMES.FIRE,
        growthType: GROWTH_TYPE.JAGGED
      })
    };


    this.initializeMap();
    this.generateVoronoi();
  }

  static get BIOMES() { return BIOMES; }

  drawTerrain(type) {

  }

  initializeMap() {
    for (const x in _.range(this.mapSize)) {
      let cells = [];
      for (const y in _.range(this.mapSize)) {
        cells.push(new Cell({
          position: {
            x: x,
            y: y
          }
        }));
      }
      this.map.push(cells);
    }

    for (let x = 0; x < this.map.length; x++) {
      for (let y = 0; y < this.map[x].length; y++) {
        let cell = this.map[x][y];
        if (x > 0) {
          cell.neighbors.left = this.map[x - 1][y];
        }
        if (x < this.map.length - 1) {
          cell.neighbors.right = this.map[x + 1][y];
        }
        if (y > 0) {
          cell.neighbors.top = this.map[x][y - 1];
        }
        if (y < this.map[x].length - 1) {
          cell.neighbors.bottom = this.map[x][y + 1];
        }
        cell.neighbors.topLeft = this.getCell(x - 1, y - 1);
        cell.neighbors.topRight = this.getCell(x + 1, y - 1);
        cell.neighbors.bottomRight = this.getCell(x + 1, y + 1);
        cell.neighbors.bottomLeft = this.getCell(x - 1, y + 1);
        cell.growNeighbors = [
          cell.neighbors.left,
          cell.neighbors.right,
          cell.neighbors.top,
          cell.neighbors.bottom
        ];
      }
    }
  }

  growJagged(cells, used) {
    let cell;
    while (!cell && cells.length > 0) {
      cell = cells[cells.length - 1];
      let neighbors = _.shuffle(cell.growNeighbors);
      let next;
      for (const neighbor of neighbors) {
        if (neighbor && !used.includes(neighbor)) {
          // if (neighbor === cell.neighbors.left || neighbor === cell.neighbors.right) {
          //   let top = cell.neighbors.top;
          //   if (top && !used.includes(top)) {
          //     top.type = cell.type;
          //     top.biome = cell.biome;
          //     cells.push(top);
          //     used.push(top);
          //   }
          //   let bottom = cell.neighbors.bottom;
          //   if (bottom && !used.includes(bottom)) {
          //     bottom.type = cell.type;
          //     bottom.biome = cell.biome;
          //     cells.push(bottom);
          //     used.push(bottom);
          //   }
          // } else if (neighbor === cell.neighbors.top || neighbor === cell.neighbors.bottom) {
          //   let left = cell.neighbors.left;
          //   if (left && !used.includes(left)) {
          //     left.type = cell.type;
          //     left.biome = cell.biome;
          //     cells.push(left);
          //     used.push(left);
          //   }
          //   let right = cell.neighbors.right;
          //   if (right && !used.includes(right)) {
          //     right.type = cell.type;
          //     right.biome = cell.biome;
          //     cells.push(right);
          //     used.push(right);
          //   }
          // }
          next = neighbor;
          next.type = cell.type;
          next.biome = cell.biome;
          cells.push(next);
          used.push(next);
          break;
        }
      }

      if (!next) {
        cells.pop();
      }
    }

  }

  growSmooth(cells, used) {
    let cell;
    while (!cell && cells.length > 0) {
      cell = cells[0];
      let neighbors = _.shuffle(cell.growNeighbors);
      let next;
      for (const neighbor of neighbors) {
        if (neighbor && !used.includes(neighbor)) {
          next = neighbor;
          next.type = cell.type;
          next.biome = cell.biome;
          cells.push(next);
          used.push(next);
          break;
        }
      }

      if (!next) {
        cells.shift();
      }
    }
  }

  growCells(seeds, used) {
    // TODO: grow smooth cells first then add jagged on top
    while (seeds.some((cells) => cells.length > 0)) {
      for (const cells of seeds) {
        if (cells.length === 0) continue;
        let growthType = cells[0].biome.growthType;
        let weight = this.weights[cells[0].type];
        for (let i = 0; i < weight; i++) {
          if (growthType === GROWTH_TYPE.JAGGED) {
            this.growJagged(cells, used);
          } else if (growthType === GROWTH_TYPE.SMOOTH) {
            this.growSmooth(cells, used);
          }
        }
      }
    }
    
    // Ensure there are no isolated tiles
    for (const column of this.map) {
      for (const cell of column) {
        if (cell.neighbors.bottom && cell.neighbors.bottom.type !== cell.type && cell.neighbors.top && cell.neighbors.top.type !== cell.type) {
          cell.neighbors.bottom.type = cell.type;
          cell.neighbors.bottom.biome = cell.biome;
        }
        if (cell.neighbors.left && cell.neighbors.left.type !== cell.type && cell.neighbors.right && cell.neighbors.right.type !== cell.type) {
          cell.neighbors.right.type = cell.type;
          cell.neighbors.right.biome = cell.biome;
        }
        // if (cell.neighbors.topLeft && cell.neighbors.topLeft.type !== cell.type && cell.neighbors.bottomRight && cell.neighbors.bottomRight.type !== cell.type) {
        //   cell.neighbors.bottomRight.type = cell.type;
        //   cell.neighbors.bottomRight.biome = cell.biome;
        // }
        // if (cell.neighbors.topRight && cell.neighbors.topRight.type !== cell.type && cell.neighbors.bottomLeft && cell.neighbors.bottomLeft.type !== cell.type) {
        //   cell.neighbors.bottomLeft.type = cell.type;
        //   cell.neighbors.bottomLeft.biome = cell.biome;
        // }
      }
    }
  }

  getCell(x, y) {
    if (x >= 0 && x < this.map.length && y >= 0 && y < this.map.length) {
      return this.map[x][y];
    }
    return null;
  }

  renderCell(cell, offset, position) {
    let size = this.cellSize;
    offset = offset || Object.assign({}, TERRAIN_OFFSETS[cell.type]);
    position = position || cell.position;

    this.context.drawImage(this.terrain, offset.x, offset.y, size, size,
      position.x * size, position.y * size, size, size);
    //this.context.strokeRect(position.x * size, position.y * size, size, size);
  }

  getOffset(cell) {
    let size = this.cellSize;
    let priority = TERRAIN_PRIORITY[cell.type];
    let offset = Object.assign({}, TERRAIN_OFFSETS[cell.type]);
    let neighbor;
    let sides = {
      topLeft: false,
      topRight: false,
      bottomRight: false,
      bottomLeft: false,
      top: false,
      right: false,
      bottom: false,
      left: false
    }
    if (cell.neighbors.topLeft && TERRAIN_PRIORITY[cell.neighbors.topLeft.type] > priority) {
      sides.topLeft = true;
      neighbor = cell.neighbors.topLeft;
    }
    if (cell.neighbors.topRight && TERRAIN_PRIORITY[cell.neighbors.topRight.type] > priority) {
      sides.topRight = true;
      neighbor = cell.neighbors.topRight;
    }
    if (cell.neighbors.bottomRight && TERRAIN_PRIORITY[cell.neighbors.bottomRight.type] > priority) {
      sides.bottomRight = true;
      neighbor = cell.neighbors.bottomRight;
    }
    if (cell.neighbors.bottomLeft && TERRAIN_PRIORITY[cell.neighbors.bottomLeft.type] > priority) {
      sides.bottomLeft = true;
      neighbor = cell.neighbors.bottomLeft;
    }
    if (cell.neighbors.bottom && TERRAIN_PRIORITY[cell.neighbors.bottom.type] > priority) {
      sides.bottom = true;
      neighbor = cell.neighbors.bottom;
    }
    if (cell.neighbors.top && TERRAIN_PRIORITY[cell.neighbors.top.type] > priority) {
      sides.top = true;
      neighbor = cell.neighbors.top;
    }
    if (cell.neighbors.right && TERRAIN_PRIORITY[cell.neighbors.right.type] > priority) {
      sides.right = true;
      neighbor = cell.neighbors.right;
    }
    if (cell.neighbors.left && TERRAIN_PRIORITY[cell.neighbors.left.type] > priority) {
      sides.left = true;
      neighbor = cell.neighbors.left;
    }
    
    //if (sides.topLeft && sides.topRight && sides.bottomRight && sides.bottomLeft && sides.bottom && sides.top && sides.right && sides.left) {
    if (sides.top && !sides.right && !sides.left) {
      offset.y -= size;
    } else if (sides.bottom && !sides.right && !sides.left) {
      offset.y += size;
    } else if (sides.right && !sides.top && !sides.bottom) {
      offset.x += size;
    } else if (sides.left && !sides.top && !sides.bottom) {
      offset.x -= size;
    }  else if (sides.bottomLeft && !sides.right && !sides.top && sides.left && sides.bottom) {
      offset.x -= size;
      offset.y += size;
    } else if (sides.bottomRight && sides.right && !sides.top && !sides.left && sides.bottom) {
      offset.x += size;
      offset.y += size;
    } else if (sides.topRight && sides.right && sides.top && !sides.left && !sides.bottom) {
      offset.x += size;
      offset.y -= size;
    } else if (sides.topLeft && !sides.right && sides.top && sides.left && !sides.bottom) {
      offset.x -= size;
      offset.y -= size;
    } else if (sides.topRight && !sides.right && !sides.top && !sides.left && !sides.bottom) {
      offset.y -= size * 2;
    } else if (sides.topLeft && !sides.right && !sides.top && !sides.left && !sides.bottom) {
      offset.x += size;
      offset.y -= size * 2;
    } else if (sides.bottomRight && !sides.right && !sides.top && !sides.left && !sides.bottom) {
      offset.y -= size * 3;
    } else if (sides.bottomLeft && !sides.right && !sides.top && !sides.left && !sides.bottom) {
      offset.x += size;
      offset.y -= size * 3;
    } else if (sides.left && sides.top && !sides.bottom && !sides.right) {
      offset.x -= size;
      offset.y -= size;
    } else if (sides.bottom && sides.right && !sides.top && !sides.left) {
      offset.x += size;
      offset.y += size;
    } else if (_.sum(_.toArray(sides)) >= 5) {
      offset.x -= size;
      offset.y -= size * 3;
    }

    return { offset: offset, neighbor: neighbor };
  }

  drawCell(cell) {
    let size = this.cellSize;
    let offset = Object.assign({}, TERRAIN_OFFSETS[cell.type]);
    let priority = TERRAIN_PRIORITY[cell.type];
    let neighbor;
    let sides = {
      top: false,
      bottom: false,
      left: false,
      right: false
    };

    let result = this.getOffset(cell);

    if (result.neighbor) {
      let neighborCell = new Cell({
        position: cell.position
      });
      neighborCell.neighbors = cell.neighbors;
      neighborCell.type = result.neighbor.type;
      this.renderCell(neighborCell, null, cell.position);
    }
    
    this.renderCell(cell, result.offset);
  }

  saveMap() {
    this.canvas = document.getElementById("canvas-map");
    this.canvas.width = this.cellSize * this.mapSize;
    this.canvas.height = this.cellSize * this.mapSize;
    this.context = this.canvas.getContext("2d");

    // FOREST: "forest",
    // DESERT: "desert",
    // DEATH: "death",
    // PLAIN: "plain"
    for (const column of this.map) {
      for (const cell of column) {
        this.drawCell(cell);
      }
    }
  }

  render(context, position) {
    if (this.canvas) {
      context.drawImage(this.canvas, position.x - context.canvas.width / 2, position.y - context.canvas.height / 2,
        context.canvas.width, context.canvas.height, 0, 0, context.canvas.width, context.canvas.height);
      //context.drawImage(this.canvas, 0, 0, context.canvas.width, context.canvas.height);
    }
  }

  growVoronoi(seeds) {
    // let box = {
    //   xl: 0,
    //   xr: this.mapSize * this.cellSize - 1,
    //   yt: 0,
    //   yb: this.mapSize * this.cellSize - 1
    // };

    // let voronoi = new Voronoi();
    // voronoi.compute(_.map(seeds, "position"), box).cells;
    
    for (const column of this.map) {
      for (const cell of column) {
        let seed = _.minBy(seeds, (seed) => {
          return getDistance(seed.position, cell.position);
        });
        cell.type = seed.type;
        cell.biome = seed.biome;        
      }
    }
  }

  generateVoronoi() {
    let seeds = [];

    _.each(BIOMES, (type) => {
      for (let i = 0; i < this.seeds[type]; i++) {
        let position = {
          x: _.random(this.map.length - 1),
          y: _.random(this.map.length - 1)
        };
        // TODO: make sure they're some distance apart
        while (seeds.some((cell) => _.isEqual(cell.position, position))) {
          let position = {
            x: _.random(this.map.length - 1),
            y: _.random(this.map.length - 1)
          };
        }

        let cell = this.map[position.x][position.y];
        cell.type = type;
        cell.biome = this.biomes[type];
        seeds.push(cell);
      }
    });

    this.growVoronoi(seeds);

    this.terrain = new Image();
    this.terrain.src = "../Assets/terrain.png";
    this.terrain.onload = () => this.saveMap();

  }

  // TODO: clean this up a lot
  generate() {
    let seeds = [];
    let used = [];

    _.each(BIOMES, (type) => {
      for (let i = 0; i < this.seeds[type]; i++) {
        let position = {
          x: _.random(this.map.length - 1),
          y: _.random(this.map.length - 1)
        };
        // TODO: make sure they're some distance apart
        while (seeds.some((cells) => cells.some((cell) => _.isEqual(cell.position, position)))) {
          let position = {
            x: _.random(this.map.length - 1),
            y: _.random(this.map.length - 1)
          };
        }

        let cell = this.map[position.x][position.y];
        cell.type = type;
        cell.biome = this.biomes[type];
        used.push(cell);
        seeds.push([cell]);
      }
    });

    this.growCells(seeds, used);

    this.terrain = new Image();
    this.terrain.src = "../Assets/terrain.png";
    this.terrain.onload = () => this.saveMap();
  }
}
