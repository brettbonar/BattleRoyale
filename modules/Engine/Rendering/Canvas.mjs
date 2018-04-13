export default class Canvas {
  constructor(dimensions) {
    if (typeof document !== "undefined") {
      this.canvas = document.createElement("canvas");
      this.canvas.width = dimensions.width;
      this.canvas.height = dimensions.height;
      this.context = this.canvas.getContext("2d");
    }
  }
}
