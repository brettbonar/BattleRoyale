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

    let center = object.center;
    let offset = {
      x: this.frame * this.projectile.imageSize,
      y: 0,//this.frame * this.projectile.imageSize
    };

    if (object.position.z > 0) {
      drawShadow(context, object);
    }

    context.save();
    // TODO: figure this out
    // if (object.rotation) {
    //   context.translate(center.x, center.y);
    //   context.rotate((object.rotation * Math.PI) / 180);
    //   context.translate(-center.x, -center.y);        
    // }
    //this.frame = 0;
    context.drawImage(this.image, offset.x, offset.y,
      this.projectile.imageSize, this.projectile.imageSize,
      object.position.x, (object.position.y - object.position.z * 32) + this.projectile.imageSize / 2,
      this.projectile.imageSize, this.projectile.imageSize);
    context.restore();
    // DEBUG
    // let box = object.boundingBox.box;
    // context.strokeStyle = "magenta";
    // context.strokeRect(box.ul.x, box.ul.y, object.width, object.height);

    // let terrainBox = object.terrainBoundingBox.box;
    // context.strokeStyle = "aqua";
    // context.strokeRect(terrainBox.ul.x, terrainBox.ul.y,
    //   object.terrainDimensions.width, object.terrainDimensions.height);
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
