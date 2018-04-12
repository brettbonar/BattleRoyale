import { getAnimationOffset } from "../../Engine/Rendering/renderUtils.mjs"
import Vec3 from "../../Engine/GameObject/Vec3.mjs"
import ImageCache from "../../Engine/Rendering/ImageCache.mjs"

//import Renderer from "../../Engine/Rendering/Renderer.mjs"

export default class StartMapRenderer {
  constructor(map, mapDimensions) {
    this.map = map;
    this.mapDimensions = mapDimensions;
  }

  render(context, object, elapsedTime) {
    this.map.renderMinimap(context, {
      position: object.position,
      dimensions: this.mapDimensions
    });
  }
}
