import Effect from "../../Engine/Effects/Effect.js";

function getOffset(animation, frame, imageSize) {
  let offset = ANIMATION_SETTINGS[animation].offset;
  return {
    x: offset.x + frame * imageSize,
    y: offset.y * imageSize
  };
}

export default class BloodEffect extends Effect {
  constructor(params) {
    super(params);

    this.image = new Image();
    this.image.src = params.imageSource;
    this.frame = 0;
    this.currentTime = 0;
    this.totalTime = 0;
  }

  render(context, object, elapsedTime, center) {
    if (!this.image.complete) {
      return;
    }

    let offset = {
      x: this.frame * this.imageSize,
      y: 0,//this.frame * this.projectile.imageSize
    };
    
    if (object.rotation) {
      context.translate(pos.x + this.imageSize / 2, pos.y + this.imageSize / 2);
      context.rotate((object.rotation * Math.PI) / 180);
      context.translate(-(pos.x + this.imageSize / 2), -(pos.y + this.imageSize / 2));        
    }

    //this.frame = 0;
    context.drawImage(this.image, offset.x, offset.y,
      this.imageSize, this.imageSize,
      object.position.x, object.position.y, this.imageSize, this.imageSize);

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
    while (this.currentTime > 1000 / this.framesPerSec) {
      this.currentTime -= 1000 / this.framesPerSec;
      this.frame++;
      if (this.frame >= this.frames) {
        if (this.repeat) {
          this.frame = this.cycleStart || 0;
        } else {
          this.frame = this.frames - 1;
        }
      }
    }

    if (this.totalTime >= this.duration) {
      this.done = true;
    }
  }
}
