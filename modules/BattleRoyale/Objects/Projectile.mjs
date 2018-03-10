import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ProjectileRenderer from "../Renderers/ProjectileRenderer.mjs"
import projectiles from "../Magic/projectiles.mjs";
import { getDistance } from "../../Engine/util.mjs"

export default class Projectile extends GameObject {
  constructor(params) {
    super(params);
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
    this.dimensions = {
      radius: 5
    };
    this.startPosition = Object.assign({}, this.position);
    this.speed = 256;
    this.projectile = projectiles.plasmaBall;
    this.effect = projectiles.plasmaBall.effect;
    this.renderer = new ProjectileRenderer(this.projectile.rendering);

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
}
