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

  render(context, object, elapsedTime, center) {
    if (!this.image.complete) {
      return;
    }

    let pos = {
      x: object.position.x - this.projectile.imageSize / 2,
      // TODO: why 16?
      y: object.position.y - this.projectile.imageSize - 16
    }
    let offset = {
      x: this.frame * this.projectile.imageSize,
      y: 0,//this.frame * this.projectile.imageSize
    };
    
    if (object.rotation) {
      context.translate(pos.x + this.projectile.imageSize / 2, pos.y + this.projectile.imageSize / 2);
      context.rotate((object.rotation * Math.PI) / 180);
      context.translate(-(pos.x + this.projectile.imageSize / 2), -(pos.y + this.projectile.imageSize / 2));        
    }

    //this.frame = 0;
    context.drawImage(this.image, offset.x, offset.y,
      this.projectile.imageSize, this.projectile.imageSize,
      pos.x, pos.y, this.projectile.imageSize, this.projectile.imageSize);

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
