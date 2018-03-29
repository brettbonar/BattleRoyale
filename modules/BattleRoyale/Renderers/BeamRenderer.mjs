import { drawShadow, getAnimationOffset } from "../../Engine/Rendering/renderUtils.mjs"
import ImageCache from "../../Engine/Rendering/ImageCache.mjs"
import Point from "../../Engine/GameObject/Point.mjs"
import Scratch from "../../Engine/Rendering/Scratch.mjs"

function getOffset(animation, frame, imageSize) {
  let offset = ANIMATION_SETTINGS[animation].offset;
  return {
    x: offset.x + frame * imageSize,
    y: offset.y * imageSize
  };
}

export default class BeamRenderer {
  constructor(rendering) {
    this.rendering = rendering;
    this.imageStart = ImageCache.get(rendering.start.imageSource);
    this.imageEnd = ImageCache.get(rendering.end.imageSource);
    this.imageBody = ImageCache.get(rendering.body.imageSource);
    this.frame = 0;
    this.currentTime = 0;
  }

  renderAt(context, image, imageParams, position, object) {
    context.save();

    let offset = new Point();
    if (imageParams.frames) {
      offset = getAnimationOffset(this.image, imageParams.imageSize, this.frame);
    }

    // if (this.rendering.shadow) {
    //   drawShadow(context, object, this.rendering.modelDimensions, this.rendering.shadowColor);
    // }

    position = position.minus({ y: position.z });
    let center = position.plus({ x: imageParams.imageSize / 2, y: imageParams.imageSize / 2});
    position.add(imageParams.renderOffset)
    
    if (object.rotation) {
      context.translate(center.x, center.y);
      context.rotate((object.rotation * Math.PI) / 180);
      context.translate(-center.x, -center.y);        
    }
    
    context.drawImage(image, offset.x, offset.y,
      imageParams.imageSize, imageParams.imageSize,
      position.x, position.y,
      imageParams.imageSize, imageParams.imageSize);

    context.restore();
  }

  drawBody(context, object, elapsedTime) {
    context.save();

    let dimensions = this.rendering.body.dimensions;
    let imageOffset = this.rendering.start.imageSize / 2;
    let distance = Math.ceil(object.lastPosition.distanceTo(object.position));
    for (let i = 0; i < distance; i += dimensions.width) {
      Scratch.put(this.imageBody, { x: i, y: 0 }, dimensions);
    }
    //let rotation = Math.atan2(object.direction.y - object.direction.z, object.direction.x ) * 180 / Math.PI;

    let start = object.lastPosition
      .plus({ y: -object.lastPosition.z })
      .plus({ x: imageOffset });
    //let end = object.position.minus({ y: object.position.z });

    //let center = start.plus(end).scale(0.5);
    //center.add(imageParams.renderOffset)

    if (object.rotation) {
      context.translate(start.x, start.y + dimensions.height / 2);
      context.rotate((object.rotation * Math.PI) / 180);
      context.translate(-start.x, -(start.y + dimensions.height / 2));
    }

    let fullDimensions = { width: distance, height: dimensions.height };
    Scratch.drawImageTo(context, new Point(), fullDimensions, start, fullDimensions);

    context.restore();
  }

  render(context, object, elapsedTime) {
    if (!this.imageStart.complete || !this.imageBody.complete) {
      return;
    }

    this.drawBody(context, object, elapsedTime);
    this.renderAt(context, this.imageStart, this.rendering.start, object.lastPosition, object);
    this.renderAt(context, this.imageEnd, this.rendering.end, object.position, object);
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;
    // while (this.currentTime > 1000 / this.rendering.framesPerSec) {
    //   this.currentTime -= 1000 / this.rendering.framesPerSec;
    //   this.frame++;
    //   if (this.frame >= this.rendering.frames) {
    //     if (this.rendering.repeat) {
    //       this.frame = this.rendering.cycleStart || 0;
    //     } else {
    //       this.frame = this.rendering.frames - 1;
    //     }
    //   }
    // }
  }
}
