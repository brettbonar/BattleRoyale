class Scratch {
  constructor() {
    if (typeof document !== "undefined") {
      this.canvas = document.createElement("canvas");
      this.canvas.width = 512;
      this.canvas.height = 512;
      this.context = this.canvas.getContext("2d");
    }
  }

  put(image, position, dimensions, offset) {
    if (offset) {
      this.context.drawImage(image, offset.x, offset.y, dimensions.width, dimensions.height,
        position.x, position.y, dimensions.width, dimensions.height);
    } else {
      this.context.drawImage(image, position.x, position.y, dimensions.width, dimensions.height);
    }
  }

  drawImageTo(context, position, dimensions, targetPosition, targetDimensions) {
    context.drawImage(this.canvas, position.x, position.y, dimensions.width, dimensions.height,
      targetPosition.x, targetPosition.y, targetDimensions.width, targetDimensions.height);
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

let scratch = new Scratch();

export default scratch
