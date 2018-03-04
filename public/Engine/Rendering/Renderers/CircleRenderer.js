import Renderer from "./Renderer.js"

export default class CircleRenderer extends Renderer {
  constructor(params) {
    super(params);
  }

  render(context, object, elapsedTime) {
    let position = object.renderPosition || object.position;
    context.save();

    context.beginPath();
    context.arc(position.x, position.y, object.radius, 0, 2 * Math.PI);
    context.closePath();

    context.shadowColor = this.shadowColor;
    context.shadowBlur = this.shadowBlur;

    if (this.fillStyle) {
      context.fillStyle = this.fillStyle;
      context.fill();
    }

    if (this.strokeStyle) {
      context.strokeStyle = this.strokeStyle;
      context.stroke();
    }

    // DEBUG
    let box = object.boundingBox.box;
    context.strokeStyle = "magenta";
    context.strokeRect(box.ul.x, box.ul.y, object.width, object.height);
    
    context.restore();

    // DEBUG
    // for (const vector of this.vector) {
    //   vector.render(context);
    // } 
  }
}
