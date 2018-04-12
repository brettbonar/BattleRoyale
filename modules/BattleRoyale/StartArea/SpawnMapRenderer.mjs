import { getAnimationOffset } from "../../Engine/Rendering/renderUtils.mjs"
import Vec3 from "../../Engine/GameObject/Vec3.mjs"
import ImageCache from "../../Engine/Rendering/ImageCache.mjs"

//import Renderer from "../../Engine/Rendering/Renderer.mjs"

export default class SpawnMapRenderer {
  constructor(map, mapDimensions) {
    this.map = map;
    this.mapDimensions = mapDimensions;
  }

  render(context, object, elapsedTime) {
    context.fillStyle = "rgb(223, 218, 181)";
    context.fillRect(object.position.x - 8, object.position.y - 8,
      this.mapDimensions.width + 8, this.mapDimensions.height + 8);
    this.map.renderMinimap(context, {
      position: object.position,
      dimensions: this.mapDimensions
    });
  }
}
