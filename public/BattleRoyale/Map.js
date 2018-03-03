// import perlin from "./Perlin.js"

const BIOMES = {
  FOREST: "forest",
  DESERT: "desert",
  DEATH: "death",
  PLAIN: "plain",
  WATER: "water"
};

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
        "water": 5
      },
      weights: {
        "forest": 10,
        "desert": 10,
        "death": 10,
        "plain": 50,
        "water": 1
      }
    });
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
        used.push(cell);
        seeds.push([cell]);
      }
    });

    this.iterativeJagged(seeds, used);
  }
}
