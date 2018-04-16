//import Effect from "../../Engine/Effects/Effect.mjs";
import ImageCache from "../../Engine/Rendering/ImageCache.mjs"
import Effect from "./Effect.mjs"

export default class AnimationEffect extends Effect {
  constructor(params, effect) {
    super(params);
    _.merge(this, params);
    Object.assign(this, effect);

    this.renderSize = this.renderSize || this.imageSize;
    this.image = ImageCache.get(effect.imageSource);
    this.frame = 0;
    this.currentTime = 0;
    this.totalTime = 0;
    this.dimensions = {
      width: effect.imageSize,
      height: effect.imageSize
    };
  }

  applyFade(context) {
    if (this.fade.fadeIn && this.totalTime > 0 && this.totalTime < this.fade.fadeIn) {
      context.globalAlpha = this.totalTime / this.fade.fadeIn;
    } else if (this.fade.fadeOutStart && this.totalTime > 0 && this.totalTime >= this.fade.fadeOutStart) {
      context.globalAlpha = Math.max(0, 1.0 - (this.totalTime - this.fade.fadeOutStart) / (this.fade.fadeOutEnd - this.fade.fadeOutStart));
    }
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

    if (this.fade) {
      this.applyFade(context);
    }

    context.drawImage(this.image, offset.x, offset.y,
      this.imageSize, this.imageSize,
      this.position.x - this.renderSize / 2, this.position.y - this.renderSize / 2, this.renderSize, this.renderSize);
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;
    this.totalTime += elapsedTime;
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
