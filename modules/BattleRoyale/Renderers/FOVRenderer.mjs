import { getAnimationOffset } from "../../Engine/Rendering/renderUtils.mjs"
import Vec3 from "../../Engine/GameObject/Vec3.mjs"
import ImageCache from "../../Engine/Rendering/ImageCache.mjs"

//import Renderer from "../../Engine/Rendering/Renderer.mjs"

export default class FOVRenderer {
  constructor(source) {
    this.image = ImageCache.get("/Assets/fov.png");
    this.imageDimensions = {
      width: 2000,
      height: 2000
    };
    this.source = source;
  }

  render(context, object, elapsedTime, clipping) {
    if (!this.image.complete) return;
    
    context.save();

    let position = object.position.minus({
      x: this.imageDimensions.width / 2,
      y: this.imageDimensions.height / 2
    });

    context.beginPath();
    context.arc(object.position.x, object.position.y - object.position.z, this.source.fov.range, 0, 2 * Math.PI);
    context.clip();

    if (clipping) {
      position = clipping.offset.plus(position);
      let imageDimensions = clipping.dimensions || this.imageDimensions;
      context.drawImage(this.image, clipping.offset.x, clipping.offset.y, clipping.dimensions.width, clipping.dimensions.height,
        position.x, position.y - object.position.z, imageDimensions.width, imageDimensions.height);
    } else {
      context.drawImage(this.image, position.x, position.y - object.position.z, this.imageDimensions.width, this.imageDimensions.height);
    }

    context.restore();
  }
}
