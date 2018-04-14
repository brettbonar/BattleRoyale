export default class Canvas {
  constructor(dimensions) {
    if (typeof document !== "undefined") {
      this.canvas = document.createElement("canvas");
      this.canvas.style.display = "none";
      this.canvas.width = dimensions.width;
      this.canvas.height = dimensions.height;
      this.context = this.canvas.getContext("2d");
    }
  }

  static create(dimensions) {
    let canvas = document.createElement("canvas");
    canvas.style.display = "none";
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    return {
      canvas: canvas,
      context: canvas.getContext("2d")
    };
  }
}
