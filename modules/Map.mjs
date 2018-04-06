"use strict";

import { getDistance } from "./util.mjs"
import flavor from "./BattleRoyale/Objects/flavor.mjs"
import ImageCache from "./Engine/Rendering/ImageCache.mjs"
import SimplexNoise from "../shared/SimplexNoise.mjs"

const BIOMES = {
  FOREST: "forest",
  DESERT: "desert",
  DEATH: "death",
  PLAIN: "plain",
  WATER: "water",
  FIRE: "fire"
};

const BIOME_PARAMS = {
  [BIOMES.DEATH]: {
    flavorDensity: 0.05
  },
  [BIOMES.FIRE]: {
    flavorDensity: 0.1
  },
  [BIOMES.WATER]: {
    flavorDensity: 0.1
  },
  [BIOMES.DESERT]: {
    flavorDensity: 0.1,
    sceneDensity: 0.025,
    noise: {
      min: -1,
      max: -0.5
    }
  },
  [BIOMES.FOREST]: {
    flavorDensity: 0.1,
    sceneDensity: 0.025,
    noise: {
      min: 0.25,
      max: 1.0
    }
  },
  [BIOMES.PLAIN]: {
    flavorDensity: 0.1,
    sceneDensity: 0.005,
    noise: {
      min: -0.5,
      max: 0.25
    }
  },
};

const GROWTH_TYPE = {
  JAGGED: "jagged",
  SMOOTH: "smooth"
};

