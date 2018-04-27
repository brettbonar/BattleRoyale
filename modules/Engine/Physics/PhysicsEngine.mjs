import GameObject from "../GameObject/GameObject.mjs"
import { AXES, MOVEMENT_TYPE, SURFACE_TYPE } from "./PhysicsConstants.mjs";
import Vec3 from "../GameObject/Vec3.mjs";
import Bounds from "../GameObject/Bounds.mjs";
import ShadowField from "../../BattleRoyale/Shadow/ShadowField.mjs";

export default class PhysicsEngine {
  constructor(grid) {
    //this.grid = grid;
  }

  // getCollisionTime(A1, A2, B1, B2) {
  //   let times = AXES.map((axis) => {
  //     let Adiff = A2.ul[axis] - A1.ul[axis];
  //     let Bdiff = A2.ul[axis] - A1.ul[axis];
  //     let diff = v[axis];
  //     let time = 0;
  //     if (diff > 0) { // moving in positive direction
  //       time = 1 - (Math.abs(A2.max[axis] - B2.min[axis]) / Math.abs(diff));
  //     } else if (diff < 0) { // moving in negative direction
  //       time = 1 - (Math.abs(B2.max[axis] - A2.min[axis]) / Math.abs(diff));
  //     }
  //     return {
  //       axis: axis,
  //       time: Math.min(0, time)
  //     };
  //   });

  //   return _.maxBy(times, "time");
  // }

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

  // https://www.gamasutra.com/view/feature/3383/simple_intersection_tests_for_games.php?page=3
  sweepTest(A1, A2, B1, B2) {
    if (A1.intersects(B1)) {
      return {
        axis: "x",
        time: 0
      };
    }

    // if (A2.intersects(B2)) {
    //   return this.getCollisionTime(A1, A2, B1, B2);
    // }

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
      x: A2.intersectsAxis(B2, "x"),
      y: A2.intersectsAxis(B2, "y")
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
      return new Vec3({
        x: line1[0].x + (t * s1_x),
        y: line1[0].y + (t * s1_y)
      });
    }

