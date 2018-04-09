import Vec3 from "./GameObject/Vec3.mjs"
import Bounds from "./GameObject/Bounds.mjs"
import ImageCache from "./Rendering/ImageCache.mjs"
import { getLineIntersection, normalize } from "./util.mjs"

const DEG_TO_RAD = Math.PI / 180;
const X_AXIS = 0;
const Y_AXIS = 1;
const SPREAD_ANGLE = 10 * DEG_TO_RAD;

export default class FieldOfView {
  constructor(fov, objects) {
    this.fov = fov;
    this.fovBounds = this.getFovBounds(objects, fov);
    this.fovImage = ImageCache.get("/Assets/fov.png");
  }
  
  render(context, center, fov) {
    if (!this.fovImage.complete) return;
    
    context.save();

    let dimensions = {
      width: 2000,
      height: 2000
    };
    let position = center.minus({
      x: dimensions.width / 2,
      y: dimensions.height / 2
    });

    context.beginPath();
    //context.arc(center.x, center.y, fov.range, 0, 2 * Math.PI);

    for (const triangle of this.fovBounds) {
      context.moveTo(triangle.points[0].x, triangle.points[0].y);
      context.lineTo(triangle.points[1].x, triangle.points[1].y);
      context.lineTo(triangle.points[2].x, triangle.points[2].y);
      context.lineTo(triangle.points[0].x, triangle.points[0].y);
    }
    context.clip();

    context.drawImage(this.fovImage, position.x, position.y, dimensions.width, dimensions.height);

    // if (clipping) {
    //   position = clipping.offset.plus(position);
    //   let imageDimensions = clipping.dimensions || dimensions;
    //   context.drawImage(this.image, clipping.offset.x, clipping.offset.y, clipping.dimensions.width, clipping.dimensions.height,
    //     position.x, position.y, imageDimensions.width, imageDimensions.height);
    // } else {
    //   context.drawImage(this.image, position.x, position.y, dimensions.width, dimensions.height);
    // }

    context.restore();
  }

  getRay(rays, fov, coneVector, end) {
    let distance = fov.center.distanceTo(end);
    if (distance > fov.range) {
      //end = fov.center.plus(end.minus(fov.center).normalize().times(fov.range));

      let point = normalize({
        x: end.x - fov.center.x,
        y: end.y - fov.center.y
      });
      point.x *= fov.range;
      point.y *= fov.range;
      end = new Vec3({
        x: fov.center.x + point.x,
        y: fov.center.y + point.y
      });
    }
    let line = [fov.center, end];

    // https://stackoverflow.com/questions/14066933/direct-way-of-computing-clockwise-angle-between-2-vectors/16544330#16544330
    let vector = end.minus(fov.center).normalize();
    // let vector = normalize({
    //   x: end.x - fov.center.x,
    //   y: end.y - fov.center.y
    // });
    let angle = Math.atan2(coneVector.det(vector), coneVector.dot(vector));

    let ray = {
      line: line,
      //distance: distance,
      angle: angle
    };

    return ray;
  }

  addWallFromPoints(rays, walls, fov, fovAngle, maxAngle, coneVector, points) {
    for (let i = 0; i < points.length - 1; i++) {
      let wallRays = [];
      // Don't add rays that are outside of field of view
      // Only add wall if at least one edge is within fov
      let good = false;

      let ray1 = this.getRay(rays, fov, coneVector, points[i]);
      if (ray1.angle > -fovAngle && ray1.angle < fovAngle) {
        ray1.clipped = true;
        rays.push(ray1);
        good = true;

        if (i === 0) {
          let leftEndpoint = this.getRotatedRayEndpoint(fov.center, points[0], -0.1, fov.range);
          rays.push(this.getRay(rays, fov, coneVector, leftEndpoint));
        }
      }

      let ray2 = this.getRay(rays, fov, coneVector, points[i + 1]);
      if (ray2.angle > -fovAngle && ray2.angle < fovAngle) {
        ray2.clipped = true;
        rays.push(ray2);
        good = true;

        if (i === points.length - 2) {
          let rightEndpoint = this.getRotatedRayEndpoint(fov.center, points[points.length - 1], 0.1, fov.range);
          rays.push(this.getRay(rays, fov, coneVector, rightEndpoint));
        }
      }

      if (good) {
        wallRays.push(ray1, ray2);
        walls.push({
          rays: wallRays,
          line: [points[i], points[i + 1]],
          startAngle: Math.min(ray1.angle, ray2.angle),
          endAngle: Math.max(ray1.angle, ray2.angle)
        });
      }
    }
  }

