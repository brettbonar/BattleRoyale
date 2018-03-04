//import Renderer from "../../Engine/Rendering/Renderer.js"

export default class PlainTreeRenderer {
  constructor(params) {
    Object.assign(this, params);
    this.image = new Image();
    this.image.src = "../../Assets/terrain_atlas-64.png";
    this.image.onload = () => this.render = this._render;

    this.imageDimensions = {
      x: 928 * 2,
      y: 896 * 2,
      width: 96 * 2,
      height: 128 * 2 - 10
    };
  }

  _render(context, object, elapsedTime) {
    let pos = {
      x: object.position.x - (this.imageDimensions.width) / 2,
      y: object.position.y - this.imageDimensions.height
    }
    context.drawImage(this.image, this.imageDimensions.x, this.imageDimensions.y, this.imageDimensions.width, this.imageDimensions.height,
      pos.x, pos.y, this.imageDimensions.width, this.imageDimensions.height);

      // DEBUG
      let box = object.boundingBox.box;
      context.strokeStyle = "magenta";
      context.strokeRect(box.ul.x, box.ul.y, object.width, object.height);
  }

  render() {}
}
