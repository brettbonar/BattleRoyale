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
      cellSize: 3,
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

  jagged(seeds, used) {
    while (seeds.some((cells) => cells.length > 0)) {
      for (const cells of seeds) {
        let cell;
        while (!cell && cells.length > 0) {
          cell = cells[cells.length - 1];
          let neighbors = _.shuffle(cell.neighbors);
          let next;
          for (const neighbor of neighbors) {
            if (neighbor && !used.includes(neighbor)) {
              next = neighbor;
              next.type = cell.type;
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
    }
  }

  smooth(seeds, used) {
    while (seeds.some((cells) => cells.length > 0)) {
      for (const cells of seeds) {
        if (cells.length === 0) continue;
        let weight = this.weights[cells[0].type];
        for (let i = 0; i < weight; i++) {
        }
      }
    }
  }
  
  iterativeJagged(seeds, used) {
    while (seeds.some((cells) => cells.length > 0)) {
      for (const cells of seeds) {
        if (cells.length === 0) continue;
        let weight = this.weights[cells[0].type];
        for (let i = 0; i < weight; i++) {
          let cell;
          while (!cell && cells.length > 0) {
            cell = cells[cells.length - 1];
            let neighbors = _.shuffle(cell.neighbors);
            let next;
            for (const neighbor of neighbors) {
              if (neighbor && !used.includes(neighbor)) {
                next = neighbor;
                next.type = cell.type;
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
      }
    }
  }

  random(seeds, used) {

    while (seeds.some((cells) => cells.length > 0)) {
      let cells = _.sample(seeds);
      //for (const cells of seeds) {
        let cell;
        while (!cell && cells.length > 0) {
          cell = cells[0];
          let neighbors = _.shuffle(cell.neighbors);
          let next;
          for (const neighbor of neighbors) {
            if (neighbor && !used.includes(neighbor)) {
              next = neighbor;
              next.type = cell.type;
              cells.push(next);
              used.push(next);
              break;
            }
          }

          if (!next) {
            cells.shift();
          }

          // cell = cells[cells.length - 1];
          // let neighbors = _.shuffle(cell.neighbors);
          // let next;
          // for (const neighbor of neighbors) {
          //   if (neighbor && !used.includes(neighbor)) {
          //     next = neighbor;
          //     next.type = cell.type;
          //     cells.push(next);
          //     used.push(next);
          //     break;
          //   }
          // }

          // if (!next) {
          //   cells.pop();
          // }
        //}
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
  }
}
