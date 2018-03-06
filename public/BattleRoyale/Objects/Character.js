import GameObject from "../../Engine/GameObject/GameObject.js"
import CharacterRenderer from "../Renderers/CharacterRenderer.js"

export default class Character extends GameObject {
  constructor(params) {
    super(params);
    this.physics.surfaceType = "character";
    // this.dimensions = {
    //   width: 32,
    //   height: 52
    // };
    // this.terrainDimensions = {
    //   width: 32,
    //   height: 8
    // };
    this.dimensions = {
      width: 32,
      height: 16
    };
    this.direction = {
      x: 0,
      y: 0
    };
    this.speed = 96;
    this.renderer = new CharacterRenderer({
      gender: params.gender,
      body: params.body,
      loadout: params.loadout
    });
  }

  setDirection(direction) {
    Object.assign(this.direction, direction);
    this.direction = this.normalize(this.direction);
    if (this.direction.x !== 0 || this.direction.y !== 0) {
      this.renderer.animating = true;
    } else {
      this.renderer.animating = false;
      this.renderer.frame = 0;
    }
  }

  get center() {
    return {
      x: this.position.x,
      y: this.position.y - 32
    }
  }

  setTarget(target) {
    let center = this.center;
    let direction = this.normalize({
      x: target.x - center.x,
      y: target.y - center.y
    });

    if (target.x < center.x && Math.abs(direction.x) >= Math.abs(direction.y)) {
      this.renderer.setAnimation(CharacterRenderer.ANIMATIONS.MOVING_LEFT);
    } else if (target.x > center.x && Math.abs(direction.x) >= Math.abs(direction.y)) {
      this.renderer.setAnimation(CharacterRenderer.ANIMATIONS.MOVING_RIGHT);
    } else if (target.y > center.y && Math.abs(direction.y) >= Math.abs(direction.x)) {
      this.renderer.setAnimation(CharacterRenderer.ANIMATIONS.MOVING_DOWN);
    } else if (target.y < center.y && Math.abs(direction.y) >= Math.abs(direction.x)) {
      this.renderer.setAnimation(CharacterRenderer.ANIMATIONS.MOVING_UP);
    }
  }

  update(elapsedTime) {
    // this.position.x += this.direction.x * this.speed * (elapsedTime / 1000);
    // this.position.y += this.direction.y * this.speed * (elapsedTime / 1000);
    this.renderer.update(elapsedTime);
  }
}
