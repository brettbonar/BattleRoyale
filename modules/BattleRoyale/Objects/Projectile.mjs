import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ProjectileRenderer from "../Renderers/ProjectileRenderer.mjs"
import attacks from "../Magic/attacks.mjs"
import Point from "../../Engine/GameObject/Point.mjs"
import Dimensions from "../../Engine/GameObject/Dimensions.mjs"
import { getDistance } from "../../Engine/util.mjs"

export default class Projectile extends GameObject {
  constructor(params) {
    super(params);
    this.type = "Projectile";
    this.physics.surfaceType = "projectile";
    this.boundsType = "circle";
    this.damagedTargets = [];

    if (params.attackType) {
      this.attack = attacks[params.attackType];
    }
    // this.dimensions = {
    //   width: 32,
    //   height: 52
    // };
    // this.terrainDimensions = {
    //   width: 32,
    //   height: 8
    // };
    _.merge(this, this.attack.effect);
    this.dimensions = new Dimensions(this.attack.effect.collisionDimensions[0].dimensions);
    this.collisionDimensions = this.attack.effect.collisionDimensions;
    this.speed = params.speed || this.attack.effect.speed;
    this.zspeed = params.zspeed || this.attack.effect.zspeed || this.speed;
    this.projectile = this.attack;
    this.rendering = this.attack.rendering;
    this.effect = this.attack.effect;

    this.startPosition = new Point(this.position);
    this.onCollision = this.attack.effect.onCollision;

    if (!params.simulation) {
      this.renderer = new ProjectileRenderer(this.attack.rendering);
    }
    this.currentTime = 0;
    this.maxTime = (this.attack.effect.range / this.attack.effect.speed) * 1000;

    this.rotation = Math.atan2(this.direction.y, this.direction.x) * 180 / Math.PI;
  }

  get distanceTravelled() {
    return getDistance(this.position, this.startPosition);
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;
    if (this.currentTime >= this.maxTime) {
      this.done = true;
    }

    if (this.effect.path === "beam") {
      this.startPosition = this.source.position.copy(); // plus modifiers
      this.position = this.source.position.copy();
    }

    this.rotation = Math.atan2(this.direction.y - this.direction.z, this.direction.x ) * 180 / Math.PI;

    this.renderer.update(elapsedTime);

    if (!this.done && this.effect.doTriggerCollision && this.effect.doTriggerCollision(this)) {
      this.done = true;
      return this.effect.onCollision({
        position: this.position,
        source: this,
        target: "ground"
      });
    }
  }

  getUpdateState() {
    return Object.assign(super.getUpdateState(), {
      attackType: this.attack.name
    });
  }
  
  // https://gamedev.stackexchange.com/questions/61301/how-to-implement-throw-curve-with-virtual-height-in-a-2d-side-view-game
  static getInitialArcSpeed(speed, zspeed, acceleration, origin, target, height) {
    let time = getDistance(origin, target) / speed;
    // return (-origin.z / time) - ((acceleration.z * time) / 2);
    //return Math.sqrt(height * 2 * -acceleration.z);
    return -acceleration.z * time / 2;
  }

  static create(params) {
    // TODO: do this better
    let sourceOrigin = params.source.position.plus(params.source.attackOrigin.offset);
    let sourceDimensions = params.source.attackOrigin.dimensions;
    let origin = sourceOrigin.copy();
    let attackDimensions = params.attack.effect.attackDimensions ||
      params.attack.effect.collisionDimensions[0];

    // Create projectile, center it within the attacking character, then move it along direction
    // until the projectile's bounds are outside of the character's collision dimensions
    // Center projectile within character's attack origin bounds
    origin.add({
      x: sourceDimensions.width / 2 - attackDimensions.dimensions.width / 2,
      y: sourceDimensions.height / 2 - attackDimensions.dimensions.height / 2,
    });
    // Offset by where the projectile's collision dimensions are located
    //origin.subtract(attackDimensions.offset);
    // Offset projectile by any custom amount (usually a zheight)
    // TODO: subtract?
    origin.add(params.attack.effect.offset);
    // Move projectile bounds along direction until they no longer collide with character bounds
    let directionXOffset = Number.MAX_VALUE;
    if (params.direction.x) {
      directionXOffset = Math.sign(params.direction.x) * 
        ((((sourceOrigin.x + sourceDimensions.width) - (origin.x - attackDimensions.dimensions.width)) /
          params.direction.x) + 1);
    }
    let directionYOffset = Number.MAX_VALUE;
    if (params.direction.y) {
      directionYOffset = Math.sign(params.direction.y) * 
      ((((sourceOrigin.y + sourceDimensions.height) - (origin.y - attackDimensions.dimensions.height)) /
        params.direction.y) + 1);
    }
    let directionOffset = Math.min(directionXOffset, directionYOffset);
    origin.add({
      x: directionOffset * params.direction.x,
      y: directionOffset * params.direction.y
    });

    // TRICKY: given position will be relative to center, shift so its centered
    // this.position.subtract({ x: this.dimensions.width / 2, y: this.dimensions.height / 2});
    let acceleration = new Point();
    let direction = new Point(params.direction);
    let zspeed = params.attack.effect.zspeed;
    if (params.attack.effect.path === "arc") {
      // TODO: may need an offset to make this more accurate
      // TODO: put default gravity in settings somewhere
      acceleration = new Point(params.attack.effect.arcGravity || { z: -1 });
      // direction.add({
      //   z: Projectile.getArcAngle(params.attack.effect.speed, params.direction,
      //     acceleration, params.target.minus(origin))
      // });
      //direction.z = 1;
      direction.z = Projectile.getInitialArcSpeed(params.attack.effect.speed,
        params.attack.effect.zspeed || params.attack.effect.speed,
        acceleration, origin, params.target, params.attack.effect.arcHeight);
    }

    return new Projectile({
      position: origin,
      simulation: params.simulation,
      attack: params.attack,
      //zspeed: zspeed,
      acceleration: acceleration,
      direction: direction,
      playerId: params.source.playerId,
      ownerId: params.source.objectId,
      elapsedTime: params.elapsedTime
    });
  }
}
