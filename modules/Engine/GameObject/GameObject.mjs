import Bounds from "./Bounds.mjs"
import Vector from "./Vector.mjs"
import Point from "./Point.mjs"
import Dimensions from "./Dimensions.mjs"
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
          if (object[key] !== value) {
            object[key] = value;
            object._modified = true;
            if (key === "position" && this.dimensions) {
              this.updatePosition();
            }
          }
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
      // Dimensions are render dimensions
      dimensions: new Dimensions({
        width: 0,
        height: 0,
        zheight: 0
      }),
      speed: 0,
      zspeed: 0,
      collisionDimensions: [],
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
      level: 0,
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

    this.position = new Point(this.position);    
    this.lastPosition = new Point(this.position);

    if (this.static) {
      this.staticBox = new Bounds({
        position: this.position,
        dimensions: this.dimensions,
        boundsType: this.boundsType
      });
    }

    this.renderObjects = [this];
    this.direction = new Point(this.direction).normalize();
    this.updatePosition();
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

  getAllFunctionBounds() {
    return this.functions.map((fn) => {
      return {
        box: new Bounds({
          dimensions: fn.dimensions,
          position: this.position.minus(fn.offset)
        }),
        cb: fn.cb
      };
    });
  }

  updatePosition() {
    let zheight = this.perspectiveDimensions ? 
      this.perspectiveDimensions.zheight : this.dimensions.zheight;
    let position = new Point(this.position);
    if (this.perspectiveOffset) {
      position.add(this.perspectiveOffset);
    } else if (zheight > 0 && !this.renderClipped) {
      position.add({ y: this.height });
    }
    this.perspectivePosition = position.add({ y: this.position.z });
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

  render(context, elapsedTime, clipping) {
    if (this.visible && this.renderer) {
      this.renderer.render(context, this, elapsedTime, clipping);
    }
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
    return this.bounds.center;

    // if (this.dimensions.width || this.dimensions.height) {
    // } else if (_.isArray(this.dimensions.radius) {
    //   return this.position;
    // } else if ()
  }

  getAllBounds(position, dimensions) {
    if (dimensions) {
      return _.castArray(dimensions).map((dimens) => {
        return new Bounds({
          position: position.plus(dimens.offset),
          dimensions: dimens.dimensions || dimens
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

  getBoundsFromDimens(position, dimens) {
    let bounds = [];
    for (const dimensions of _.castArray(dimens)) {
      if (dimensions.offset) {
        bounds = bounds.concat(_.castArray(dimensions.offset.z).map((z) => {
          let offset = { x: dimensions.offset.x, y: dimensions.offset.y, z: z };
          return new Bounds({
            position: position.plus(offset),
            dimensions: dimensions.dimensions || this.dimensions,
            opacity: dimensions.opacity
          });
        }));
      } else {
        bounds.push(new Bounds({
          position: position,
          dimensions: dimensions.dimensions || this.dimensions,
          opacity: dimensions.opacity
        }));
      }
    }

    return bounds;
  }

  get fadePosition() {
    return this.position.plus(this.fadeEndOffset);
  }
  get fadeBounds() {
    if (this.fadeDimensions) {
      let position = new Point(this.position);
      if (this.fadeDimensions.offset) {
        position.add(this.fadeDimensions.offset);
      }
      return new Bounds({
        position: position,
        dimensions: new Dimensions(this.fadeDimensions.dimensions)
      });
    }
  }

  get lastCollisionBounds() {
    return this.getBoundsFromDimens(this.lastPosition, this.collisionDimensions);
  }

  get collisionBounds() {
    return this.getBoundsFromDimens(this.position, this.collisionDimensions);
  }
  
  get lastLosBounds() {
    return this.getBoundsFromDimens(this.lastPosition,
      _.castArray(this.collisionDimensions).filter((dimens) => dimens.opacity > 0));
  }

  get losBounds() {
    return this.getBoundsFromDimens(this.position,
      _.castArray(this.collisionDimensions).filter((dimens) => dimens.opacity > 0));
  }

  get getLastInteractionsBoundingBox() {
    return this.getAllBounds(this.lastPosition, this.interactionDimensions);
  }

  get interactionsBoundingBox() {
    return this.getAllBounds(this.position, this.interactionDimensions);
  }

  get bounds() {
    return this.boundingBox;
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
    return this.bounds.radius;
  }

  parseDimensions(dimensions) {
    return _.castArray(dimensions).map((dimens) => {
      return Object.assign({}, dimens, { dimensions: new Dimensions(dimens.dimensions) })
    });
  }

  // get terrainVector() {
  //   let mid = new Vector([this.lastPosition, this.position]);
  //   let radius = Math.sqrt(this.terrainDimensions.height * this.terrainDimensions.height + this.terrainDimensions.width * this.terrainDimensions.width) / 2;
  //   mid.extend(radius);
  //   let left = mid.getParallelLine(radius);
  //   let right = mid.getParallelLine(-radius);
  //   return [mid, left, right];    
  // }

  // get vector() {
  //   let mid = new Vector([this.lastPosition, this.position]);
  //   let radius = this.radius;
  //   mid.extend(radius);
  //   let left = mid.getParallelLine(radius);
  //   let right = mid.getParallelLine(-radius);
  //   return [mid, left, right];
  // }

  get sweepBox() {
    return this.Bounds().extend(this.prevBounds());
  }

  get zheight() {
    return this.dimensions.zheight;
  }

  get height() {
    return this.dimensions.height;
  }

  get width() {
    return this.dimensions.width;
  }
  
  getUpdateState() {
    // TODO: probably don't want to do this here
    return _.pick(this, [
      "type",
      "dimensions",
      "visible",
      "direction",
      "position",
      "acceleration",
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
