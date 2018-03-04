import GameObject from "../../Engine/GameObject/GameObject.js"
import CircleRenderer from "../../Engine/Rendering/Renderers/CircleRenderer.js"

export default class Projectile extends GameObject {
  constructor(params) {
    super(params);
    this.physics.surfaceType = "character";
    this.boundsType = "circle";
    // this.dimensions = {
    //   width: 32,
    //   height: 52
    // };
    // this.terrainDimensions = {
    //   width: 32,
    //   height: 8
    // };
    this.dimensions = {
      radius: 5
    };
    this.speed = 128;
    this.renderer = new CircleRenderer({
      fillStyle: "red"
    });
  }

  get renderPosition() {
    return {
      x: this.position.x,
      y: this.position.y - 32
    };
  }

  update(elapsedTime) {
    this.renderer.update(elapsedTime);
  }
}
