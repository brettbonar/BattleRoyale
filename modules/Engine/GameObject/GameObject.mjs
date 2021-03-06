import Bounds from "./Bounds.mjs"
import Vec3 from "./Vec3.mjs"
import Dimensions from "./Dimensions.mjs"
import Renderer from "../Rendering/Renderers/Renderer.mjs"
import { SURFACE_TYPE, MOVEMENT_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"
import GameSettings from "../GameSettings.mjs";

let objectId = GameSettings.isServer ? 1 : -1;

class GameObjectProxy {
  constructor(params) {
    this._modified = true;
    this._modifiedKeys = [];

    if (!params.static) {
      return new Proxy(this, {
        set: (object, key, value) => {
          if (object[key] !== value) {
            object[key] = value;
            object._modified = true;
            //object._modifiedKeys.push(key);
            // if (key === "position" && this.dimensions) {
            //   this.updatePosition();
            // }
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
    this.type = "GameObject";
    _.merge(this, params);
    _.defaults(this, {
      audio: [],
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
      hidden: false,
      direction: {
        x: 0,
        y: 0
      },
      position: {
        x: 0,
        y: 0,
        z: 0
      },
      team: 0,
      level: 0,
      revision: 0,
      renderer: new Renderer(),
      objectId: GameObject.getNextObjectId(),
      playerId: 0,
      elapsedTime: 0
    });
    _.defaultsDeep(this, {
      ownerId: this.objectId,
      physics: {
        surfaceType: SURFACE_TYPE.TERRAIN,
        movementType: MOVEMENT_TYPE.NORMAL,
        elasticity: 0,
        reflectivity: 0,
        solidity: 1.0,
        force: 1.0,
        push: true,
        alwaysPushed: false
      },
      position: {
        z: 0
      }
    });

    this.position = new Vec3(this.position);    
    this.lastPosition = new Vec3(this.position);
    this.grids = [];

    if (this.static) {
      this.staticBox = new Bounds({
        position: this.position,
        dimensions: this.dimensions,
        boundsType: this.boundsType
      });
    }

    this.renderObjects = [this];
    this.direction = new Vec3(this.direction).normalize();
    this.updatePosition();

  }

  static getNextObjectId() {
    // TODO: fix this hack
    if (GameSettings.isServer) {
      return objectId++;
    } else {
      return objectId--;
    }
  }

  get x() { return this.position.x }
  get y() { return this.position.y }

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
        bounds: new Bounds({
          dimensions: fn.bounds.dimensions,
          position: this.position.plus(fn.bounds.offset),
          boundsType: fn.bounds.boundsType
        }),
        cb: fn.cb
      };
    });
  }

  updatePosition() {
    this._modified = true;
    this._collisionBounds = null;
    this._lastCollisionBounds = null;
    this._collisionExtents = null;
    let zheight = this.dimensions.zheight || 0;

    // Anything with a z position and zheight of 0 should be rendered as ground
    // This is so FOV bounds work properly
    if (this.position.z <= 0 && !zheight) {
      this.perspectivePosition = new Vec3({
        y: 0
      });
    } else {
      this.perspectivePosition = {
        x: this.position.x,
        y: this.position.y + this.position.z + zheight
      };
    }
    if (this.perspectiveOffset) {
      this.perspectivePosition.x += this.perspectiveOffset.x;
      this.perspectivePosition.y += this.perspectiveOffset.y;
    }

    if (this.static) {
      this.staticBox = new Bounds({
        position: this.position,
        dimensions: this.dimensions,
        boundsType: this.boundsType
      });
    }
    
    this.updateBounds();
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

  render(context, elapsedTime, clipping, center) {
    if (!this.hidden && this.renderer) {
      this.renderer.render(context, this, elapsedTime, clipping, center);
    }
  }

  get left() {
    return new Vec3({
      x: this.boundingBox.box.ul.x,
      y: this.center.y,
      z: this.position.z
    });
  }

  get right() {
    return new Vec3({
      x: this.boundingBox.box.lr.x,
      y: this.center.y,
      z: this.position.z
    });
  }

  get top() {
    return new Vec3({
      x: this.center.x,
      y: this.boundingBox.box.ul.y,
      z: this.position.z
    });
  }

  get bottom() {
    return new Vec3({
      x: this.center.x,
      y: this.boundingBox.box.lr.y,
      z: this.position.z
    });
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

  setLevel(level) {
    this.level = level;
    this._modified = true;
  }

  getRayBounds(dimensions) {
    // Place the ray start/end positions perpendicular to the path of the start/end position of this object
    let direction = this.position.minus(this.lastPosition).normalize();
    let start = this.lastPosition.plus({
      x: (dimensions.dimensions.rayDistance / 2) * direction.y,
      y: -(dimensions.dimensions.rayDistance / 2) * direction.x
    });
    let end = this.position.plus({
      x: (dimensions.dimensions.rayDistance / 2) * direction.y,
      y: -(dimensions.dimensions.rayDistance / 2) * direction.x
    });
    return new Bounds({
      dimensions: {
        line: [start, end]
      },
      opacity: dimensions.opacity
    });
  }

  getBoundsFromDimens(position, dimens) {
    if (!dimens) return [];

    let bounds = [];
    dimens = _.castArray(dimens);
    for (const dimensions of dimens) {
      if (dimensions.boundsType === Bounds.TYPE.RAY) {
        bounds.push(this.getRayBounds(dimensions));
      } else {
        bounds.push(new Bounds({
          position: position.plus(dimensions.offset),
          dimensions: dimensions.dimensions || this.dimensions,
          opacity: dimensions.opacity,
          boundsType: dimensions.boundsType
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
      let position = new Vec3(this.position);
      if (this.fadeDimensions.offset) {
        position.add(this.fadeDimensions.offset);
      }
      return new Bounds({
        position: position,
        dimensions: new Dimensions(this.fadeDimensions.dimensions)
      });
    }
  }

  updateBounds() {
    this._modified = true;
    let position = {
      x: this.position.x,
      y: this.position.y - this.position.z,
      z: 0
    };
    if (this.modelDimensions) {
      this.modelBounds = new Bounds({
        position: {
          x: position.x + this.modelDimensions.offset.x,
          y: position.y + this.modelDimensions.offset.y
        },
        dimensions: this.modelDimensions.dimensions,
        boundsType: this.modelDimensions.boundsType
      });
    } else {
      this.modelBounds = new Bounds({
        position: position,
        dimensions: this.dimensions,
        boundsType: this.boundsType
      });
    }
    // if (this.lastPosition) {
    //   this.lastCollisionBounds = this.getBoundsFromDimens(this.lastPosition, this.collisionDimensions);
    //   this.collisionBounds = this.getBoundsFromDimens(this.position, this.collisionDimensions);
    //   this.lastLosBounds = this.getBoundsFromDimens(this.lastPosition,
    //       _.castArray(this.collisionDimensions).filter((dimens) => dimens.opacity > 0));
    //   this.losBounds = this.getBoundsFromDimens(this.position,
    //       _.castArray(this.collisionDimensions).filter((dimens) => dimens.opacity > 0));
    //   this.getLastInteractionsBounds = this.getAllBounds(this.lastPosition, this.interactionDimensions);
    //   this.interactionsBounds = this.getAllBounds(this.position, this.interactionDimensions);
    //   this.boundingBox = this.staticBox || 
    //       new Bounds({
    //         position: this.position,
    //         dimensions: this.dimensions,
    //         boundsType: this.boundsType
    //       });
    //   this.bounds = this.boundingBox;
    //   this.prevBounds = this.staticBox || 
    //     new Bounds({
    //       position: this.lastPosition,
    //       dimensions: this.dimensions,
    //       boundsType: this.boundsType
    //     });
    //   }
  }

  get lastCollisionBounds() {
    if (this._lastCollisionBounds) {
      return this._lastCollisionBounds;
    }
    return this.getBoundsFromDimens(this.lastPosition, this.collisionDimensions);
  }

  get collisionBounds() {
    if (this._collisionBounds) {
      return this._collisionBounds;
    }
    return this.getBoundsFromDimens(this.position, this.collisionDimensions);
  }

  get collisionExtents() {
    if (this._collisionExtents) {
      return this._collisionExtents;
    }

    let bounds = this.collisionBounds
      .concat(this.interactionsBounds)
      .concat(_.map(this.getAllFunctionBounds(), ("bounds")));
    if (bounds.length > 0) {
      if (bounds[0].type === Bounds.TYPE.AABB) {
        bounds = bounds.concat(this.lastCollisionBounds);
        return bounds.reduce((prev, current) => {
          return prev.plus(current);
        }, bounds[0]);
      } else {
        // TODO: get rid of this hack for ShadowField
        return bounds[0];
      }
    }
    return null;
  }
  
  get lastLosBounds() {
    return this.getBoundsFromDimens(this.lastPosition,
      _.castArray(this.collisionDimensions).filter((dimens) => dimens.opacity > 0));
  }

  get losBounds() {
    return this.getBoundsFromDimens(this.position,
      _.castArray(this.collisionDimensions).filter((dimens) => dimens.opacity > 0));
  }

  get getLastInteractionsBounds() {
    return this.getBoundsFromDimens(this.lastPosition, this.interactionDimensions);
  }

  get interactionsBounds() {
    return this.getBoundsFromDimens(this.position, this.interactionDimensions);
  }

  get bounds() {
    return this.boundingBox;
  }

  get visibleBounds() {
    if (this.visibleDimensions) {
      return this.getBoundsFromDimens(this.position, this.visibleDimensions);
    }
    return [this.modelBounds];
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
    return this.dimensions.height || this.dimensions.radius * 2;
  }

  get width() {
    return this.dimensions.width || this.dimensions.radius * 2;
  }

  moveTo(position) {
    this.targetPosition = position;
    this.setDirection(new Vec3(position).minus(this.position));
  }
  
  getInitializeState() {
    return this.getUpdateState();
  }

  getUpdateState() {
    // TODO: probably don't want to do this here
    return _.pick(this, [
      "type",
      "dimensions",
      //"hidden",
      "direction",
      "position",
      "acceleration",
      "revision",
      "objectId",
      "ownerId",
      "playerId",
      "elapsedTime",
      "physics",
      "speed",
      "zspeed",
      "level"
    ]);
    // return _.pick(_.pick(this, [
    //   "type",
    //   "dimensions",
    //   //"hidden",
    //   "direction",
    //   "position",
    //   "acceleration",
    //   "revision",
    //   "objectId",
    //   "ownerId",
    //   "playerId",
    //   "elapsedTime",
    //   "physics",
    //   "speed",
    //   "zspeed",
    //   "level"
    // ]), this._modifiedKeys);
  }

  updateState(object) {
    _.merge(this, object);
    this.updatePosition();
  }

  static get BOUNDS_TYPE() { return BOUNDS_TYPE; }
}
