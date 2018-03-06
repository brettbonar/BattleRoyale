import GameObject from "../../Engine/GameObject/GameObject.js"
import magicEffects from "./magicEffects.js"
import MagicRenderer from "./MagicRenderer.js";

export default class Magic extends GameObject {
  constructor(params) {
    super(params);
    this.magic = magicEffects[params.type];
    this.position = params.target;

    let direction = this.normalize({
      x: params.target.x - params.source.x,
      y: params.target.y - params.source.y
    });

    let image = this.magic.rendering.image;
    if (!image) {
      let imageDirection;
      if (params.target.x < params.source.x && Math.abs(direction.x) >= Math.abs(direction.y)) {
        imageDirection = "left";
      } else if (params.target.x > params.source.x && Math.abs(direction.x) >= Math.abs(direction.y)) {
        imageDirection = "right";
      } else if (params.target.y > params.source.y && Math.abs(direction.y) >= Math.abs(direction.x)) {
        imageDirection = "down";
      } else if (params.target.y < params.source.y && Math.abs(direction.y) >= Math.abs(direction.x)) {
        imageDirection = "up";
      }
      image = this.magic.rendering.images[imageDirection];
    }
    this.imageOffset = image.offset;
    this.renderer = new MagicRenderer(this.magic.rendering, image);
    this.currentTime = 0;
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;
    if (this.currentTime >= this.magic.effect.duration) {
      this.done = true;
    }
    this.renderer.update(elapsedTime);
  }
  
  get perspectivePosition() {
    return {
      x: this.position.x,// - (this.magic.rendering.imageSize / 2 - this.imageOffset.x),
      y: this.position.y// + (this.magic.rendering.imageSize - this.imageOffset.y)
    };
  }
}
