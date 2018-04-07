import Vec3 from "../GameObject/Vec3.mjs"
import ImageCache from "../Rendering/ImageCache.mjs"

export default class Effect {
  constructor(params) {
    this.currentTime = 0;
    this.position = new Vec3(params.position);
    this.lastPosition = new Vec3(params.position);
    this.direction = params.direction;
    this.speed = params.speed;
    this.duration = params.duration;
    this.dimensions = params.dimensions;
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
