import GameObject from "../GameObject/GameObject.js"
import { MOVEMENT_TYPE, SURFACE_TYPE } from "./PhysicsConstants.js";

export default class PhysicsEngine {
  constructor(params) {
    Object.assign(this, params);
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

  detectCollisions(obj, objects) {
    //let vector = obj.terrainVector;
    let objBox = obj.boundingBox;
    let collisions = [];
    for (const target of objects) {
      if (target === obj) continue;
      
      if (target.physics.surfaceType === SURFACE_TYPE.TERRAIN || target.physics.surfaceType === SURFACE_TYPE.GROUND) {
        //let intersections = this.getIntersections(vector, target);
        for (const targetBox of target.getAllBounds()) {
          if (objBox.intersects(targetBox)) {
            //let lastTerrainBox = obj.lastTerrainBoundingBox.box;
            collisions.push({
              source: obj,
              target: target
            });
            
            obj.position.x = obj.lastPosition.x;
            obj.position.y = obj.lastPosition.y;

            // TODO: make this more robust for high speeds

            //let targetBox = target.boundingBox.box;
            // if (terrainBox.box.lr.x > targetBox.ul.x && obj.direction.x > 0) {
            //   // TODO: allow non-centered terrain boxes?
            //   obj.position.x = targetBox.ul.x - obj.width / 2 - 1;
            // } else if (terrainBox.box.ul.x < targetBox.lr.x && obj.direction.x < 0) {
            //   obj.position.x = targetBox.lr.x + obj.width / 2 + 1;
            // }
    
            // if (terrainBox.box.lr.y > targetBox.ul.y && terrainBox.box.ul.y < targetBox.ul.y) {
            //   // TODO: allow non-centered terrain boxes?
            //   obj.position.y = targetBox.ul.y - 1;
            // } else if (terrainBox.box.ul.y < targetBox.lr.y && terrainBox.box.lr.y > targetBox.lr.y) {
            //   obj.position.y = targetBox.lr.y + 1;
            // }
          }
        }

        for (const functionBox of target.getAllFunctionBounds()) {
          if (objBox.intersects(functionBox.box)) {
            functionBox.cb(obj);
          }
        }
      }
    }

    return collisions;
  }

  update(elapsedTime, objects) {
    for (const obj of objects) {
      if (obj.direction) {
        Object.assign(obj.lastPosition, obj.position);
        obj.position.x += obj.direction.x * obj.speed * (elapsedTime / 1000);
        obj.position.y += obj.direction.y * obj.speed * (elapsedTime / 1000);
        obj.rotation += (elapsedTime / 50) * obj.spin;
      }
    }

    let collisions = [];
    for (const obj of objects) {
      // if (obj.physics.movementType === MOVEMENT_TYPE.NORMAL) {
      //   collisions = collisions.concat(this.detectCollisions(obj, objects));
      // }
      if (obj.physics.surfaceType === SURFACE_TYPE.CHARACTER) {
        collisions = collisions.concat(this.detectCollisions(obj, objects));
      }
    }   

    return collisions;
  }
}
