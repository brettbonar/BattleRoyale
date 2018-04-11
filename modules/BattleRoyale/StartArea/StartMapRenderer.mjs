import { getAnimationOffset } from "../../Engine/Rendering/renderUtils.mjs"
import Vec3 from "../../Engine/GameObject/Vec3.mjs"
import ImageCache from "../../Engine/Rendering/ImageCache.mjs"

//import Renderer from "../../Engine/Rendering/Renderer.mjs"

export default class StartMapRenderer {
  constructor(params) {
    _.merge(this, params);
    if (images) {
      this.images = images;
    } else {
      this.image = ImageCache.get(params.imageSource);
    }
  }

  render(context, object, elapsedTime) {
    this.map.renderMinimap(context, object.position.x, object.position.y, object.width, object.height);
  }
}
