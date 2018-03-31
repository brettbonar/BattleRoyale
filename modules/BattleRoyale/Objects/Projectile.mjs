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
    this.damageReady = true;

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
    if (this.effect.path === "beam") {
      this.damageInterval = 1000 / this.effect.damageRate;
      this.renderClipped = true;
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

    this.rotation = Math.atan2(this.direction.y - this.direction.z, this.direction.x ) * 180 / Math.PI;
  }

  get distanceTravelled() {
    return getDistance(this.position, this.startPosition);
  }

  // https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect/1968345#1968345
  getLineIntersection(line1, line2) {
    let minZ1 = Math.min(line1[0].z, line1[0].z);
    let maxZ1 = Math.max(line1[1].z, line1[1].z);
    let minZ2 = Math.min(line2[0].z, line2[0].z);
    let maxZ2 = Math.max(line2[1].z, line2[1].z);

    if (minZ1 > maxZ2 || minZ2 > maxZ1) {
      return false;
    }

    let s1_x, s1_y, s2_x, s2_y;
    s1_x = line1[1].x - line1[0].x;     s1_y = line1[1].y - line1[0].y;
    s2_x = line2[1].x - line2[0].x;     s2_y = line2[1].y - line2[0].y;

    let s, t;
    s = (-s1_y * (line1[0].x - line2[0].x) + s1_x * (line1[0].y - line2[0].y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (line1[0].y - line2[0].y) - s2_y * (line1[0].x - line2[0].x)) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    {
      // Collision detected
      return new Point({
        x: line1[0].x + (t * s1_x),
        y: line1[0].y + (t * s1_y)
      });
    }

    return false;
  }

  beamIntersects(target) {
    let last = this.lastPosition.plus({
      x: this.width / 2,
      y: this.height / 2
    });
    let current = this.position.plus({
      x: this.width / 2,
      y: this.height / 2
    });
    let targetLast = target.lastPosition.plus({
      x: target.width / 2,
      y: target.height / 2
    });
    let targetCurrent = target.position.plus({
      x: target.width / 2,
      y: target.height / 2
    });
    // TODO: change this to test boxes instead of just center line
    let intersection = this.getLineIntersection([last, current], [targetLast, targetCurrent]);
    if (intersection) {
      // TODO: clean this up
      this.position.x = intersection.x - this.direction.x * 16;
      this.position.y = intersection.y - this.direction.y * 16;
      target.position.x = intersection.x - target.direction.x * 16;
      target.position.y = intersection.y - target.direction.y * 16;
    }
  }

  updatePosition() {
    if (this.lastPosition && this.effect && this.effect.path === "beam") {
      this.dimensions.width = Math.abs(this.position.x - this.lastPosition.x);
      this.dimensions.height = Math.abs(this.position.y - this.lastPosition.y);
      this.perspectiveOffset = {
        x: Math.min(this.position.x, this.lastPosition.x) - this.position.x,
        y: Math.min(this.position.y, this.lastPosition.y) - this.position.y
      };
    }

    super.updatePosition();
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
        this.direction = new Point(this.source.state.target).subtract(this.source.attackCenter).normalize();
        this.direction.z = 0;
        this.lastPosition = Projectile.getAttackOrigin(this.source, this.attack, this.direction);
        this.position = this.lastPosition.plus(this.direction.times(this.effect.range));
        this.position.x = Math.max(0, this.position.x);
        this.position.y = Math.max(0, this.position.y);

        if (this.currentTime >= this.damageInterval) {
          this.damagedTargets.length = 0;
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
          let targetDirection = new Point(this.source.state.target).subtract(center).normalize();
          targetDirection.z = 0;

          let xdiff = targetDirection.x - this.direction.x;
          let ydiff = targetDirection.y - this.direction.y;
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
      x: sourceDimensions.width / 2 - (attackDimensions.dimensions.width / 2 + attackDimensions.offset.x),
      y: sourceDimensions.height / 2 - (attackDimensions.dimensions.height / 2 + attackDimensions.offset.y),
    });
    // Offset by where the projectile's collision dimensions are located
    //origin.subtract(attackDimensions.offset);
    // Offset projectile by any custom amount (usually a zheight)
    // TODO: subtract?
    origin.add(attack.effect.offset);
    // Move projectile bounds along direction until they no longer collide with character bounds
    let directionOffset;
    if (direction.x || direction.y) {
      let directionXOffset = Number.MAX_VALUE;
      if (direction.x) {
        directionXOffset = Math.sign(direction.x) * 
          ((((sourceOrigin.x + sourceDimensions.width) - origin.x) /
            direction.x));
      }
      let directionYOffset = Number.MAX_VALUE;
      if (direction.y) {
        directionYOffset = Math.sign(direction.y) * 
        ((((sourceOrigin.y + sourceDimensions.height) - origin.y) /
          direction.y));
      }
      directionOffset = Math.min(directionXOffset, directionYOffset);
    } else {
      // Just move in Y direction
      directionOffset = (sourceOrigin.y + sourceDimensions.width) - origin.y;
    }
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