  getRotatedRayEndpointRad(start, end, rotation, range) {
    let angle = Math.cos(rotation);
    let sinAngle = Math.sin(rotation);

    return start.plus(new Vec3({
      x: (end.x - start.x) * angle - (end.y - start.y) * sinAngle,
      y: (end.x - start.x) * sinAngle + (end.y - start.y) * angle
    }).normalize().scale(range));
  }

  getRotatedRayEndpoint(start, end, rotation, range) {
    return this.getRotatedRayEndpointRad(start, end, rotation * DEG_TO_RAD, range);
  }

  getRays(objects, fov, coneVector) {
    let rays = [];
    let walls = [];
    let fovAngle = (fov.angle / 2) * DEG_TO_RAD;
    let maxAngle = 90 * DEG_TO_RAD;

    // https://stackoverflow.com/questions/4780119/2d-euclidean-vector-rotations
    let leftEnd = this.getRotatedRayEndpoint(fov.center, fov.target, -(fov.angle / 2), fov.range);
    let rightEnd = this.getRotatedRayEndpoint(fov.center, fov.target, fov.angle / 2, fov.range);
    rays.push(this.getRay(rays, fov, coneVector, leftEnd));
    rays.push(this.getRay(rays, fov, coneVector, rightEnd));

    for (let angle = -fov.angle + SPREAD_ANGLE; angle <= fov.angle - SPREAD_ANGLE; angle += SPREAD_ANGLE) {
      let end = this.getRotatedRayEndpoint(fov.center, fov.target, angle, fov.range);
      rays.push(this.getRay(rays, fov, coneVector, end));
    }

    let relativeRange = fov.range * fov.range;
    for (const object of objects) {
      let losBounds = object.losBounds;
      if (!losBounds) continue;
      for (const bounds of losBounds) {
        if (bounds.points.every((point) => point.relativeDistanceTo(fov.center) > relativeRange)) {
          continue;
        }

        let points = [];
        if (fov.center.y >= bounds.bottom.y) {
          // FOV center is below bounds
          points.push(bounds.ll, bounds.lr);
          if (fov.center.x >= bounds.right.x) {
            points.push(bounds.ur);
          } else if (fov.center.x <= bounds.left.x) {
            points.unshift(bounds.ul);
          }
        } else if (fov.center.y > bounds.top.y) {
          // FOV center is between upper and lower bounds
          if (fov.center.x >= bounds.right.x) {
            points.push(bounds.lr, bounds.ur);
          } else if (fov.center.x <= bounds.left.x) {
            points.push(bounds.ul, bounds.ll);
          } else {
            // TODO: handle case where center is inside bounds
          }

        } else {
          // FOV center is above bounds
          points.push(bounds.ur, bounds.ul);
          if (fov.center.x >= bounds.right.x) {
            points.unshift(bounds.lr);
          } else if (fov.center.x <= bounds.left.x) {
            points.push(bounds.ll);
          }
        }

        if (points.length > 0) {
          this.addWallFromPoints(rays, walls, fov, fovAngle, maxAngle, coneVector, points);
        }
      }
    }

    return { rays: rays, walls: walls };
  }

  // TODO: this function won't handle overlapping bounds very well, could fix this
  refineRays(rays, fov) {
    // Indexes 0 and 1 are the left and right edges of fov
    // TODO: don't depend on indexes
    let left = rays.rays[0];
    let right = rays.rays[1];
    let start = left;
    let end = right;
    
    rays.rays = _.sortBy(rays.rays, "angle");
    rays.walls = _.sortBy(rays.walls, "startAngle");

    let startIdx = rays.rays.indexOf(start);
    let endIdx = rays.rays.indexOf(end);
    let sortedRays = rays.rays;
    sortedRays = rays.rays.slice(startIdx, endIdx + 1);
    if (endIdx < startIdx) {
      sortedRays = sortedRays.concat(rays.rays.slice(0, endIdx + 1));
    }
    rays.rays = sortedRays;

    let wallIdx = 0;
    let nearWalls = [];
    for (const ray of sortedRays) {
      let newEndpoints = [];
      // Add all walls to near walls list that start before the ray
      while (wallIdx < rays.walls.length && rays.walls[wallIdx].startAngle <= ray.angle) {
        if (rays.walls[wallIdx].endAngle >= ray.angle) {
          nearWalls.push(rays.walls[wallIdx]);
        }
        wallIdx++;
      }
      
      // Remove any walls that have gone out of range
      _.remove(nearWalls, (wall) => wall.endAngle < ray.angle);

      for (const wall of nearWalls) {
        if (!wall.rays.includes(ray)) {
          let intersection = getLineIntersection(ray.line, wall.line);
          if (intersection) {
            newEndpoints.push(intersection);
          }
        }
      }

      if (newEndpoints.length > 0) {
        let newEndpoint = _.minBy(newEndpoints, (point) => {
          return point.relativeDistanceTo(ray.line[0]);
        });
        ray.clipped = true;
        ray.line[1] = newEndpoint.copy();
      }
    }
  }

