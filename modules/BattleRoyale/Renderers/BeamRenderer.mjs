import { drawShadow, getAnimationOffset } from "../../Engine/Rendering/renderUtils.mjs"
import ImageCache from "../../Engine/Rendering/ImageCache.mjs"
import Vec3 from "../../Engine/GameObject/Vec3.mjs"
import Scratch from "../../Engine/Rendering/Scratch.mjs"

export default class BeamRenderer {
  constructor(rendering) {
    this.rendering = rendering;
    this.imageStart = ImageCache.get(rendering.start.imageSource);
    this.imageEnd = ImageCache.get(rendering.end.imageSource);
    this.imageBody = ImageCache.get(rendering.body.imageSource);
    this.frame = 0;
    this.currentTime = 0;

    if (this.rendering.body.frames) {
      this.animating = true;
    }
  }

  renderAt(context, image, imageParams, position, object) {
    context.save();

    let offset = new Vec3();
    if (imageParams.frames) {
      offset = getAnimationOffset(this.image, imageParams.dimensions, this.frame);
    }

    // if (this.rendering.shadow) {
    //   drawShadow(context, object, this.rendering.modelDimensions, this.rendering.shadowColor);
    // }

    position = position.minus({
      y: position.z
    });
    position.add(imageParams.renderOffset)
    
    context.drawImage(image, offset.x, offset.y,
      imageParams.dimensions.width, imageParams.dimensions.height,
      position.x, position.y,
      imageParams.dimensions.width, imageParams.dimensions.height);

    context.restore();
  }

  drawBody(context, object, elapsedTime, clipping) {
    context.save();

    let dimensions = this.rendering.body.dimensions;
    let start = object.lastPosition.plus({
      x: this.rendering.start.dimensions.width / 2,
      y: -object.lastPosition.z
    });

    let frameOffset;
    let distance = Math.max(1, Math.ceil(object.lastPosition.distanceTo(object.position)));
    for (let i = 0; i < distance; i += dimensions.width) {
      if (this.animating) {
        frameOffset = getAnimationOffset(this.imageBody, this.rendering.body.dimensions, (this.frame + i) % this.rendering.body.frames);
      };
      Scratch.put(this.imageBody, { x: i, y: 0 }, dimensions, frameOffset);
      //context.drawImage(this.imageBody, start.x + i, start.y, dimensions.width + 1, dimensions.height);
    }

    let fullDimensions = { width: distance, height: dimensions.height };
    Scratch.drawImageTo(context, new Vec3(), fullDimensions, start, fullDimensions);

    
    // context.drawImage(this.canvas, position.x, position.y, dimensions.width, dimensions.height,
    //   targetPosition.x, targetPosition.y, targetDimensions.width, targetDimensions.height);

    context.restore();
  }

  render(context, object, elapsedTime, clipping) {
    if (!this.imageStart.complete || !this.imageBody.complete) {
      return;
    }

    if (clipping) {
      let clipStart = object.bounds.ul
        .add(clipping.offset)
        .subtract({ y: object.position.z });
      
      context.beginPath();
      if (clipping.offset.y > 0) {
        clipStart.y += this.rendering.start.dimensions.height;
      }
      context.rect(clipStart.x, clipStart.y,
        clipping.dimensions.width + this.rendering.start.dimensions.width,
        clipping.dimensions.height + this.rendering.start.dimensions.height);

      if (window.debug) {
        // context.strokeStyle = "red";
        // context.stroke();
      }
      context.clip();
    }

    if (object.rotation) {
      let start = object.lastPosition
        .plus({ y: -object.lastPosition.z + this.rendering.start.dimensions.height / 2 })
        .plus({ x: this.rendering.start.dimensions.width / 2 });
      context.translate(start.x, start.y);
      context.rotate((object.rotation * Math.PI) / 180);
      context.translate(-start.x, -start.y);
    }

    this.drawBody(context, object, elapsedTime, clipping);
    this.renderAt(context, this.imageStart, this.rendering.start, object.lastPosition, object);

    let distance = Math.max(1, Math.ceil(object.lastPosition.distanceTo(object.position)));
    this.renderAt(context, this.imageEnd, this.rendering.end,
      object.lastPosition.plus({ x: distance }), object);
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;
    if (this.animating) {
      while (this.currentTime > 1000 / this.rendering.body.framesPerSec) {
        this.currentTime -= 1000 / this.rendering.body.framesPerSec;
        this.frame++;
        if (this.frame >= this.rendering.body.frames) {
          if (this.rendering.body.repeat) {
            this.frame = this.rendering.body.cycleStart || 0;
          } else {
            this.frame = this.rendering.body.frames - 1;
          }
        }
      }
    }
  }
}
