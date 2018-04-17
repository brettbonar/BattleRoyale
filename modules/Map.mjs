"use strict";

import { getDistance } from "./util.mjs"
import flavor from "./BattleRoyale/Objects/flavor.mjs"
import ImageCache from "./Engine/Rendering/ImageCache.mjs"
import SimplexNoise from "../shared/SimplexNoise.mjs"
import Canvas from "./Engine/Rendering/Canvas.mjs";
import Bounds from "./Engine/GameObject/Bounds.mjs"

const MAX_CANVAS_SIZE = 1024;
const MINIMAP_CANVAS_SIZE = 2048;
const DEFAULT_MAP_SIZE = 512;

const BIOMES = {
  FOREST: "forest",
  DESERT: "desert",
  DEATH: "death",
  PLAIN: "plain",
  WATER: "water",
  FIRE: "fire",
  STONE: "stone"
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
      min: -0.5,
      max: 0.25
    }
  },
  [BIOMES.PLAIN]: {
    flavorDensity: 0.1,
    sceneDensity: 0.005,
    noise: {
      min: 0.25,
      max: 1.0
    }
  },
  [BIOMES.STONE]: {
    flavorDensity: 0.1
    //sceneDensity: 0.005,
    // noise: {
    //   min: -0.5,
    //   max: 0.25
    // }
  }
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
  [BIOMES.PLAIN]: 4,
  [BIOMES.STONE]: 5
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
  },
  [BIOMES.STONE]: {
    x: 128,
    y: 480
  }
};

