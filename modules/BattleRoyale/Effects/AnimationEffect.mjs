//import Effect from "../../Engine/Effects/Effect.mjs";
import ImageCache from "../../Engine/Rendering/ImageCache.mjs"

function getOffset(animation, frame, imageSize) {
  let offset = ANIMATION_SETTINGS[animation].offset;
  return {
    x: offset.x + frame * imageSize,
    y: offset.y * imageSize
  };
}

export default class AnimationEffect {
  constructor(params, effect) {
    //super(params);
    _.merge(this, params);
    Object.assign(this, effect);

    this.image = ImageCache.get(effect.imageSource);
    this.frame = 0;
    this.currentTime = 0;
    this.totalTime = 0;
  }

  render(context, elapsedTime) {
    if (!this.image.complete) {
      return;
    }

    let offset = {
      x: this.frame * this.imageSize,
      y: 0,//this.frame * this.projectile.imageSize
    };
    
    if (this.rotation) {
      context.translate(pos.x + this.imageSize / 2, pos.y + this.imageSize / 2);
      context.rotate((this.rotation * Math.PI) / 180);
      context.translate(-(pos.x + this.imageSize / 2), -(pos.y + this.imageSize / 2));        
    }

    context.drawImage(this.image, offset.x, offset.y,
      this.imageSize, this.imageSize,
      this.position.x - this.imageSize / 2, this.position.y - this.imageSize / 2, this.imageSize, this.imageSize);
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;
    while (this.currentTime > 1000 / this.framesPerSec) {
      this.currentTime -= 1000 / this.framesPerSec;
      this.frame++;
      if (this.frame >= this.frames) {
        if (this.repeat) {
          this.frame = this.cycleStart || 0;
        } else {
          this.frame = this.frames - 1;
          this.done = true;
        }
      }
    }

    if (this.totalTime >= this.duration) {
      this.done = true;
    }
  }
}
