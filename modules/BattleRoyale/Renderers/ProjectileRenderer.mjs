import { drawShadow } from "../../Engine/Rendering/renderUtils.mjs";

function getOffset(animation, frame, imageSize) {
  let offset = ANIMATION_SETTINGS[animation].offset;
  return {
    x: offset.x + frame * imageSize,
    y: offset.y * imageSize
  };
}

export default class ProjectileRenderer {
  constructor(projectile) {
    this.projectile = projectile;
    this.image = new Image();
    this.image.src = projectile.imageSource;
    this.frame = 0;
    this.currentTime = 0;
  }

  render(context, object, elapsedTime) {
    if (!this.image.complete) {
      return;
    }
    
    let framesPerRow = this.image.width / this.projectile.imageSize;
    let offset = {
      x: (this.frame % framesPerRow) * this.projectile.imageSize,
      y: this.projectile.imageSize * Math.floor(this.frame / framesPerRow)
    }

    if (object.effect.shadow && object.position.z > 0) {
      drawShadow(context, object, this.projectile.modelDimensions);
    }

    let position = object.position.minus({ y: object.position.z });
    let center = position.plus({ x: this.projectile.imageSize / 2, y: this.projectile.imageSize / 2});
    position.add(this.projectile.renderOffset)

    context.save();
    
    if (object.rotation) {
      context.translate(center.x, center.y);
      context.rotate((object.rotation * Math.PI) / 180);
      context.translate(-center.x, -center.y);        
    }
    
    context.drawImage(this.image, offset.x, offset.y,
      this.projectile.imageSize, this.projectile.imageSize,
      position.x, position.y,
      this.projectile.imageSize, this.projectile.imageSize);

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
