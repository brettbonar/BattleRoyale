import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ProjectileRenderer from "../Renderers/ProjectileRenderer.mjs"
import attacks from "../Magic/attacks.mjs"
import Point from "../../Engine/GameObject/Point.mjs"
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
    this.dimensions = {
      width: params.attack.rendering.imageSize,
      height: params.attack.rendering.imageSize
    };
    this.collisionDimensions = params.attack.effect.collisionDimensions;
    this.speed = params.attack.effect.speed;
    //this.renderheight = _.get(params.attack.effect, "offset.z", 0);
    this.position.add(params.attack.effect.offset);
    this.startPosition = new Point(this.position);
    this.effect = params.attack.effect;
    this.modelDimensions = params.modelDimensions || {
      offset: {
        x: 8,
        y: 8
      },
      dimensions: {
        width: 16,
        height: 16
      }
    };

    if (!params.simulation) {
      this.renderer = new ProjectileRenderer(params.attack.rendering);
    }

    this.rotation = Math.atan2(this.direction.y, this.direction.x) * 180 / Math.PI;
  }

  get distanceTravelled() {
    return getDistance(this.position, this.startPosition);
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
