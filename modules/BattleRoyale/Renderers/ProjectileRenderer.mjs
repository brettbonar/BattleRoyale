import { drawShadow, getAnimationOffset } from "../../Engine/Rendering/renderUtils.mjs";
import ImageCache from "../../Engine/Rendering/ImageCache.mjs";

export default class ProjectileRenderer {
  constructor(projectile) {
    this.projectile = projectile;
    this.image = ImageCache.get(projectile.imageSource);
    this.frame = 0;
    this.currentTime = 0;
  }

  render(context, object, elapsedTime) {
    if (!this.image.complete) {
      return;
    }
    let offset = getAnimationOffset(this.image, this.projectile.dimensions, this.frame);

    if (this.projectile.shadow) {
      //drawShadow(context, object, this.projectile.modelDimensions, this.projectile.shadowColor);
    }

    let position = object.position.minus({ y: object.position.z });
    let center = position.plus({
      x: this.projectile.dimensions.width / 2,
      y: this.projectile.dimensions.height / 2
    });
    position.add(this.projectile.renderOffset)

    context.save();
    
    if (object.rotation) {
      context.translate(center.x, center.y);
      context.rotate((object.rotation * Math.PI) / 180);
      context.translate(-center.x, -center.y);        
    }
    
    context.drawImage(this.image, offset.x, offset.y,
      this.projectile.dimensions.width, this.projectile.dimensions.height,
      position.x, position.y,
      this.projectile.dimensions.width, this.projectile.dimensions.height);

    context.restore();
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;
    while (this.currentTime > 1000 / this.projectile.framesPerSec) {
      this.currentTime -= 1000 / this.projectile.framesPerSec;
      this.frame++;
      if (this.frame >= this.projectile.frames) {
        if (this.projectile.repeat) {
          this.frame = this.projectile.cycleStart || 0;
        } else {
          this.frame = this.projectile.frames - 1;
        }
      }
    }
  }
}
