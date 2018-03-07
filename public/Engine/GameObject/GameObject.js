import Bounds from "./Bounds.js"
import Vector from "./Vector.js"
import Renderer from "../Rendering/Renderers/Renderer.js"
import { SURFACE_TYPE, MOVEMENT_TYPE } from "../../Engine/Physics/PhysicsConstants.js"

// boundsType: RECTANGLE, CIRCLE, POINT, LINE
// dimensions: radius, width, height
// position: x, y
// rotation: degrees
// spin: degrees / time
// direction: Vector
// speed: distance / time
// acceleration: +/- speed / time
export default class GameObject {
  constructor(params) {
    Object.assign(this, params);
    _.defaults(this, {
      boundsType: Bounds.TYPE.RECTANGLE,
      dimensions: {
        width: 0,
        height: 0
      },
      // direction: {
      //   x: 0,
      //   y: 0
      // },
      position: {
        x: 0,
        y: 0
      },
      renderer: new Renderer()
    });
    _.defaultsDeep(this, {
      physics: {
        surfaceType: SURFACE_TYPE.TERRAIN,
        movementType: MOVEMENT_TYPE.NORMAL
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
  }

  getDimensionsType(dimensions) {
    if (_.isUndefined(this.dimensions)) {
      return Bounds.TYPE.POINT;
    } else if (_.isArray(this.dimensions)) { // line
      return Bounds.TYPE.LINE;
    } else if (this.dimensions.width || this.dimensions.height) {
      return Bounds.TYPE.RECTANGLE;
    } else if (this.dimensions.radius) {
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
    return [];
  }

  get perspectivePosition() {
    if (this.renderOffset) {
      return {
        x: this.position.x + this.renderOffset.x,
        y: this.position.y + this.renderOffset.y
      };
    }
    return this.position;
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
        x: this.position.x,
        y: this.position.y - dimensions.height / 2
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
    this.renderer.render(context, this, elapsedTime, center);
  }

  getAllRenderObjects() {
    return [this];
  }

  getAllBounds() {
    if (this.bounds) {
      return this.bounds.map((bounds) => {
        return new Bounds(Object.assign({
          position: {
            x: this.position.x + bounds.offset.x,
            y: this.position.y + bounds.offset.y
          }
        }, bounds));
      });
    }
    return [this.boundingBox];
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
  
  get lastTerrainBoundingBox() {
    return this.terrainDimensions && 
      new Bounds({
        position: this.lastPosition,
        dimensions: this.terrainDimensions,
        boundsType: this.boundsType
      });
  }
  
  get terrainBoundingBox() {
    return this.terrainDimensions && 
      new Bounds({
        position: this.position,
        dimensions: this.terrainDimensions,
        boundsType: this.boundsType
      });
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

  static get BOUNDS_TYPE() { return BOUNDS_TYPE; }
}
