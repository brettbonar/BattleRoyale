import Bounds from "./Bounds.mjs"
import Vector from "./Vector.mjs"
import Renderer from "../Rendering/Renderers/Renderer.mjs"
import { SURFACE_TYPE, MOVEMENT_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"

// boundsType: RECTANGLE, CIRCLE, POINT, LINE
// dimensions: radius, width, height
// position: x, y
// rotation: degrees
// spin: degrees / time
// direction: Vector
// speed: distance / time
// acceleration: +/- speed / time
let objectId = 1;

class GameObjectProxy {
  constructor(params) {
    if (!params.static) {
      return new Proxy(this, {
        set: (object, key, value) => {
          object[key] = value;
          object._modified = true;
          return true;
        }
      });
    }
    // else do nothing
  }
}

export default class GameObject extends GameObjectProxy {
  constructor(params) {
    super(params);
    _.merge(this, params);
    _.defaults(this, {
      boundsType: Bounds.TYPE.RECTANGLE,
      dimensions: {
        width: 0,
        height: 0
      },
      functions: [],
      visible: true,
      direction: {
        x: 0,
        y: 0
      },
      position: {
        x: 0,
        y: 0,
        z: 0
      },
      revision: 0,
      renderer: new Renderer(),
      objectId: objectId,
      ownerId: objectId,
      playerId: 0,
      elapsedTime: 0
    });
    _.defaultsDeep(this, {
      physics: {
        surfaceType: SURFACE_TYPE.TERRAIN,
        movementType: MOVEMENT_TYPE.NORMAL
      },
      position: {
        z: 0
      }
    });

    this.lastPosition = Object.assign({}, this.position);
    if (this.static) {
      this.staticBox = new Bounds({
        position: this.position,
        dimensions: this.dimensions,
        boundsType: this.boundsType
      });
    }

    this.normalizeDirection();
    objectId++;
  }

  getDimensionsType(dimensions) {
    if (!_.isUndefined(this.dimensions.width) || !_.isUndefined(this.dimensions.height)) {
      return Bounds.TYPE.RECTANGLE;
    } else if (_.isUndefined(this.dimensions)) {
      return Bounds.TYPE.POINT;
    } else if (_.isArray(this.dimensions)) {
      return Bounds.TYPE.LINE;
    } else if (!_.isUndefined(this.dimensions.radius)) {
      return Bounds.TYPE.CIRCLE;
    }
  }

  get dimensionsType() {
    return this.getDimensionsType(this.dimensions);
  }

  normalize(point) {
    if (point) {
      let norm = Math.sqrt(point.x * point.x + point.y * point.y);
      if (norm !== 0) {
        return {
          x: point.x / norm,
          y: point.y / norm
        }
      }
    }
    return point;
  }

  getAllFunctionBounds() {
    return this.functions.map((fn) => {
      return {
        box: new Bounds({
          dimensions: fn.dimensions,
          position: {
            x: this.position.x + fn.offset.x,
            y: this.position.y + fn.offset.y
          }
        }),
        cb: fn.cb
      };
    });
  }

  get perspectivePosition() {
    if (this.renderOffset) {
      return {
        x: this.position.x + this.renderOffset.x,
        y: this.position.y + this.renderOffset.y
      };
    }
    return {
      x: this.position.x,
      y: this.position.y + this.height
    };
  }

  normalizeDirection() {
    this.normalize(this.direction);
  }

  getCenterOfPoints(points) {
    // TODO: this
  }

  getCenterPoint(dimensions) {
    let type = this.getDimensionsType(dimensions);
    if (type === Bounds.TYPE.LINE) {
      let points = dimensions.map((dimen) => this.getCenterPoint(dimen));
      return this.getCenterOfPoints(points);
    } else if (type === Bounds.TYPE.RECTANGLE) {
      return {
        x: this.position.x + dimensions.width / 2,
        y: this.position.y + dimensions.height / 2
      };
    } else if (type === Bounds.TYPE.POINT) { // point or circle
      return dimensions;
    } else if (type === Bounds.TYPE.CIRCLE) {
      return this.position;
    }

    return this.position;
  }

  update(elapsedTime) {}

  render(context, elapsedTime, center) {
    if (this.visible && this.renderer) {
      this.renderer.render(context, this, elapsedTime, center);
    }
  }

  getAllRenderObjects() {
    return [this];
  }

  get left() {
    return {
      x: this.boundingBox.box.ul.x,
      y: this.center.y
    };
  }

  get right() {
    return {
      x: this.boundingBox.box.lr.x,
      y: this.center.y
    };
  }

  get top() {
    return {
      x: this.center.x,
      y: this.boundingBox.box.ul.y
    };
  }

  get bottom() {
    return {
      x: this.center.x,
      y: this.boundingBox.box.lr.y
    };
  }

  get center() {
    return this.getCenterPoint(this.dimensions);

    // if (this.dimensions.width || this.dimensions.height) {
    // } else if (_.isArray(this.dimensions.radius) {
    //   return this.position;
    // } else if ()
  }

  getAllBounds(position, dimensions) {
    if (dimensions) {
      return _.castArray(dimensions).map((dimens) => {
        let pos = position;
        if (dimens.offset) {
          pos = {
            x: position.x + dimens.offset.x,
            y: position.y + dimens.offset.y
          };
        }
        return new Bounds({
          position: pos,
          dimensions: dimens.dimensions || dimens,
          boundsType: dimens.boundsType || this.boundsType
        });
      });
    }
    
    return [];

    // if (this.bounds) {
    //   return this.bounds.map((bounds) => {
    //     return new Bounds(Object.assign({
    //       position: {
    //         x: this.position.x + bounds.offset.x,
    //         y: this.position.y + bounds.offset.y
    //       }
    //     }, bounds));
    //   });
    // }
    // return [this.boundingBox];
  }

  get getLastInteractionsBoundingBox() {
    return this.getAllBounds(this.lastPosition, this.interactionDimensions);
  }

  get interactionsBoundingBox() {
    return this.getAllBounds(this.position, this.interactionDimensions);
  }
  
  get lastTerrainBoundingBox() {
    let box = this.getAllBounds(this.lastPosition, this.terrainDimensions);
    if (box.length === 0) {
      return [this.prevBounds];
    }
    return box;
  }
  
  get terrainBoundingBox() {
    let box = this.getAllBounds(this.position, this.terrainDimensions);
    if (box.length === 0) {
      return [this.boundingBox];
    }
    return box;
  }
  
  get lastLosBoundingBox() {
    return this.getAllBounds(this.lastPosition, this.losDimensions);
  }

  get losBoundingBox() {
    return this.getAllBounds(this.position, this.losDimensions);
  }

  get lastHitbox() {
    let box = this.getAllBounds(this.lastPosition, this.hitboxDimensions);
    if (box.length === 0) {
      return [this.prevBounds];
    }
    return box;
  }

  get hitbox() {
    let box = this.getAllBounds(this.position, this.hitboxDimensions);
    if (box.length === 0) {
      return [this.boundingBox];
    }
    return box;
  }

  get boundingBox() {
    return this.staticBox || 
      new Bounds({
        position: this.position,
        dimensions: this.dimensions,
        boundsType: this.boundsType
      });
  }

  get prevBounds() {
    return this.staticBox || 
      new Bounds({
        position: this.lastPosition,
        dimensions: this.dimensions,
        boundsType: this.boundsType
      });
  }

  get radius() {
    return this.dimensions.radius ||
      Math.sqrt(this.dimensions.height * this.dimensions.height + this.dimensions.width * this.dimensions.width) / 2;
  }

  get terrainVector() {
    let mid = new Vector([this.lastPosition, this.position]);
    let radius = Math.sqrt(this.terrainDimensions.height * this.terrainDimensions.height + this.terrainDimensions.width * this.terrainDimensions.width) / 2;
    mid.extend(radius);
    let left = mid.getParallelLine(radius);
    let right = mid.getParallelLine(-radius);
    return [mid, left, right];    
  }

  get vector() {
    let mid = new Vector([this.lastPosition, this.position]);
    let radius = this.radius;
    mid.extend(radius);
    let left = mid.getParallelLine(radius);
    let right = mid.getParallelLine(-radius);
    return [mid, left, right];
  }

  get sweepBox() {
    return this.Bounds().extend(this.prevBounds());
  }

  get height() {
    let type = this.dimensionsType;
    if (type === Bounds.TYPE.RECTANGLE) {
      return this.dimensions.height;
    } else if (type === Bounds.TYPE.CIRCLE) {
      return this.dimensions.radius * 2;
    } else if (type === Bounds.TYPE.POINT) {
      return 1;
    } else if (type === Bounds.TYPE.LINE) {
      // TODO: some calculation
    }
  }

  get width() {
    let type = this.dimensionsType;
    if (type === Bounds.TYPE.RECTANGLE) {
      return this.dimensions.width;
    } else if (type === Bounds.TYPE.CIRCLE) {
      return this.dimensions.radius * 2;
    } else if (type === Bounds.TYPE.POINT) {
      return 1;
    } else if (type === Bounds.TYPE.LINE) {
      // TODO: some calculation
    }
  }
  
  getUpdateState() {
    // TODO: probably don't want to do this here
    return _.pick(this, [
      "type",
      "dimensions",
      "visible",
      "direction",
      "position",
      "revision",
      "objectId",
      "ownerId",
      "playerId",
      "elapsedTime",
      "physics"
    ]);
  }

  updateState(object) {
    _.merge(this, object);
  }

  static get BOUNDS_TYPE() { return BOUNDS_TYPE; }
}