    return false;
  }

  // https://gamedev.stackexchange.com/questions/29479/swept-aabb-vs-line-segment-2d
  rayBoxTest(A1, A2, ray) {
    // TODO: can make this more efficient by not getting every line
    // TODO: first test if either endpoint is within the box
    // Get lines representing both boxes and the lines between them
    let lines = _.map(A1.box, (point, loc) => {
      return [point, A2.box[loc]];
    }).concat(A1.lines, A2.lines);
    
    let intersection = _.minBy(lines, (line) => {

    });
  }

  rayRayTest() {}

  getCollision(lastBounds, currentBounds, targetLastBounds, targetCurrentBounds) {
    // TODO: do broadphase detection first
    if (currentBounds.type === Bounds.TYPE.AABB && targetCurrentBounds.type === Bounds.TYPE.AABB) {
      return this.sweepTest(lastBounds, currentBounds, targetLastBounds, targetCurrentBounds);
    } else if (currentBounds.type === Bounds.TYPE.AABB && targetCurrentBounds.type === Bounds.TYPE.LINE) {
      return this.rayBoxTest(lastBounds, currentBounds, targetCurrentBounds);
    } else if (currentBounds.type === Bounds.TYPE.LINE && targetCurrentBounds.type === Bounds.TYPE.AABB) {
      return this.rayBoxTest(targetLastBounds, targetCurrentBounds, currentBounds);
    } else if (currentBounds.type === Bounds.TYPE.LINE && targetCurrentBounds.type === Bounds.TYPE.LINE) {
      return this.rayRayTest(currentBounds, targetCurrentBounds);
    } else {
      console.log("Unsupported intersection test: ", currentBounds.type, targetCurrentBounds.type);
    }
  }

  intersects(bounds1, bounds2) {
    return bounds1
      .some((bounds) => bounds2
        .some((targetBounds) => targetBounds.intersects(bounds)));
  }

  getTargetIntersections(obj, objCollisionBounds, objLastCollisionBounds, target, allCollisions) {
    let intersections = [];

    let targetCollisionBounds = target.collisionBounds;
    let targetLastCollisionBounds = target.lastCollisionBounds;

    for (let objBoundIdx = 0; objBoundIdx < objCollisionBounds.length; objBoundIdx++) {
      // TODO: do this after all other physics calculations?
      for (const functionBounds of target.getAllFunctionBounds()) {
        if (objCollisionBounds[objBoundIdx].intersects(functionBounds.bounds)) {
          functionBounds.cb(obj);
        }
      }

      for (let targetBoundIdx = 0; targetBoundIdx < targetCollisionBounds.length; targetBoundIdx++) {
        let collision = this.getCollision(objLastCollisionBounds[objBoundIdx], objCollisionBounds[objBoundIdx],
          targetLastCollisionBounds[targetBoundIdx], targetCollisionBounds[targetBoundIdx])
        if (collision) {
          let intersection = {
            source: obj,
            sourceBoundsIdx: objBoundIdx,
            target: target,
            targetBoundsIdx: targetBoundIdx,
            collision: collision
          };
          intersections.push(intersection);
        }
      }
    }

    return intersections;
  }

  getIntersections(obj, targets, allCollisions) {
    let intersections = [];
    let objCollisionBounds = obj.collisionBounds;
    let objLastCollisionBounds = obj.lastCollisionBounds;

    for (const target of targets) {
      if (obj.physics.surfaceType === SURFACE_TYPE.CHARACTER && target.physics.surfaceType === SURFACE_TYPE.PROJECTILE) {
        // TODO: find a better way of doing this. Don't want characters to think they collided with projectiles that
        // collided with something else earlier
        continue;
      }
      if (target === obj || target.physics.surfaceType === SURFACE_TYPE.NONE) {
        continue;
      }
      if (obj.interactsWith && obj.interactsWith.length > 0 && !obj.interactsWith.includes(target.type)) {
        continue;
      }
      if (target.interactsWith && target.interactsWith.length > 0 && !target.interactsWith.includes(obj.type)) {
        continue;
      }
      if (obj.actionId && obj.actionId === target.actionId) {
        continue;
      }
      if (this.alreadyCollided(obj, target, allCollisions)) {
        continue;
      }

      intersections = intersections.concat(this.getTargetIntersections(obj, objCollisionBounds, objLastCollisionBounds, target, allCollisions));
    }

    return intersections;
  }

  alreadyCollided(obj, target, collisions) {
    return _.find(collisions, (collision) => {
      return collision.source === target && collision.target === obj ||
        collision.target === target && collision.source === obj;
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

  intersects(obj, target) {
    let objCollisionBounds = obj.collisionBounds;
    let targetCollisionBounds = target.collisionBounds;
    return objCollisionBounds.some((objBounds) => {
      return targetCollisionBounds.some((targetBounds) => {
        return objBounds.intersects(targetBounds);
      });
    });
  }

  updatePositionsAfterCollision(obj, prevObjPosition, intersection) {
    let collisions = [];
    let collided = false;

    let target = intersection.target;
    let collision = intersection.collision;
    let prevTargetPosition = target.position.copy();

    if (obj.physics.solidity > 0 && target.physics.solidity > 0 &&
        obj.physics.surfaceType !== SURFACE_TYPE.GAS && target.physics.surfaceType !== SURFACE_TYPE.GAS) {
      if (!obj.static) {
        collided = true;
      }
      // TODO: find a good way to allow you to slide along walls without also screwing up beams
      if (collision.time === 0) {
        obj.position = obj.lastPosition.copy();
        target.position = target.lastPosition.copy();
        collided = true;
      } else {
        for (const axis of AXES) {
          // TODO: also test that direction matches, so if target is moving away from obj it doesn't get pulled back
          if (target.physics.push || obj.physics.alwaysPushed) {
            let diff = (obj.position[axis] - obj.lastPosition[axis]) * collision.time * target.physics.force;
            if (diff !== 0) {
              collided = true;
              obj.position[axis] = obj.lastPosition[axis] + diff - Math.sign(obj.position[axis] - obj.lastPosition[axis]);
            }
          }

          if (obj.physics.push || target.physics.alwaysPushed) {
            let targetDiff = (target.position[axis] - target.lastPosition[axis]) * collision.time * obj.physics.force;
            if (targetDiff !== 0) {
              collided = true;
              target.position[axis] = target.lastPosition[axis] + targetDiff - Math.sign(target.position[axis] - target.lastPosition[axis]);
            }
          }

          // Sanity check that objects are no longer intersecting
          // TODO: this is another really bad hack to fix beams
          if (this.intersects(obj, target) && target.physics.push && obj.physics.push) {
            obj.position = obj.lastPosition.copy();
            target.position = target.lastPosition.copy();
          }
        }
      }

      // TODO: handle diagonal intersections
      if (obj.physics.elasticity !== 0 || target.physics.reflectivity !== 0) {
        let newDirection = this.getCollisionDirection(obj, target, collision.axis);
        target.direction[collision.axis] = this.getCollisionDirection(target, obj, collision.axis);
        obj.direction[collision.axis] = newDirection;
      }

      obj.updatePosition();
      target.updatePosition();
    }
    
    let sourceBounds = new Bounds({
      position: obj.lastPosition.plus(prevObjPosition.minus(obj.lastPosition).times(collision.time)),
      dimensions: obj.collisionDimensions[intersection.sourceBoundsIdx].dimensions
    });
    let targetBounds = new Bounds({
      position: target.lastPosition.plus(prevTargetPosition.minus(target.lastPosition).times(collision.time)),
      dimensions: target.collisionDimensions[intersection.targetBoundsIdx].dimensions
    });

    collisions.push({
      source: obj,
      sourceBounds: sourceBounds,
      target: target,
      targetBounds: targetBounds,
      position: sourceBounds.center
    });

    collisions.push({
      source: target,
      sourceBounds: targetBounds,
      target: obj,
      targetBounds: sourceBounds,
      position: targetBounds.center
    });

    return {
      collisions: collisions,
      collided: collided
    };
  }

  detectCollisions(obj, objects, allCollisions) {
    let collisions = [];

    let intersections = this.getIntersections(obj, objects, allCollisions);
    intersections = _.sortBy(intersections, (intersection) => intersection.collision.time);
    //for (const intersection of intersections) {
    let collided = false;

    let prevObjPosition = obj.position.copy();
    for (let i = 0; i < intersections.length && !collided; i++) {
      let result = this.updatePositionsAfterCollision(obj, prevObjPosition, intersections[i]);
      collisions.push(...result.collisions);
      collided = result.collided;
    }

    return collisions;
  }

  getObjectCollisions(obj, grid, allCollisions) {
    let collisions = [];
    // if (obj.physics.movementType === MOVEMENT_TYPE.NORMAL) {
    //   collisions = collisions.concat(this.detectCollisions(obj, objects));
    // }
    if (obj.physics.surfaceType === SURFACE_TYPE.CHARACTER || 
        obj.physics.surfaceType === SURFACE_TYPE.PROJECTILE ||
        obj.physics.surfaceType === SURFACE_TYPE.GAS) {
      let collisionObjects = grid.getAdjacentCollision(obj);
      collisions.push(...this.detectCollisions(obj, collisionObjects, allCollisions));
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
      obj.updatePosition();
    }

    return collisions;
  }

  getCollisions(objects, grid) {
    let collisions = [];
    for (const obj of objects) {
      collisions.push(...this.getObjectCollisions(obj, grid, collisions));
    }

    return collisions;
  }

  updateObject(elapsedTime, obj, grid) {
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
      obj.lastPosition = new Vec3(obj.position);
      obj.position.x = obj.position.x + obj.direction.x * obj.speed * (time / 1000);
      obj.position.y = obj.position.y + obj.direction.y * obj.speed * (time / 1000);
      // TODO: use zspeed so friction won't slow down falling
      if (obj.direction.z) {
        obj.position.z = obj.position.z + obj.direction.z * (obj.zspeed || obj.speed) * (time / 1000);
      }

      if (obj.physics.friction > 0 && obj.position.z === 0) {
        if (obj.physics.friction === Infinity) {
          obj.speed = 0;
        } else {
          let amount = obj.speed * (time / 1000);
          obj.speed = obj.speed - obj.speed * (time / 1000) * obj.physics.friction;
          if (obj.speed < 1) {
            obj.speed = 0;
          }
        }
      }

      obj.updatePosition();
      grid.update(obj);
    }
    if (obj.spin) {
      obj.rotation += obj.spin * (time / 1000);
    }
    if (obj.acceleration) {
      obj.direction = new Vec3(obj.direction).add({
        x: obj.acceleration.x * (time / 1000),
        y: obj.acceleration.y * (time / 1000),
        z: obj.acceleration.z * (time / 1000)
      });
    }
  }

  update(elapsedTime, objects, grid) {
    // TRICKY: Not sure why this happens at the beginning
    if (!elapsedTime) return [];

    for (const obj of objects) {
      this.updateObject(elapsedTime, obj, grid);
    }
  }
}
