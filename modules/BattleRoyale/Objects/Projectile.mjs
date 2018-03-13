import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ProjectileRenderer from "../Renderers/ProjectileRenderer.mjs"
import attacks from "../Magic/attacks.mjs";
import { getDistance } from "../../Engine/util.mjs"

export default class Projectile extends GameObject {
  constructor(params) {
    super(params);
    this.type = "Projectile";
    this.physics.surfaceType = "projectile";
    this.boundsType = "circle";
    // this.dimensions = {
    //   width: 32,
    //   height: 52
    // };
    // this.terrainDimensions = {
    //   width: 32,
    //   height: 8
    // };
    this.dimensions = params.attack.effect.dimensions;
    this.speed = params.attack.effect.speed;
    this.startPosition = Object.assign({}, this.position);
    this.effect = params.attack.effect;

    if (!params.simulation) {
      this.renderer = new ProjectileRenderer(params.attack.rendering);
    }

    this.rotation = Math.atan2(this.direction.y, this.direction.x) * 180 / Math.PI;
  }

  get distanceTravelled() {
    return getDistance(this.position, this.startPosition);
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

  getUpdateState() {
    return Object.assign(super.getUpdateState(), _.pick(this, [
      "attack"
    ]));
  }
}
