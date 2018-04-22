import GameObject from "../../Engine/GameObject/GameObject.mjs"

export default class Boundary extends GameObject {
  constructor(params) {
    super(params);
    this.type = "Boundary";
    this.collisionDimensions = [{
      offset: {
        x: 0,
        y: 0
      },
      dimensions: params.dimensions
    }];

    this.updatePosition();
  }
}
