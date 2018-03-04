import RenderingEngine from "./RenderingEngine.js"

function sortByPosition(obj) {
  return obj.position.y;
}

export default class PerspectiveRenderingEngine extends RenderingEngine{
  constructor(params) {
    super(params);
  }

  // Render highest to lowest y
  render(objects, elapsedTime) {
    let objs = _.sortBy(objects, sortByPosition);
    for (const object of objs) {
      object.render(this.context, elapsedTime);
    }
  }
}