class Map {
  constructor(params) {
    _.merge(this, params);
    _.defaults(this, {
      mapWidth: DEFAULT_MAP_SIZE,
      mapHeight: DEFAULT_MAP_SIZE,
      tileSize: 32,
      map: [],
      objects: [],
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

    let totalMapWidth = this.mapWidth * this.tileSize;
    let totalMapHeight = this.mapHeight * this.tileSize;
    let numColumns = Math.ceil(totalMapWidth / MAX_CANVAS_SIZE);
    let numRows = Math.ceil(totalMapHeight / MAX_CANVAS_SIZE);
    // TRICKY: extend dimensions a little to avoid rendering artifacts
    let mapWidth = Math.ceil(totalMapWidth / numColumns);
    let mapHeight = Math.ceil(totalMapHeight / numRows);

    let mapCanvasWidth = mapWidth + 5;
    let mapCanvasHeight = mapHeight + 5;

    let mapTileWidth = Math.ceil(mapCanvasWidth / this.tileSize);
    let mapTileHeight = Math.ceil(mapCanvasHeight / this.tileSize);

    this.mapParams = {
      totalMapWidth: totalMapWidth,
      totalMapHeight: totalMapHeight,
      numColumns: numColumns,
      numRows: numRows,
      mapWidth: mapWidth,
      mapHeight: mapHeight,
      mapCanvasWidth: mapCanvasWidth,
      mapCanvasHeight: mapCanvasHeight,
      mapTileWidth: mapTileWidth,
      mapTileHeight: mapTileHeight
    };
    
    if (params && _.isArray(params.map)) {
      this.buildMap(params.map);
    } else {
      this.initializeMap();
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

  getTile(x, y) {
    if (x >= 0 && x < this.map.length && y >= 0 && y < this.map.length) {
      return this.map[x][y];
    }
    return null;
  }

  renderFullMapToMinimap(renderingEngine) {
    for (let x = 0; x < this.mapParams.numColumns; x++) {
      for (let y = 0; y < this.mapParams.numRows; y++) {
        let minimap = this.minimapCanvases[x][y];
        minimap.context.drawImage(this.mapCanvases[x][y].canvas, 0, 0, minimap.canvas.width, minimap.canvas.height);
        minimap.context.save();
        minimap.context.translate(minimap.offset.x, minimap.offset.y);
        renderingEngine.render(minimap.context, this.objects, 0, { x: 0, y: 0 });
        minimap.context.restore();
      }
    }

    let temp = Canvas.create({
      width: MINIMAP_CANVAS_SIZE,
      height: MINIMAP_CANVAS_SIZE
    });
    this.minimapCanvas = temp.canvas;
    this.minimapContext = temp.context;

    this.renderMinimapFull(this.minimapContext, location);
  }

  createMinimap(renderingEngine) {
    if (this.minimapCanvases && this.minimapCanvases.length > 0) {
      this.renderFullMapToMinimap(renderingEngine);
      // this.minimapContext.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height,
      //   0, 0, this.minimapCanvas.width, this.minimapCanvas.height);
    } else {
      this.renderingEngine = renderingEngine;
    }
  }

  renderTile(context, positionOffset, tile, offset, position) {
    let size = this.tileSize;
    offset = offset || Object.assign({}, TERRAIN_OFFSETS[tile.type]);
    position = position || tile.position;

    context.drawImage(this.terrain, offset.x, offset.y, size, size,
      position.x * size + positionOffset.x, position.y * size + positionOffset.y, size, size);
    if (tile.flavor) {
      let imageParams = _.find(flavor, { name: tile.flavor });
      let dimensions = imageParams.imageDimensions;
      let image = ImageCache.get(imageParams.imageSource);
      context.drawImage(image, dimensions.x, dimensions.y, dimensions.width, dimensions.height,
      position.x * size + positionOffset.x, position.y * size + positionOffset.y, size, size);
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

  drawTile(context, tile, positionOffset) {
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
      this.renderTile(context, positionOffset, neighborTile, null, tile.position);
    }
    
    this.renderTile(context, positionOffset, tile, result.offset);
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
      map: this.serializeMap(this.map),
      objects: this.objects.map((obj) => obj.getUpdateState())
    };
  }

  preRenderMap() {
    let totalMapWidth = this.mapParams.totalMapWidth;
    let totalMapHeight = this.mapParams.totalMapHeight;
    let numColumns = this.mapParams.numColumns;
    let numRows = this.mapParams.numRows;
    let mapWidth = this.mapParams.mapWidth;
    let mapHeight = this.mapParams.mapHeight;
    let mapTileWidth = this.mapParams.mapTileWidth;
    let mapTileHeight = this.mapParams.mapTileHeight;

    this.mapCanvases = new Array(numColumns);
    this.minimapCanvases = new Array(numColumns);

    for (let x = 0; x < numColumns; x++) {
      this.mapCanvases[x] = new Array(numRows);
      this.minimapCanvases[x] = new Array(numRows);
      for (let y = 0; y < numRows; y++) {
        let canvas = Canvas.create({
          width: this.mapParams.mapCanvasWidth,
          height: this.mapParams.mapCanvasHeight
        });

        let minimapCanvas = Canvas.create({
          width: this.mapParams.mapCanvasWidth,
          height: this.mapParams.mapCanvasHeight
        });

        let context = canvas.context;
        let minimapContext = minimapCanvas.context;
        let offset = {
          x: -x * mapWidth,
          y: -y * mapHeight
        };

        let maxX = Math.min(this.mapWidth - 1, x * mapTileWidth + mapTileWidth);
        let maxY = Math.min(this.mapHeight - 1, y * mapTileHeight + mapTileHeight);
        for (let tileX = x * (mapTileWidth - 1); tileX < maxX; tileX++) {
          for (let tileY = y * (mapTileHeight - 1); tileY < maxY; tileY++) {
            this.drawTile(context, this.map[tileX][tileY], offset);
          }
        }

        this.mapCanvases[x][y] = {
          canvas: canvas.canvas,
          context: context,
          offset: offset,
          bounds: new Bounds({
            position: {
              x: x * mapWidth,
              y: y * mapHeight
            },
            dimensions: {
              width: mapWidth,
              height: mapHeight
            }
          })
        };

        this.minimapCanvases[x][y] = {
          canvas: minimapCanvas.canvas,
          context: minimapContext,
          offset: offset,
          bounds: new Bounds({
            position: {
              x: x * mapWidth,
              y: y * mapHeight
            },
            dimensions: {
              width: mapWidth,
              height: mapHeight
            }
          })
        };
      }
    }
  }

  saveMap() {
    this.terrain = new Image();
    this.terrain.src = "/Assets/terrain.png";
    this.terrain.onload = () => {
      this.preRenderMap();

      if (this.renderingEngine) {
        this.createMinimap(this.renderingEngine);
      }
    }
  }

  renderImpl(canvases, context, position) {
    let dimensions = {
      width: context.canvas.width,
      height: context.canvas.height
    };

    let ul = {
      x: position.x - dimensions.width / 2,
      y: position.y - dimensions.height / 2
    };
    let lr = {
      x: ul.x + dimensions.width,
      y: ul.y + dimensions.height
    };

    let xstart = _.clamp(Math.floor(ul.x / this.mapParams.mapWidth), 0, canvases.length - 1);
    let xend = _.clamp(Math.floor(lr.x / this.mapParams.mapWidth), 0, canvases.length - 1);
    let ystart = _.clamp(Math.floor(ul.y / this.mapParams.mapHeight), 0, canvases[0].length - 1);
    let yend = _.clamp(Math.floor(lr.y / this.mapParams.mapHeight), 0, canvases[0].length - 1);

    for (let x = xstart; x <= xend; x++) {
      for (let y = ystart; y <= yend; y++) {
        let map = canvases[x][y];
        let offset = {
          x: ul.x - map.bounds.ul.x,
          y: ul.y - map.bounds.ul.y
        };
        // TRICKY: add 1 to avoid rendering artifacts in FF
        let width = 1 + map.bounds.width - offset.x;
        let height = 1 + map.bounds.height - offset.y;
        context.drawImage(map.canvas, Math.max(0, offset.x), Math.max(0, offset.y), width, height,
          Math.max(0, -offset.x), Math.max(0, -offset.y), width, height);
      }
    }
  }

  renderMinimapFull(context) {
    let minimapGridWidth = context.canvas.width / this.mapParams.numColumns;
    let minimapGridHeight = context.canvas.height / this.mapParams.numRows;

    for (let x = 0; x < this.mapParams.numColumns; x++) {
      for (let y = 0; y < this.mapParams.numRows; y++) {
        let map = this.minimapCanvases[x][y];
        context.drawImage(map.canvas,
          x * minimapGridWidth, y * minimapGridHeight,
          minimapGridWidth, minimapGridHeight);
      }
    }
  }

  renderMinimap(context, location, position, dimensions) {
    if (this.minimapCanvas) {
      if (position && dimensions) {
        let xscale = this.minimapCanvas.width / this.mapParams.totalMapWidth;
        let yscale = this.minimapCanvas.height / this.mapParams.totalMapHeight;
        context.drawImage(this.minimapCanvas, 
          position.x * xscale - dimensions.width * xscale / 2, position.y * yscale - dimensions.height * yscale / 2,
          dimensions.width * xscale, dimensions.height * yscale,
          location.position.x, location.position.y, location.dimensions.width, location.dimensions.height);
      } else {
        context.drawImage(this.minimapCanvas, location.position.x, location.position.y, location.dimensions.width, location.dimensions.height);
      }
    }
  }

  render(context, position) {
    if (this.mapCanvases && this.mapCanvases.length > 0) {
      this.renderImpl(this.mapCanvases, context, position);
    }
  }

  getTileType(noise) {
    return _.findKey(BIOME_PARAMS, (params, type) => {
      return params.noise && noise < params.noise.max && noise >= params.noise.min;
    });
  }

  getTileAtPos(position) {
    return this.map[Math.floor(position.x / this.tileSize)][Math.floor(position.y / this.tileSize)];
  }

  initTile(tile, type) {
    tile.type = type;
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
        let noise = simplexNoise.noise2D(x / 256 - 0.5, y / 256 - 0.5)
        let type = this.getTileType(noise);
        // Get noise in 0-1 range
        //tile.noise = (noise - BIOME_PARAMS[type].noise.min) / (BIOME_PARAMS[type].noise.max - BIOME_PARAMS[type].noise.min);
        this.initTile(this.map[x][y], type);
      }
    }    
  }
}

export default Map;
