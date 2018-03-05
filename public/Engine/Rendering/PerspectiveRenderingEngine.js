import RenderingEngine from "./RenderingEngine.js"

function sortByPosition(obj) {
  return obj.position.y;
}

export default class PerspectiveRenderingEngine extends RenderingEngine{
  constructor(params) {
    super(params);
  }

  // Render highest to lowest y
  render(objects, elapsedTime, center) {
    let objs = _.sortBy(objects, sortByPosition);

    this.context.save();
    if (center) {
      this.context.translate(-(center.x - this.context.canvas.width / 2), -(center.y - this.context.canvas.height / 2));
    }
    for (const object of objs) {
      this.context.save();
      if (object.losObstacle && object.boundingBox.box.ul.y > center.y - 10) {
        this.context.globalAlpha = 0.5;
      }
      object.render(this.context, elapsedTime, center);
      this.context.restore();
    }
    this.context.restore();
  }
}
