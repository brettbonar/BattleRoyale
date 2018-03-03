// import perlin from "./Perlin.js"

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
      up: null,
      down: null
    };
  }
}

export default class Map {
  constructor(params) {
    Object.assign(this, params);
    _.defaults(this, {
      mapSize: 100,
      cellSize: 32,
      tileSize: 32,
      map: [],
      seeds: {
        "forest": 2,
        "desert": 2,
        "death": 2,
        "plain": 1,
        "water": 3,
        "fire": 3
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
    this.generate();
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
          cell.neighbors.up = this.map[x][y - 1];
        }
        if (y < this.map[x].length - 1) {
          cell.neighbors.down = this.map[x][y + 1];
        }
      }
    }
  }

  growJagged(cells, used) {
    let cell;
    while (!cell && cells.length > 0) {
      cell = cells[cells.length - 1];
      let neighbors = _.shuffle(cell.neighbors);
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
        cells.pop();
      }
    }

  }

  growSmooth(cells, used) {
    let cell;
    while (!cell && cells.length > 0) {
      cell = cells[0];
      let neighbors = _.shuffle(cell.neighbors);
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
    let size = this.cellSize;
    for (const column of this.map) {
      for (const cell of column) {
        let offset;
        if (cell.type === "forest") {
          offset = {
            x: size * 6 + size * _.random(0, 2),
            y: size * 11
          };
        } else if (cell.type === "desert") {
          offset = {
            x: size * 18 + size * _.random(0, 2),
            y: size * 11
          };
        } else if (cell.type === "death") {
          offset = {
            x: size * 9 + size * _.random(0, 2),
            y: size * 5
          };
        } else if (cell.type === "plain") {
          offset = {
            x: 0 + size * _.random(0, 2),
            y: size * 11
          };
        } else if (cell.type === "water") {
          offset = {
            x: size * 15 + size * _.random(0, 2),
            y: size * 17
          };
        } else if (cell.type === "fire") {
          offset = {
            x: size * 15 + size * _.random(0, 2),
            y: size * 5
          };
        }

        this.context.drawImage(this.terrain, offset.x, offset.y, size, size,
          parseInt(cell.position.x, 10) * size, parseInt(cell.position.y, 10) * size, size, size);
      }
    }
  }

  render(context, position) {
    if (this.canvas) {
    context.drawImage(this.canvas, position.x - context.canvas.width / 2, position.y - context.canvas.height / 2,
      context.canvas.width, context.canvas.height, 0, 0, context.canvas.width, context.canvas.height);
    }
    //context.drawImage(this.canvas, 0, 0, context.canvas.width, context.canvas.height);
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
