import { getAnimationOffset } from "../../Engine/Rendering/renderUtils.mjs"
import Vec3 from "../../Engine/GameObject/Vec3.mjs"
import ImageCache from "../../Engine/Rendering/ImageCache.mjs";

//import Renderer from "../../Engine/Rendering/Renderer.mjs"

export default class ObjectRenderer {
  constructor(params, images) {
    _.merge(this, params);
    if (images) {
      this.images = images;
    } else {
      this.image = ImageCache.get(params.imageSource || params.imageSource);
    }
    this.totalTime = 0;
    this.currentTime = 0;
    this.opacity = 1.0;

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

  renderAnimation(context, object, elapsedTime) {    
    if (!this.image || !this.image.complete || this.done) return;

    let frameOffset = getAnimationOffset(this.image, this.dimensions, this.frame)
    // if (this.rotation) {
    //   context.translate(pos.x + this.imageSize / 2, pos.y + this.imageSize / 2);
    //   context.rotate((this.rotation * Math.PI) / 180);
    //   context.translate(-(pos.x + this.imageSize / 2), -(pos.y + this.imageSize / 2));        
    // }
    let position = object.position.minus({ y: object.position.z });
    position.add(this.offset);

    if (this.opacity !== 1.0) {
      context.globalAlpha = this.opacity;
    }

    let dimensions = this.dimensions;
    if (this.renderSize) {
      dimensions = {
        width: this.renderSize,
        height: this.renderSize
      };
    }

    context.drawImage(this.image, frameOffset.x, frameOffset.y,
      this.dimensions.width, this.dimensions.height,
      position.x, position.y, dimensions.width, dimensions.height);

    if (this.opacity !== 1.0) {
      context.globalAlpha = 1.0;
    }
  }

  draw(context, object, position, clipping) {
    if (clipping) {
      position = {
        x: clipping.offset.x + position.x,
        y: clipping.offset.y + position.y
      };
      let imageOffset = {
        x: clipping.offset.x + this.imageDimensions.x,
        y: clipping.offset.y + this.imageDimensions.y
      };
      let imageDimensions = clipping.dimensions || this.imageDimensions;
      context.drawImage(this.image, imageOffset.x, imageOffset.y, clipping.dimensions.width, clipping.dimensions.height,
        position.x, position.y - object.position.z, imageDimensions.width, imageDimensions.height);
    } else {
      context.drawImage(this.image, this.imageDimensions.x, this.imageDimensions.y, this.imageDimensions.width, this.imageDimensions.height,
        position.x, position.y - object.position.z, this.imageDimensions.width, this.imageDimensions.height);
    }
  }

  renderStatic(context, object, elapsedTime, clipping) {
    if (this.images) {
      let img = this.images[object.state];
      if (img) {
        this.image = ImageCache.get(img.imageSource);
        this.imageDimensions = img.imageDimensions;
      } else {
        this.image = null;
      }
    }

    if (!this.image || !this.image.complete) return;
    
    let position = object.position;
    if (this.imageDimensions.offset) {
      position = {
        x: position.x + this.imageDimensions.offset.x,
        y: position.y + this.imageDimensions.offset.y,
        z: position.z + this.imageDimensions.offset.z
      }
    }

    if (this.opacity !== 1.0) {
      context.globalAlpha = this.opacity;
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

    if (this.opacity !== 1.0) {
      context.globalAlpha = 1.0;
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
}