  // Remove unecessary rays that are on the same line. Only need 2 rays for each line.
  pruneRays(rays) {
    let lastX;
    let lastY;
    let axis;
    let count = 1;
    let i = 0;
    for (const ray of rays) {
      if (ray.line[1].x === lastX) {
        if (axis === X_AXIS) {
          count++;
        } else {
          count = 1;
        }
      }
      
      if (ray.line[1].y === lastY) {
        if (axis === Y_AXIS) {
          count++;
        } else {
          count = 1;
        }
      }

      if (count > 2) {
        rays.remove(i - 1);
      }
      
      lastX = ray.line[1].x;
      lastY = ray.line[1].y;
      i++;
    }
  }

  // https://www.redblobgames.com/articles/visibility/
  getFovBounds(objects, fov) {
    let coneVector = new Vec3(fov.target).minus(fov.center).normalize();
    let rays = this.getRays(objects, fov, coneVector);
    this.refineRays(rays, fov);
    this.pruneRays(rays.rays);

    let bounds = [];
    for (let i = 0; i < rays.rays.length; i++) {
      if (i === 0 || i === rays.rays.length - 1) {
        continue;
      }

      let ray = rays.rays[i];
      // Make sure the difference in angle between two rays making up a triangle is no greater
      // than MAX_ANGLE. Create rays in between if this is the case.
      // if (!ray.clipped && !rays.rays[i + 1].clipped) {
      //   let spread = Math.abs(rays.rays[i + 1].angle - ray.angle);
      //   if (spread > MAX_ANGLE) {
      //     let newRays = Math.ceil((spread * 100) / (MAX_ANGLE * 100)) - 1;
      //     let angle = spread / newRays;
      //     if (newRays > 0) {
      //       for (let j = 0; j < newRays; j++) {
      //         let end = this.getRotatedRayEndpointRad(ray.line[0], ray.line[1], angle + angle * j, fov.range);
      //         rays.rays.splice(i + j, 0, this.getRay(rays, fov, coneVector, end));
      //       }
      //     }
      //   }
      // }
    }

    for (let i = 0; i < rays.rays.length - 1; i++) {
      bounds.push(new Bounds({
        dimensions: {
          triangle: [
            fov.center,
            rays.rays[i].line[1],
            rays.rays[i + 1].line[1]
          ]
        }
      }));
    }

    return bounds;
  }

  isInView(object, losHiddenObjs) {
    // TODO: test if object is owned by player instead of if is player
    if (object.losHidden) {
      let objBounds = object.modelBounds;
      if (this.fovBounds.some((bounds) => bounds.intersects(objBounds))) {
        losHiddenObjs.push(object);
        return true;
      }
      return false;
    }
    return true;
  }

  debugRays(context, bounds) {
    context.strokeStyle = "yellow";
    context.fillStyle = "goldenrod";
    for (const triangle of bounds) {
      context.beginPath();
      context.moveTo(triangle.points[0].x, triangle.points[0].y);
      context.lineTo(triangle.points[1].x, triangle.points[1].y);
      context.lineTo(triangle.points[2].x, triangle.points[2].y);
      context.lineTo(triangle.points[0].x, triangle.points[0].y);
      context.fill();
      context.stroke();
    }

    // context.strokeStyle = "yellow";
    // for (const triangle of bounds) {
    //   context.beginPath();
    //   context.moveTo(triangle.points[0].x, triangle.points[0].y);
    //   context.lineTo(triangle.points[1].x, triangle.points[1].y);
    //   context.moveTo(triangle.points[0].x, triangle.points[0].y);
    //   context.lineTo(triangle.points[2].x, triangle.points[2].y);
    //   context.stroke();
    // }
    // context.strokeStyle = "green";
    // for (const wall of rays.walls) {
    //   context.beginPath();
    //   context.moveTo(wall.line[0].x, wall.line[0].y);
    //   context.lineTo(wall.line[1].x, wall.line[1].y);
    //   context.stroke();
    // }
  }
}
