import Vec3 from "../GameObject/Vec3.mjs"
import ImageCache from "../Rendering/ImageCache.mjs"
import Bounds from "../GameObject/Bounds.mjs";
import GameObject from "../GameObject/GameObject.mjs";

export default class Effect {
  constructor(params) {
    this.currentTime = 0;
    this.position = new Vec3(params.position);
    this.lastPosition = new Vec3(params.position);
    this.direction = params.direction;
    this.speed = params.speed;
    this.duration = params.duration;
    this.level = params.level || 0;
    this.objectId = GameObject.getNextObjectId();
    
    if (params.dimensions) {
      this.dimensions = params.dimensions;
    } else if (params.effect && params.effect.radius) {
      this.dimensions = { radius: params.effect.radius };
    }
  }

  get modelBounds() {
    return new Bounds({
      position: this.position,
      dimensions: this.dimensions
    });
  }

  get perspectivePosition() {
    return this.position.plus({ y: this.height + this.position.z });
  }

  get renderObjects() {
    return [this];
  }
  
  get width() {
    return this.dimensions.width;
  }

  get height() {
    return this.dimensions.height;
  }
}
