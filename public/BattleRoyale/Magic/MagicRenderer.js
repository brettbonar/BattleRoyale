export default class MagicRenderer {
  constructor(effect, imageSettings) {
    this.effect = effect;
    this.imageOffset = imageSettings.offset;
    this.image = new Image();
    this.image.src = imageSettings.imageSource;
    this.currentTime = 0;
    this.frame = 0;
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;
    while (this.currentTime > 1000 / this.effect.rate) {
      this.currentTime -= 1000 / this.effect.rate;
      this.frame++;
      // TODO: something if frame over limit?
    }
  }

  render(context, object, elapsedTime, center) {
    if (this.image.complete) {
      let position = {
        x: object.position.x - this.effect.imageSize / 2,
        y: object.position.y - this.effect.imageSize
      }

      if (this.imageOffset) {
        position.x += this.imageOffset.x;
        position.y += this.imageOffset.y;
      }

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
