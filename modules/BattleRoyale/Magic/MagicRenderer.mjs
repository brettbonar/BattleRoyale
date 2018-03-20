import ImageCache from "../../Engine/Rendering/ImageCache.mjs"

export default class MagicRenderer {
  constructor(effect, imageSettings) {
    this.effect = effect;
    this.imageOffset = imageSettings.offset;
    this.image = ImageCache.getImage(imageSettings.imageSource);
    this.currentTime = 0;
    this.frame = 0;
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;
    while (this.currentTime > 1000 / this.effect.framesPerSec) {
      this.currentTime -= 1000 / this.effect.framesPerSec;
      this.frame++;
      if (this.frame >= this.effect.frames) {
        if (this.effect.repeat) {
          this.frame = this.effect.cycleStart || 0;
        } else {
          this.frame = this.effect.frames - 1;
        }
      }
      // TODO: something if frame over limit?
    }
  }

  render(context, object, elapsedTime, center) {
    if (this.image.complete) {
      let position = object.position.plus(this.imageOffset);

      let framesPerRow = this.image.width / this.effect.imageSize;
      let offset = {
        x: this.frame % framesPerRow,
        y: this.effect.imageSize * Math.ceil(this.frame / framesPerRow)
      }

      context.drawImage(this.image, offset.x, offset.y, this.effect.imageSize,
        this.effect.imageSize,
        position.x, position.y, this.effect.imageSize, this.effect.imageSize);
    }
  }
}
