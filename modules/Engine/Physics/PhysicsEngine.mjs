import GameObject from "../GameObject/GameObject.mjs"
import { MOVEMENT_TYPE, SURFACE_TYPE } from "./PhysicsConstants.mjs";
import Point from "../GameObject/Point.mjs";

export default class PhysicsEngine {
  constructor(params) {
    _.merge(this, params);
    this.test = 1;
  }

  getIntersections(vector, target) {
    return _.filter(target.boundingBox.lines, (line) => vector.some((vec) => vec.intersects(line)));
  }

  // detectCollisions(obj, objects) {    
  //   // Handle paddle collision
  //   let vector = obj.vector;
  //   let collisions = [];
  //   for (const target of objects) {
  //     if (target === obj) continue;
      
  //     let intersections = this.getIntersections(vector, target);
  //     if (intersections.length > 0) {
  //       // TODO: if target movement is also normal then move target
  //       if (target.physics.surfaceType === SURFACE_TYPE.REFLECTIVE) {
  //         // TODO: handle reflection in directions other than Y
  //         obj.direction.y = -obj.direction.y;
  //         obj.position.y = target.position.y - target.height - obj.gameSettings.brickLineWidth;
  //         target.color = obj.color;
    
  //         obj.direction.x = (obj.position.x - (target.position.x + target.width / 2)) / (target.width / 2);
  //       } else if (target.physics.surfaceType === SURFACE_TYPE.NORMAL) {
  //         // TODO: figure out which of intersections is best match
  //         let targetSurface = intersections[0];
  //         if (targetSurface[0].y === targetSurface[1].y) { // horizontal surface
  //           obj.position.y = targetSurface[0].y + (obj.direction.y > 0 ? -obj.height / 2 : obj.height / 2);
  //           obj.direction.y = -obj.direction.y;
  //         } else if (targetSurface[0].x === targetSurface[1].x) { // vertical surface
  //           obj.position.x = targetSurface[0].x + (obj.direction.x > 0 ? -obj.width / 2 : obj.width / 2);
  //           obj.direction.x = -obj.direction.x;
  //         } 
  //         // TODO: diagonal surface
  //       } else if (target.physics.surfaceType === SURFACE_TYPE.IMMOVABLE) {

  //       }

  //       collisions.push({
  //         source: obj,
  //         target: target
  //       });

  //       obj.normalizeDirection();

  //       // TODO: don't return here to allow multiple collisions
  //       return collisions;
  //     }
  //   }

  //   return collisions;
  // }

  intersects(bounds1, bounds2) {
    return bounds1
      .some((bounds) => bounds2
        .some((targetBounds) => targetBounds.intersects(bounds)));
  }

  detectCollisions(obj, objects) {
    let objCollisionBounds = obj.collisionBounds;
    let collisions = [];
    for (const target of objects) {
      if (target === obj || target.physics.surfaceType === SURFACE_TYPE.NONE) continue;
      // Only need to test projectiles against characters, not both ways
      // TODO: do all tests, but exclude ones already found
      if (obj.physics.surfaceType === SURFACE_TYPE.CHARACTER &&
          (target.physics.surfaceType === SURFACE_TYPE.PROJECTILE ||
           target.physics.surfaceType === SURFACE_TYPE.GAS)) {
        continue;
      }
      
      let targetCollisionBounds = target.collisionBounds;
      if (this.intersects(objCollisionBounds, targetCollisionBounds)) {
        collisions.push({
          source: obj,
          target: target,
          // TODO: use position of collision from sweep test
          position: obj.position.copy()
        });

        // TODO: make this more robust for high speeds
        // TODO: don't always do this (e.g. piercing projectiles)
        // TODO: create "bounce" or "elasticity" parameter - bounce objects back by
        // this much. If 0 then no bounce.
        if (obj.physics.surfaceType !== SURFACE_TYPE.GAS) {
          obj.position.x = obj.lastPosition.x;
          obj.position.y = obj.lastPosition.y;
        }
      }
      
      // TODO: do this after all other physics calculations
      for (const functionBox of target.getAllFunctionBounds()) {
        if (objCollisionBounds.some((bounds) => bounds.intersects(functionBox.box))) {
          functionBox.cb(obj);
        }
      }
    }

    return collisions;
  }

  update(elapsedTime, objects) {
    // TRICKY: Not sure why this happens at the beginning
    if (!elapsedTime) return [];

    for (const obj of objects) {
      let time = elapsedTime;
      if (obj.elapsedTime) {
        time += obj.elapsedTime;
      }

      // if (obj.physics.surfaceType === SURFACE_TYPE.CHARACTER) {
      //   obj.position.z += (elapsedTime / 10) * this.test;
      //   if (obj.position.z > 500) {
      //     this.test = -1;
      //   }
      //   if (obj.position.z < 0) {
      //     obj.position.z = 0;
      //     this.test = 1;
      //   }
      // }

      if (obj.direction.x || obj.direction.y || obj.direction.z) {
        Object.assign(obj.lastPosition, obj.position);
        obj.position.x += obj.direction.x * obj.speed * (time / 1000);
        obj.position.y += obj.direction.y * obj.speed * (time / 1000);
        if (obj.direction.z) {
          obj.position.z += obj.direction.z * (obj.zspeed || obj.speed) * (time / 1000);
        }
      }
      if (obj.spin) {
        obj.rotation += obj.spin * (time / 1000);
      }
      if (obj.acceleration) {
        obj.direction = new Point(obj.direction).add({
          x: obj.acceleration.x * (time / 1000),
          y: obj.acceleration.y * (time / 1000),
          z: obj.acceleration.z * (time / 1000)
        });
      }
    }

    let collisions = [];
    for (const obj of objects) {
      // if (obj.physics.movementType === MOVEMENT_TYPE.NORMAL) {
      //   collisions = collisions.concat(this.detectCollisions(obj, objects));
      // }
      if (obj.physics.surfaceType === SURFACE_TYPE.CHARACTER || 
          obj.physics.surfaceType === SURFACE_TYPE.PROJECTILE ||
          obj.physics.surfaceType === SURFACE_TYPE.GAS) {
        collisions = collisions.concat(this.detectCollisions(obj, objects));
      }

      if (obj.position.z < 0) {
        collisions.push({
          source: obj,
          target: "ground",
          position: obj.position.copy()
        });
      }
    }

    return collisions;
  }
}