class Tile {
  constructor(params) {
    _.merge(this, params);
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

class Map {
  constructor(params) {
    _.merge(this, params);
    _.defaults(this, {
      mapWidth: 200,
      mapHeight: 200,
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

    if (params && _.isArray(params.map)) {
      this.buildMap(params.map);
    } else {
      this.initializeMap();
      this.generateSimplex();
    }    
  }

  static get BIOMES() { return BIOMES; }
  static get BIOME_PARAMS() { return BIOME_PARAMS; }

  buildMap(map) {
    this.map = [];
    for (let x = 0; x < map.length; x++) {
      let tiles = [];
      for (let y = 0; y < map[x].length; y++) {
        tiles.push(new Tile({
          type: map[x][y].type,
          flavor: map[x][y].flavor,
          position: {
            x: x,
            y: y
          }
        }));
      }
      this.map.push(tiles);
    }

    for (let x = 0; x < map.length; x++) {
      for (let y = 0; y < map[x].length; y++) {
        let tile = this.map[x][y];
        if (x > 0) {
          tile.neighbors.left = this.map[x - 1][y];
        }
        if (x < this.map.length - 1) {
          tile.neighbors.right = this.map[x + 1][y];
        }
        if (y > 0) {
          tile.neighbors.top = this.map[x][y - 1];
        }
        if (y < this.map[x].length - 1) {
          tile.neighbors.bottom = this.map[x][y + 1];
        }
        tile.neighbors.topLeft = this.getTile(x - 1, y - 1);
        tile.neighbors.topRight = this.getTile(x + 1, y - 1);
        tile.neighbors.bottomRight = this.getTile(x + 1, y + 1);
        tile.neighbors.bottomLeft = this.getTile(x - 1, y + 1);
        tile.growNeighbors = [
          tile.neighbors.left,
          tile.neighbors.right,
          tile.neighbors.top,
          tile.neighbors.bottom
        ];
      }
    }

    this.saveMap();
  }

  initializeMap() {
    for (const x in _.range(this.mapWidth)) {
      let tiles = [];
      for (const y in _.range(this.mapHeight)) {
        tiles.push(new Tile({
          position: {
            x: x,
            y: y
          }
        }));
      }
      this.map.push(tiles);
    }

    for (let x = 0; x < this.map.length; x++) {
      for (let y = 0; y < this.map[x].length; y++) {
        let tile = this.map[x][y];
        if (x > 0) {
          tile.neighbors.left = this.map[x - 1][y];
        }
        if (x < this.map.length - 1) {
          tile.neighbors.right = this.map[x + 1][y];
        }
        if (y > 0) {
          tile.neighbors.top = this.map[x][y - 1];
        }
        if (y < this.map[x].length - 1) {
          tile.neighbors.bottom = this.map[x][y + 1];
        }
        tile.neighbors.topLeft = this.getTile(x - 1, y - 1);
        tile.neighbors.topRight = this.getTile(x + 1, y - 1);
        tile.neighbors.bottomRight = this.getTile(x + 1, y + 1);
        tile.neighbors.bottomLeft = this.getTile(x - 1, y + 1);
        tile.growNeighbors = [
          tile.neighbors.left,
          tile.neighbors.right,
          tile.neighbors.top,
          tile.neighbors.bottom
        ];
      }
    }
  }

  growJagged(tiles, used) {
    let tile;
    while (!tile && tiles.length > 0) {
      tile = tiles[tiles.length - 1];
      let neighbors = _.shuffle(tile.growNeighbors);
      let next;
      for (const neighbor of neighbors) {
        if (neighbor && !used.includes(neighbor)) {
          // if (neighbor === tile.neighbors.left || neighbor === tile.neighbors.right) {
          //   let top = tile.neighbors.top;
          //   if (top && !used.includes(top)) {
          //     top.type = tile.type;
          //     top.biome = tile.biome;
          //     tiles.push(top);
          //     used.push(top);
          //   }
          //   let bottom = tile.neighbors.bottom;
          //   if (bottom && !used.includes(bottom)) {
          //     bottom.type = tile.type;
          //     bottom.biome = tile.biome;
          //     tiles.push(bottom);
          //     used.push(bottom);
          //   }
          // } else if (neighbor === tile.neighbors.top || neighbor === tile.neighbors.bottom) {
          //   let left = tile.neighbors.left;
          //   if (left && !used.includes(left)) {
          //     left.type = tile.type;
          //     left.biome = tile.biome;
          //     tiles.push(left);
          //     used.push(left);
          //   }
          //   let right = tile.neighbors.right;
          //   if (right && !used.includes(right)) {
          //     right.type = tile.type;
          //     right.biome = tile.biome;
          //     tiles.push(right);
          //     used.push(right);
          //   }
          // }
          next = neighbor;
          next.type = tile.type;
          tiles.push(next);
          used.push(next);
          break;
        }
      }

      if (!next) {
        tiles.pop();
      }
    }

  }

  growSmooth(tiles, used) {
    let tile;
    while (!tile && tiles.length > 0) {
      tile = tiles[0];
      let neighbors = _.shuffle(tile.growNeighbors);
      let next;
      for (const neighbor of neighbors) {
        if (neighbor && !used.includes(neighbor)) {
          next = neighbor;
          next.type = tile.type;
          tiles.push(next);
          used.push(next);
          break;
        }
      }

      if (!next) {
        tiles.shift();
      }
    }
  }
  getTile(x, y) {
    if (x >= 0 && x < this.map.length && y >= 0 && y < this.map.length) {
      return this.map[x][y];
    }
    return null;
  }

  renderTile(tile, offset, position) {
    let size = this.tileSize;
    offset = offset || Object.assign({}, TERRAIN_OFFSETS[tile.type]);
    position = position || tile.position;

    this.context.drawImage(this.terrain, offset.x, offset.y, size, size,
      position.x * size, position.y * size, size, size);
    if (tile.flavor) {
      let imageParams = _.find(flavor, { name: tile.flavor });
      let dimensions = imageParams.imageDimensions;
      let image = ImageCache.get(imageParams.imageSource);
      this.context.drawImage(image, dimensions.x, dimensions.y, dimensions.width, dimensions.height,
      position.x * size, position.y * size, size, size);
    }
    //this.context.strokeRect(position.x * size, position.y * size, size, size);
  }

  getOffset(tile) {
    let size = this.tileSize;
    let priority = TERRAIN_PRIORITY[tile.type];
    let offset = Object.assign({}, TERRAIN_OFFSETS[tile.type]);
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
    if (tile.neighbors.topLeft && TERRAIN_PRIORITY[tile.neighbors.topLeft.type] > priority) {
      sides.topLeft = true;
      neighbor = tile.neighbors.topLeft;
    }
    if (tile.neighbors.topRight && TERRAIN_PRIORITY[tile.neighbors.topRight.type] > priority) {
      sides.topRight = true;
      neighbor = tile.neighbors.topRight;
    }
    if (tile.neighbors.bottomRight && TERRAIN_PRIORITY[tile.neighbors.bottomRight.type] > priority) {
      sides.bottomRight = true;
      neighbor = tile.neighbors.bottomRight;
    }
    if (tile.neighbors.bottomLeft && TERRAIN_PRIORITY[tile.neighbors.bottomLeft.type] > priority) {
      sides.bottomLeft = true;
      neighbor = tile.neighbors.bottomLeft;
    }
    if (tile.neighbors.bottom && TERRAIN_PRIORITY[tile.neighbors.bottom.type] > priority) {
      sides.bottom = true;
      neighbor = tile.neighbors.bottom;
    }
    if (tile.neighbors.top && TERRAIN_PRIORITY[tile.neighbors.top.type] > priority) {
      sides.top = true;
      neighbor = tile.neighbors.top;
    }
    if (tile.neighbors.right && TERRAIN_PRIORITY[tile.neighbors.right.type] > priority) {
      sides.right = true;
      neighbor = tile.neighbors.right;
    }
    if (tile.neighbors.left && TERRAIN_PRIORITY[tile.neighbors.left.type] > priority) {
      sides.left = true;
      neighbor = tile.neighbors.left;
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

  drawTile(tile) {
    let size = this.tileSize;
    let offset = Object.assign({}, TERRAIN_OFFSETS[tile.type]);
    let priority = TERRAIN_PRIORITY[tile.type];
    let neighbor;
    let sides = {
      top: false,
      bottom: false,
      left: false,
      right: false
    };

    let result = this.getOffset(tile);

    if (result.neighbor) {
      let neighborTile = new Tile({
        position: tile.position
      });
      neighborTile.neighbors = tile.neighbors;
      neighborTile.type = result.neighbor.type;
      this.renderTile(neighborTile, null, tile.position);
    }
    
    this.renderTile(tile, result.offset);
  }

  serializeMap(map) {
    return map.map((column) => {
      return column.map((tile) => {
        return {
          type: tile.type, flavor: tile.flavor
        };
      })
    });
  }

  toJSON() {
    return {
      mapWidth: this.mapWidth,
      mapHeight: this.mapHeight,
      tileSize: this.tileSize,
      map: this.serializeMap(this.map)
    };
  }

  saveMap() {
    this.terrain = new Image();
    this.terrain.src = "/Assets/terrain.png";
    this.terrain.onload = () => {
      this.canvas = $("<canvas>", {
        class: "game-canvas map-save-canvas"
      }).appendTo(document.getElementById("canvas-group"))[0];
      this.canvas.width = this.tileSize * this.mapWidth;
      this.canvas.height = this.tileSize * this.mapHeight;
      this.context = this.canvas.getContext("2d");
      for (const column of this.map) {
        for (const tile of column) {
          this.drawTile(tile);
        }
      }
    }
  }

  render(context, position, location, dimensions) {
    if (this.canvas) {
      if (location) {
        if (dimensions) {
          context.drawImage(this.canvas, 
            position.x - dimensions.width / 2, position.y - dimensions.height / 2, dimensions.width, dimensions.height,
            location.position.x, location.position.y, location.dimensions.width, location.dimensions.height);  
        } else {
          context.drawImage(this.canvas, location.position.x, location.position.y, location.dimensions.width, location.dimensions.height);  
        }
      } else {
        context.drawImage(this.canvas, position.x - context.canvas.width / 2, position.y - context.canvas.height / 2,
          context.canvas.width, context.canvas.height, 0, 0, context.canvas.width, context.canvas.height);
        //context.drawImage(this.canvas, 0, 0, context.canvas.width, context.canvas.height);
      }
    }
  }

  initTile(tile, type) {
    tile.type = type;
    if (Math.random() <= BIOME_PARAMS[type].flavorDensity) {
      tile.flavor = _.sample(_.filter(flavor, { biome: type })).name;
    }
  }

  growVoronoi(seeds) {
    // let box = {
    //   xl: 0,
    //   xr: this.mapSize * this.tileSize - 1,
    //   yt: 0,
    //   yb: this.mapSize * this.tileSize - 1
    // };

    // let voronoi = new Voronoi();
    // voronoi.compute(_.map(seeds, "position"), box).tiles;
    
    for (const column of this.map) {
      for (const tile of column) {
        let seed = _.minBy(seeds, (seed) => {
          return getDistance(seed.position, tile.position);
        });
        this.initTile(tile, seed.type); 
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
        while (seeds.some((tile) => _.isEqual(tile.position, position))) {
          let position = {
            x: _.random(this.map.length - 1),
            y: _.random(this.map.length - 1)
          };
        }

        let tile = this.map[position.x][position.y];
        this.initTile(tile, type);
        seeds.push(tile);
      }
    });

    this.growVoronoi(seeds);
  }

  getTileType(noise) {
    return _.findKey(BIOME_PARAMS, (params, type) => {
      return params.noise && noise < params.noise.max && noise >= params.noise.min;
    });
  }

  initTileSimplex(tile, noise) {
    let type = this.getTileType(noise);
    tile.type = type;
    // Get noise in 0-1 range
    tile.noise = (noise - BIOME_PARAMS[type].noise.min) / (BIOME_PARAMS[type].noise.max - BIOME_PARAMS[type].noise.min);
    if (Math.random() <= BIOME_PARAMS[type].flavorDensity) {
      let tileFlavor = _.sample(_.filter(flavor, { biome: type }));
      if (tileFlavor) {
        tile.flavor = tileFlavor.name;
      }
    }
  }

  generateSimplex() {
    let simplexNoise = new SimplexNoise();

    let width = this.map.length;
    for (let x = 0; x < width; x++) {
      let height = this.map[x].length;
      for (let y = 0; y < height; y++) {
        let noise = simplexNoise.noise2D(x / width - 0.5, y / height - 0.5)
        this.initTileSimplex(this.map[x][y], noise);
      }
    }    
  }
}

export default Map;
