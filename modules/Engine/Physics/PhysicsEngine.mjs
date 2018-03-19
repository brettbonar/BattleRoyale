import GameObject from "../GameObject/GameObject.mjs"
import { MOVEMENT_TYPE, SURFACE_TYPE } from "./PhysicsConstants.mjs";
import Point from "../GameObject/Point.mjs";

export default class PhysicsEngine {
  constructor(params) {
    _.merge(this, params);
  }

  sweepTest(A1, A2, B1, B2) {
    if (A2.intersects(B2)) {
      return {
        time: 0,
        axis: "x"
      };
    }

    if (!A1.plus(A2).intersects(B1.plus(B2))) {
      return false;
    }

    let vAx = A2.ul.x - A1.ul.x;
    let vAy = A2.ul.y - A1.ul.y;
    let vBx = B2.ul.x - B1.ul.x;
    let vBy = B2.ul.y - B1.ul.y;

    let v = {
      x: vBx - vAx,
      y: vBy - vAy
    }
    let first = {
      x: 0,
      y: 0
    };
    let last = {
      x: Infinity,
      y: Infinity
    };
    let touched = {
      x: false,
      y: false
    };

    _.each(v, (velocity, axis) => {
      if (A1.max[axis] < B1.min[axis] && velocity < 0)
      {
        touched[axis] = true;
        first[axis] = (A1.max[axis] - B1.min[axis]) / velocity;
      }
      else if (B1.max[axis] < A1.min[axis] && velocity > 0)
      {
        touched[axis] = true;
        first[axis] = (A1.min[axis] - B1.max[axis]) / velocity;
      }
      if (B1.max[axis] > A1.min[axis] && velocity < 0)
      {
        touched[axis] = true;
        last[axis] = (A1.min[axis] - B1.max[axis]) / velocity;
      }
      else if (A1.max[axis] > B1.min[axis] && velocity > 0)
      {
        touched[axis] = true;
        last[axis] = (A1.max[axis] - B1.min[axis]) / velocity;
      }
    });

    let firstTouch = _.max(_.toArray(first));
    let lastTouch = _.min(_.toArray(last));

    if (touched.x && touched.y && firstTouch <= lastTouch && firstTouch > 0 && firstTouch <= 1) {
      return {
        time: firstTouch,
        axis: first.x > first.y ? "x" : "y"
      };
    }

    return false;
  }

  intersects(bounds1, bounds2) {
    return bounds1
      .some((bounds) => bounds2
        .some((targetBounds) => targetBounds.intersects(bounds)));
  }

  getIntersections(obj, targets) {
    let intersections = [];
    let objCollisionBounds = obj.collisionBounds;
    let objLastCollisionBounds = obj.lastCollisionBounds;
    for (const target of targets) {
      if (target === obj || target.physics.surfaceType === SURFACE_TYPE.NONE) continue;
      // Only need to test projectiles against characters, not both ways
      // TODO: do all tests, but exclude ones already found
      if (obj.physics.surfaceType === SURFACE_TYPE.CHARACTER &&
          (target.physics.surfaceType === SURFACE_TYPE.PROJECTILE ||
           target.physics.surfaceType === SURFACE_TYPE.GAS)) {
        continue;
      }
      let targetCollisionBounds = target.collisionBounds;
      let targetLastCollisionBounds = target.lastCollisionBounds;

      for (let objBoundIdx = 0; objBoundIdx < objCollisionBounds.length; objBoundIdx++) {
        for (let targetBoundIdx = 0; targetBoundIdx < targetCollisionBounds.length; targetBoundIdx++) {
          let collision = this.sweepTest(objLastCollisionBounds[objBoundIdx], objCollisionBounds[objBoundIdx],
            targetLastCollisionBounds[targetBoundIdx], targetCollisionBounds[targetBoundIdx]);
          if (collision) {
            intersections.push({
              source: obj,
              sourceBounds: objCollisionBounds[objBoundIdx],
              target: target,
              targetBounds: targetCollisionBounds[targetBoundIdx],
              collision: collision
            });
          }
        }
      }

      // TODO: do this after all other physics calculations?
      for (const functionBox of target.getAllFunctionBounds()) {
        if (objCollisionBounds.some((bounds) => bounds.intersects(functionBox.box))) {
          functionBox.cb(obj);
        }
      }
    }

    return intersections;
  }

  detectCollisions(obj, objects) {
    let collisions = [];
    let intersections = this.getIntersections(obj, objects);
    // TODO: order by collision time?
    let intersection = _.minBy(intersections, (intersection) => intersection.collision.time);
    //for (const intersection of intersections) {
    if (intersection) {
      let target = intersection.target;
      let collision = intersection.collision;

      // TODO: make this more robust for high speeds
      // TODO: don't always do this (e.g. piercing projectiles)
      // TODO: create "bounce" or "elasticity" parameter - bounce objects back by
      // this much. If 0 then no bounce.
      // TODO: only bounce off first collision
      if (obj.physics.surfaceType !== SURFACE_TYPE.GAS) {
        if (collision.time !== 0) {
          obj.position[collision.axis] = (obj.lastPosition[collision.axis] +
            (obj.position[collision.axis] - obj.lastPosition[collision.axis]) * collision.time) -
            Math.sign(obj.position[collision.axis] - obj.lastPosition[collision.axis]);
        } else {
          obj.position.x = obj.lastPosition.x;
          obj.position.y = obj.lastPosition.y;
        }
      }
      
      collisions.push({
        source: obj,
        target: target,
        // TODO: use position of collision from sweep test
        position: obj.position.copy()
      });
    }

    return collisions;
  }

  getCollisions(objects) {
    let collisions = [];
    for (const obj of objects) {
      // if (obj.physics.movementType === MOVEMENT_TYPE.NORMAL) {
      //   collisions = collisions.concat(this.detectCollisions(obj, objects));
      // }
      if (obj.physics.surfaceType === SURFACE_TYPE.CHARACTER || 
          obj.physics.surfaceType === SURFACE_TYPE.PROJECTILE ||
          obj.physics.surfaceType === SURFACE_TYPE.GAS) {
        collisions = collisions.concat(this.detectCollisions(obj, objects));
        // Do twice to capture additional collisions after movement
        //collisions = collisions.concat(this.detectCollisions(obj, objects));
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
  }
}
