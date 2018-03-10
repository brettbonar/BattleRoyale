import RenderingEngine from "./RenderingEngine.mjs"

export default class FlatRenderingEngine extends RenderingEngine {
  constructor(params) {
    super(params);
  }

  render(objects, elapsedTime, center) {
    for (const object of objects) {
      object.render(this.context, elapsedTime, center);
    }
  }
}
