import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ProjectileRenderer from "../Renderers/ProjectileRenderer.mjs"
import attacks from "../Magic/attacks.mjs"
import Point from "../../Engine/GameObject/Point.mjs"
import Dimensions from "../../Engine/GameObject/Dimensions.mjs"
import { getDistance } from "../../Engine/util.mjs"
import { getRangeMap, smoothStop } from "../../Engine/Math.mjs"
import BeamRenderer from "../Renderers/BeamRenderer.mjs"

export default class Projectile extends GameObject {
  constructor(params) {
    super(params);
    this.type = "Projectile";
    this.physics.surfaceType = "projectile";
    this.boundsType = "circle";
    this.damagedTargets = [];
    this.source = params.source;
    // TODO: action IDs?
    this.action = params.action;

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
    this.speed = params.speed || this.attack.effect.speed || 0;
    this.zspeed = params.zspeed || this.attack.effect.zspeed || this.speed;
    this.projectile = this.attack;
    this.rendering = this.attack.rendering;
    this.effect = this.attack.effect;
    this.damageReady = true;
    if (this.effect.path === "beam") {
      this.damageInterval = this.effect.damageRate / 1000;
    }

    this.startPosition = new Point(this.position);
    this.onCollision = this.attack.effect.onCollision;

    if (!params.simulation) {
      if (this.effect.path === "beam") {
        this.renderer = new BeamRenderer(this.attack.rendering);
      } else {
        this.renderer = new ProjectileRenderer(this.attack.rendering);
      }
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
      if (!this.source || !this.source.currentAction || this.source.currentAction.actionId !== this.actionId) {
        this.done = true;
      } else {
        this.direction = this.source.state.target.minus(this.source.attackCenter).normalize();
        this.direction.z = 0;
        this.lastPosition = Projectile.getAttackOrigin(this.source, this.attack, this.direction);
        this.position = this.lastPosition.plus(this.direction.times(this.effect.range));
        this.position.x = Math.max(0, this.position.x);
        this.position.y = Math.max(0, this.position.y);

        if (this.currentTime >= this.damageInterval) {
          this.damageReady = true;
          this.currentTime = this.currentTime - this.damageInterval;
        }
      }
    } else if (this.effect.path === "tracking") {
      if (!this.source || !this.source.currentAction || this.source.currentAction.actionId !== this.actionId) {
        this.speed = this.effect.speed;
      } else {
        let center = this.collisionBounds[0].center;
        let dist = Math.min(100, getDistance(center, this.source.state.target));

        if (dist < 5) {
          this.speed = 0;
        } else {
          let targetDirection = this.source.state.target.minus(center).normalize();
          targetDirection.z = 0;

          let xdiff = targetDirection.x - this.direction.x;
          let ydiff = targetDirection.y - this.direction.y
          this.direction.add({
            x: Math.max(xdiff, xdiff * (elapsedTime / 50)),
            y: Math.max(ydiff, ydiff * (elapsedTime / 50))
          }).normalize();
          this.speed = getRangeMap(dist, 100, 0, this.effect.speed, 0, smoothStop(2));
        }

        // Keep resetting until the tracking projectile is released
        this.currentTime = 0;
      }
    }

    //this.rotation = Math.atan2(this.direction.y - this.direction.z, this.direction.x ) * 180 / Math.PI;

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

  // updateState(state) {
  //   let oldPos = new Point(this.position);
  //   _.merge(this, state);
  //   this.position = new Point(this.position);
  //   if (!this.position.equals(oldPos)) {
  //     this.position = oldPos.plus(this.position.minus(oldPos).times(0.1));
  //   }
  // }

  getUpdateState() {
    return Object.assign(super.getUpdateState(), {
      attackType: this.attack.name,
      ownerId: this.ownerId,
      actionId: this.actionId
    });
  }
  
  // https://gamedev.stackexchange.com/questions/61301/how-to-implement-throw-curve-with-virtual-height-in-a-2d-side-view-game
  static getInitialArcSpeed(speed, acceleration, origin, target, height) {
    let time = getDistance(origin, target) / speed;
    // TODO: take height into consideration?
    return -acceleration.z * time / 2;
  }

  static getAttackOrigin(source, attack, direction) {
    // TODO: do this better
    let sourceOrigin = source.position.plus(source.attackOrigin.offset);
    let sourceDimensions = source.attackOrigin.dimensions;
    let origin = sourceOrigin.copy();
    let attackDimensions = attack.effect.attackDimensions ||
      attack.effect.collisionDimensions[0];

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
    origin.add(attack.effect.offset);
    // Move projectile bounds along direction until they no longer collide with character bounds
    let directionXOffset = Number.MAX_VALUE;
    if (direction.x) {
      directionXOffset = Math.sign(direction.x) * 
        ((((sourceOrigin.x + sourceDimensions.width) - (origin.x - attackDimensions.dimensions.width)) /
          direction.x) + 1);
    }
    let directionYOffset = Number.MAX_VALUE;
    if (direction.y) {
      directionYOffset = Math.sign(direction.y) * 
      ((((sourceOrigin.y + sourceDimensions.height) - (origin.y - attackDimensions.dimensions.height)) /
        direction.y) + 1);
    }
    let directionOffset = Math.min(directionXOffset, directionYOffset);
    origin.add({
      x: directionOffset * direction.x,
      y: directionOffset * direction.y
    });

    return origin;
  }

  static create(params) {
    let origin = Projectile.getAttackOrigin(params.source, params.attack, params.direction);

    // TRICKY: given position will be relative to center, shift so its centered
    // this.position.subtract({ x: this.dimensions.width / 2, y: this.dimensions.height / 2});
    let acceleration = new Point();
    let direction = new Point(params.direction);
    let speed = params.attack.effect.speed;
    if (params.modifiers && !_.isUndefined(params.modifiers.speed)) {
      speed *= params.modifiers.speed;
    }
    //let zspeed = params.attack.effect.zspeed;
    if (params.attack.effect.path === "arc") {
      // TODO: may need an offset to make this more accurate
      // TODO: put default gravity in settings somewhere
      acceleration = new Point(params.attack.effect.arcGravity || { z: -1 });
      direction.z = Projectile.getInitialArcSpeed(speed,
        acceleration, origin, params.target, params.attack.effect.arcHeight);
    }

    // TODO: apply damage modifier, may need to make sure projectile effect is copied
    let projectile = new Projectile({
      source: params.source,
      actionId: params.action.actionId,
      position: origin,
      simulation: params.simulation,
      attack: params.attack,
      //zspeed: zspeed,
      acceleration: acceleration,
      speed: speed,
      direction: direction,
      playerId: params.source.playerId,
      ownerId: params.source.objectId,
      elapsedTime: params.elapsedTime
    });

    return projectile;
  }
}
