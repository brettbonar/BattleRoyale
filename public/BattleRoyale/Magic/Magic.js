import GameObject from "../../Engine/GameObject/GameObject.js"
import magicEffects from "./magicEffects.js"
import MagicRenderer from "./MagicRenderer.js";
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.js";

export default class Magic extends GameObject {
  constructor(params) {
    super(params);
    this.magic = magicEffects[params.type];
    this.effect = this.magic.effect;
    this.position = params.target;
    this.physics.surfaceType = SURFACE_TYPE.NONE;

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
    this.image = image;
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
    if (this.image.perspectiveOffset) {
      return {
        x: this.position.x + this.image.perspectiveOffset.x,// - (this.magic.rendering.imageSize / 2 - this.imageOffset.x),
        y: this.position.y + this.image.perspectiveOffset.y// + (this.magic.rendering.imageSize - this.imageOffset.y)
      };
    }
    return this.position;
  }
}
