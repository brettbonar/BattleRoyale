import { getAnimationOffset } from "../../Engine/Rendering/renderUtils.mjs";

//import Renderer from "../../Engine/Rendering/Renderer.mjs"

export default class ObjectRenderer {
  constructor(params) {
    _.merge(this, params);
    this.image = new Image();
    this.image.src = params.imageSource;

    // TODO: come up with a more robust check for animations
    if (params.frames) {
      this.frame = 0;
      this.currentTime = 0;
      this.totalTime = 0;

      this.update = this.updateAnimation;
      this.render = this.renderAnimation;
    } else {
      this.render = this.renderStatic;
    }
  }

  updateAnimation(elapsedTime) {
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

  renderAnimation(context, object, elapsedTime) {
    if (!this.image.complete) return;

    let frameOffset = getAnimationOffset(this.image, this.imageSize, this.frame)
      
    
    // if (this.rotation) {
    //   context.translate(pos.x + this.imageSize / 2, pos.y + this.imageSize / 2);
    //   context.rotate((this.rotation * Math.PI) / 180);
    //   context.translate(-(pos.x + this.imageSize / 2), -(pos.y + this.imageSize / 2));        
    // }
    let position = object.position
      .minus({ y: object.position.z }); //.plus(this.imageDimensions.offset);
    context.drawImage(this.image, frameOffset.x, frameOffset.y,
      this.imageSize, this.imageSize,
      position.x, position.y, this.imageSize, this.imageSize);
  }

  renderStatic(context, object, elapsedTime) {
    if (!this.image.complete) return;
    
    let position = object.position
      .plus(this.imageDimensions.offset)
      .minus({ y: object.position.z });
    context.drawImage(this.image, this.imageDimensions.x, this.imageDimensions.y, this.imageDimensions.width, this.imageDimensions.height,
      position.x, position.y, this.imageDimensions.width, this.imageDimensions.height);
  }
}
