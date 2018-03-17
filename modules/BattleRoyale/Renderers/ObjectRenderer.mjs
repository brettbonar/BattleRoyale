//import Renderer from "../../Engine/Rendering/Renderer.mjs"

export default class ObjectRenderer {
  constructor(params) {
    _.merge(this, params);
    this.image = new Image();
    this.image.src = params.imageSource;
    this.image.onload = () => this.render = this._render;
  }

  _render(context, object, elapsedTime) {
    let offset = this.imageDimensions.offset || {
      x: 0,
      y: 0
    };
    
    let position = object.position.plus(offset);
    context.drawImage(this.image, this.imageDimensions.x, this.imageDimensions.y, this.imageDimensions.width, this.imageDimensions.height,
      position.x, position.y, this.imageDimensions.width, this.imageDimensions.height);

    // DEBUG
    // let box = object.boundingBox.box;
    // context.strokeStyle = "magenta";
    // context.strokeRect(box.ul.x, box.ul.y, object.width, object.height);
      
    // let terrainBox = object.terrainBoundingBox.box;
    // context.strokeStyle = "aqua";
    // context.strokeRect(terrainBox.ul.x, terrainBox.ul.y,
    //   object.terrainDimensions.width, object.terrainDimensions.height);
  }

  render() {}
}
