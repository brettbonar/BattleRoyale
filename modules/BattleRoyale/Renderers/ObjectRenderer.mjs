import { getAnimationOffset } from "../../Engine/Rendering/renderUtils.mjs"
import Point from "../../Engine/GameObject/Point.mjs"
import ImageCache from "../../Engine/Rendering/ImageCache.mjs";

//import Renderer from "../../Engine/Rendering/Renderer.mjs"

export default class ObjectRenderer {
  constructor(params, imageParams) {
    _.merge(this, params, imageParams);
    this.image = ImageCache.getImage(params.imageSource);
    this.totalTime = 0;

    // TODO: come up with a more robust check for animations
    if (params.frames) {
      this.frame = 0;
      this.currentTime = 0;
      this.animating = true;
      this.render = this.renderAnimation;
    } else {
      this.render = this.renderStatic;
    }
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;
    this.totalTime += elapsedTime;

    if (this.animating) {
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
    }

    if (this.totalTime >= this.duration) {
      this.done = true;
    }
  }

  renderAnimation(context, object, elapsedTime) {
    if (!this.image.complete || this.done) return;

    let frameOffset = getAnimationOffset(this.image, this.imageSize, this.frame)
    // if (this.rotation) {
    //   context.translate(pos.x + this.imageSize / 2, pos.y + this.imageSize / 2);
    //   context.rotate((this.rotation * Math.PI) / 180);
    //   context.translate(-(pos.x + this.imageSize / 2), -(pos.y + this.imageSize / 2));        
    // }
    let position = object.position.minus({ y: object.position.z });
    if (this.imageDimensions) {
      position.add(this.imageDimensions.offset);
    }

    context.drawImage(this.image, frameOffset.x, frameOffset.y,
      this.imageSize, this.imageSize,
      position.x, position.y, this.imageSize, this.imageSize);
  }

  draw(context, object, position, clipping) {
    if (clipping) {
      let offset = new Point(clipping.offset);
      position = offset.plus(position);
      let imageOffset = offset.plus(this.imageDimensions);
      let imageDimensions = clipping.dimensions || this.imageDimensions;
      context.drawImage(this.image, imageOffset.x, imageOffset.y, clipping.dimensions.width, clipping.dimensions.height,
        position.x, position.y - object.position.z, imageDimensions.width, imageDimensions.height);
    } else {
      context.drawImage(this.image, this.imageDimensions.x, this.imageDimensions.y, this.imageDimensions.width, this.imageDimensions.height,
        position.x, position.y - object.position.z, this.imageDimensions.width, this.imageDimensions.height);
    }
  }

  renderStatic(context, object, elapsedTime, clipping) {
    if (!this.image.complete) return;
    
    let position = object.position;
    if (this.imageDimensions.offset) {
      position = {
        x: position.x + this.imageDimensions.offset.x,
        y: position.y + this.imageDimensions.offset.y,
        z: position.z + this.imageDimensions.offset.z
      }
    }

    if (object.rotation) {
      context.save();

      let center = {
        x: position.x + this.imageDimensions.width / 2,
        y: position.y + this.imageDimensions.height / 2 - object.position.z
      };
      context.translate(center.x, center.y);
      context.rotate((object.rotation * Math.PI) / 180);
      context.translate(-center.x, -center.y); 
      this.draw(context, object, position, clipping);    

      context.restore();
    } else {
      this.draw(context, object, position, clipping);
    }
  }
}
