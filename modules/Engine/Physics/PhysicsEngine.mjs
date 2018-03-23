import GameObject from "../GameObject/GameObject.mjs"
import { MOVEMENT_TYPE, SURFACE_TYPE } from "./PhysicsConstants.mjs";
import Point from "../GameObject/Point.mjs";
import Bounds from "../GameObject/Bounds.mjs";

export default class PhysicsEngine {
  constructor(params) {
    this.quadTrees = params;
  }

  // https://gamedev.stackexchange.com/questions/13774/how-do-i-detect-the-direction-of-2d-rectangular-object-collisions
  getCollisionAxis(A1, A2, B1, B2) {
    // if (right collision or left collision)
    if ((A1.right.x < B2.left.x && A2.right.x >=  B2.left.x) ||
        (A1.left.x >= B2.right.x && A2.left.x < B2.right.x)) {
      return "x";
    } else if ((A1.bottom.y < B2.top.y && B2.bottom.y >= B2.top.y || // top or bottom
                A1.top.y >= B2.bottom.y && A2.top.y < B2.bottom.y))
    {
      return "y";
    }
    return "z";
  }

  sweepTest(A1, A2, B1, B2) {

  }

  // https://www.gamasutra.com/view/feature/3383/simple_intersection_tests_for_games.php?page=3
  sweepTest(A1, A2, B1, B2) {
    if (A2.intersects(B2)) {
      return {
        time: 0,
        axis: this.getCollisionAxis(A1, A2, B1, B2)
      };
    }

    // Just check if both Z's are within range
    let AminZ = Math.min(A1.box.ul.z, A2.box.ul.z);
    let AmaxZ = Math.max(A1.box.ul.z + A1.zheight, A2.box.ul.z + A2.zheight);
    let BminZ = Math.min(B1.box.ul.z, B2.box.ul.z);
    let BmaxZ = Math.max(B1.box.ul.z + B1.zheight, B2.box.ul.z + B2.zheight);

    if (AmaxZ < BminZ || BmaxZ < AminZ) {
      return false;
    }

    let vAx = A2.ul.x - A1.ul.x;
    let vAy = A2.ul.y - A1.ul.y;
    let vBx = B2.ul.x - B1.ul.x;
    let vBy = B2.ul.y - B1.ul.y;

    // let ATest = new Bounds({
    //   position: A1.ul,
    //   dimensions: {
    //     width: A1.width + B2.width,
    //     height: A1.height + B2.height
    //   }
    // })

    let v = {
      x: vBx - vAx,
      y: vBy - vAy
    };
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

    let firstTouch = Math.max(first.x, first.y);
    let lastTouch = Math.min(last.x, last.y);

    if (touched.x && touched.y && firstTouch <= lastTouch && firstTouch > 0 && firstTouch <= 1) {
      return {
        time: firstTouch,
        // TODO: will probably need to handle Z for things that fall quickly
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

    for (let objBoundIdx = 0; objBoundIdx < objCollisionBounds.length; objBoundIdx++) {
      //let targets = this.quadTrees[obj.level].colliding(objLastCollisionBounds[objBoundIdx].plus(objCollisionBounds[objBoundIdx]));

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
  
        // TODO: do this after all other physics calculations?
        for (const functionBox of target.getAllFunctionBounds()) {
          if (objCollisionBounds[objBoundIdx].intersects(functionBox.box)) {
            functionBox.cb(obj);
          }
        }

        for (let targetBoundIdx = 0; targetBoundIdx < targetCollisionBounds.length; targetBoundIdx++) {
          if (obj.physics.surfaceType === "projectile" && target.physics.surfaceType === "projectile") {
            console.log("here");
          }
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
    }

    return intersections;
  }

  alreadyCollided(obj, target, collisions) {
    return _.find(collisions, (collision) => {
      return collision.source === target && collision.target === obj;
    });
  }

  getCollisionDirection(obj, target, axis) {
    if (obj.physics.elasticity !== 0 || target.physics.reflectivity !== 0) {
      let objVelocity = obj.speed * obj.direction[axis];
      let targetVelocity = target.speed * target.direction[axis];
      let newVelocity = (targetVelocity - objVelocity) * (obj.physics.elasticity + target.physics.reflectivity);
      obj.speed = obj.speed * obj.physics.elasticity + target.speed * (1 - target.physics.elasticity);
      return -obj.direction[axis];//newVelocity / obj.speed;
    }
    return 0;//obj.direction[axis];
  }

  detectCollisions(obj, objects, allCollisions) {
    let collisions = [];
    let intersections = this.getIntersections(obj, objects);
    // TODO: order by collision time?
    let intersection = _.minBy(intersections, (intersection) => intersection.collision.time);
    //for (const intersection of intersections) {
    if (intersection && !this.alreadyCollided(obj, intersection.target, allCollisions)) {
      let target = intersection.target;
      let collision = intersection.collision;

      // TODO: make this more robust for high speeds
      // TODO: don't always do this (e.g. piercing projectiles)
      // TODO: create "bounce" or "elasticity" parameter - bounce objects back by
      // this much. If 0 then no bounce.
      // TODO: only bounce off first collision
      if (obj.physics.solidity > 0 && target.physics.solidity > 0) {
        if (collision.time !== 0) {
          obj.position.x = (obj.lastPosition.x +
            (obj.position.x - obj.lastPosition.x) * collision.time) -
            Math.sign(obj.position.x - obj.lastPosition.x);
          obj.position.y = (obj.lastPosition.y +
            (obj.position.y - obj.lastPosition.y) * collision.time) -
            Math.sign(obj.position.y - obj.lastPosition.y);
          obj.position.z = (obj.lastPosition.z +
            (obj.position.z - obj.lastPosition.z) * collision.time) -
            Math.sign(obj.position.z - obj.lastPosition.z);
        } else {
          // TODO: determine how much the bounds overlap and adjust by that much
          // let sign = obj.position[collision.axis] - obj.lastPosition[collision.axis];
          // if (sign > 0) {
          //   let dimension = collision.axis === "x" ? "width" : "height";
          //   obj.position[collision.axis] = intersection.targetBounds.ul[collision.axis] - obj.dimensions[dimension] - 1;
          // } else {
          //   obj.position[collision.axis] = intersection.targetBounds.lr[collision.axis] + 1;
          // }
          // Top
          let diff = intersection.targetBounds.top.y - intersection.sourceBounds.bottom.y;
          let axis = "y";
          // Bottom
          if (Math.abs(intersection.targetBounds.bottom.y - intersection.sourceBounds.top.y) < Math.abs(diff)) {
            diff = intersection.targetBounds.bottom.y - intersection.sourceBounds.top.y;
          }
          // Left
          if (Math.abs(intersection.targetBounds.left.x - intersection.sourceBounds.right.x) < Math.abs(diff)) {
            axis = "x";
            diff = intersection.targetBounds.left.x - intersection.sourceBounds.right.x;
          }
          // Right
          if (Math.abs(intersection.targetBounds.right.x - intersection.sourceBounds.left.x) < Math.abs(diff)) {
            axis = "x";
            diff = intersection.targetBounds.right.x - intersection.sourceBounds.left.x;
          }
          // Z-Top
          if (Math.abs(intersection.targetBounds.ztop.z - intersection.sourceBounds.zbottom.z) < Math.abs(diff)) {
            axis = "z";
            diff = intersection.targetBounds.ztop.z - intersection.sourceBounds.zbottom.z;
          }
          // Z-Bottom
          if (Math.abs(intersection.targetBounds.zbottom.z - intersection.sourceBounds.ztop.z) < Math.abs(diff)) {
            axis = "z";
            diff = intersection.targetBounds.zbottom.z - intersection.sourceBounds.ztop.z;
          }

          obj.position[axis] += diff + 1;

          // obj.position.x = obj.lastPosition.x;
          // obj.position.y = obj.lastPosition.y;
        }

        // TODO: handle diagonal intersections
        let newDirection = this.getCollisionDirection(obj, target, collision.axis);
        target.direction[collision.axis] = this.getCollisionDirection(target, obj, collision.axis);
        obj.direction[collision.axis] = newDirection;
      }
      
      collisions.push({
        source: obj,
        target: target,
        // TODO: use position of collision from sweep test
        position: obj.position.copy()
      });
      collisions.push({
        source: target,
        target: obj,
        // TODO: use position of collision from sweep test
        position: obj.position.copy()
      });

      // this.quadTrees[obj.level].remove(obj);
      // this.quadTrees[obj.level].push(obj);
      // this.quadTrees[target.level].remove(target);
      // this.quadTrees[target.level].push(target);
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
        collisions = collisions.concat(this.detectCollisions(obj, objects, collisions));
        // Do twice to capture additional collisions after movement
        //collisions = collisions.concat(this.detectCollisions(obj, objects));
      }

      if (obj.position.z < 0) {
        obj.position.z = 0;
        obj.direction.z = -obj.direction.z * obj.physics.elasticity;
        if (Math.abs(obj.direction.z) < 0.15) obj.direction.z = 0;
        // TODO: make sure you cant doubly collide with an object AND the ground
        collisions.push({
          source: obj,
          target: "ground",
          position: obj.position.copy()
        });
      }

      obj.updatePosition();
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

      if (obj.speed && (obj.direction.x || obj.direction.y || obj.direction.z)) {
        obj.lastPosition = new Point(obj.position);
        obj.position.x = obj.position.x + obj.direction.x * obj.speed * (time / 1000);
        obj.position.y = obj.position.y + obj.direction.y * obj.speed * (time / 1000);
        if (obj.direction.z) {
          obj.position.z = obj.position.z + obj.direction.z * obj.speed * (time / 1000);//(obj.zspeed || obj.speed) * (time / 1000));
        }
        if (obj.physics.friction > 0 && obj.position.z === 0) {
          let amount = obj.speed * (time / 1000);
          obj.speed = obj.speed - obj.speed * (time / 1000) * obj.physics.friction;
          if (obj.speed < 1) {
            obj.speed = 0;
          }
        }

        obj.updatePosition();
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

      // this.quadTrees[obj.level].remove(obj);
      // this.quadTrees[obj.level].push(obj);
    }
  }
}
