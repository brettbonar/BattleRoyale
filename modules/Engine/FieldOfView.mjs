import Vec3 from "./GameObject/Vec3.mjs"
import Bounds from "./GameObject/Bounds.mjs"
import ImageCache from "./Rendering/ImageCache.mjs"
import { getLineIntersection, normalize, getRotatedEndpoint, boundsIntersectsBounds2D } from "./util.mjs"

const DEG_TO_RAD = Math.PI / 180;
const X_AXIS = 0;
const Y_AXIS = 1;
const SPREAD_ANGLE = 5;
const HALF_FOV = 180;
const FULL_FOV = 360;

export default class FieldOfView {
  constructor(fov, objects) {
    this.fov = fov;
    this.fovBounds = this.getFovBounds(objects, fov);
    this.fovImage = ImageCache.get("/Assets/fov.png");
    this.fullFov = false;
  }
  
  render(context) {
    if (!this.fovImage.complete || this.fovBounds.length === 0) return;
    
    context.save();

    let dimensions = {
      width: this.fov.range * 2,
      height: this.fov.range * 2
    };
    let position = this.fov.center.minus({
      x: dimensions.width / 2,
      y: dimensions.height / 2
    });

    context.beginPath();

    context.moveTo(this.fovBounds[0].points[0].x, this.fovBounds[0].points[0].y);
    context.lineTo(this.fovBounds[0].points[1].x, this.fovBounds[0].points[1].y);
    for (const triangle of this.fovBounds) {
      context.lineTo(triangle.points[2].x, triangle.points[2].y);
    }
    // Make sure we close the circle if FOV is 360
    if (this.fov.angle >= FULL_FOV) {
      context.lineTo(this.fovBounds[0].points[2].x, this.fovBounds[0].points[2].y);
    }
    context.lineTo(this.fovBounds[0].points[0].x, this.fovBounds[0].points[0].y);

    
    context.closePath();
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

  getExtendedEndpoint(start, end, distance) {
    let point = normalize({
      x: end.x - start.x,
      y: end.y - start.y
    });
    point.x *= distance;
    point.y *= distance;

    return {
      x: start.x + point.x,
      y: start.y + point.y
    };
  }

  getRay(fov, coneVector, end) {
    let distance = fov.center.distanceTo(end);
    // if (distance > fov.range) {
    //   end = this.getExtendedEndpoint(fov.center, end, fov.range);
    // }
    let line = [fov.center, end];

    // https://stackoverflow.com/questions/14066933/direct-way-of-computing-clockwise-angle-between-2-vectors/16544330#16544330
    //let vector = end.minus(fov.center).normalize();
    let vector = normalize({
      x: end.x - fov.center.x,
      y: end.y - fov.center.y
    });
    let angle = Math.atan2(coneVector.det(vector), coneVector.dot(vector));

    let ray = {
      line: line,
      distance: distance,
      angle: angle
    };

    return ray;
  }

  // Get intersection at FOV range between point1 and point2
  getFovRangeIntersection(fov, point1, point2) {
    let endpoint1 = this.getExtendedEndpoint(fov.center, point1, fov.range);
    let endpoint2 = this.getExtendedEndpoint(fov.center, point2, fov.range);
    return getLineIntersection([endpoint1, endpoint2], [point1, point2]);
  }

  addWallFromPoints(rays, walls, fov, fovAngle, coneVector, points) {
    let wallRays = [];
    let leftEndIdx = 0;
    let rightEndIdx = points.length - 2;
    for (let i = 0; i < points.length - 1; i++) {
      // Don't add rays that are outside of field of view
      let ray1 = this.getRay(fov, coneVector, points[i]);
      let ray2 = this.getRay(fov, coneVector, points[i + 1]);

      let ray1InAngle = ray1.angle > -fovAngle && ray1.angle < fovAngle;
      let ray2InAngle = ray2.angle > -fovAngle && ray2.angle < fovAngle;
      let ray1InRange = ray1.distance <= fov.range;
      let ray2InRange = ray2.distance <= fov.range;

      if (ray1InRange && !ray2InRange) {
        ray2 = this.getRay(fov, coneVector, this.getFovRangeIntersection(fov, points[i], points[i + 1]));
      } else if (ray2InRange && !ray1InRange) {
        ray1 = this.getRay(fov, coneVector, this.getFovRangeIntersection(fov, points[i], points[i + 1]));
      }

      if (ray1.angle > -fovAngle && ray1.angle < fovAngle) {
        wallRays.push(ray1);

        if (ray1.distance <= fov.range) {
          if (ray1InRange && ray1InAngle && i === 0) {
            let leftEndpoint = getRotatedEndpoint(fov.center, points[i], -0.01, fov.range);
            //let leftEndpoint = this.getExtendedEndpoint(fov.center, points[i], fov.range);
            let leftRay = this.getRay(fov, coneVector, leftEndpoint);
            leftRay.angle = ray1.angle;
            rays.push(leftRay);
            wallRays.push(leftRay);
          }

          rays.push(ray1);
        }
      }

      if (ray2.angle > -fovAngle && ray2.angle < fovAngle) {
        wallRays.push(ray2);

        if (ray2.distance <= fov.range) {
          rays.push(ray2);

          if (ray2InRange && ray2InAngle && i === points.length - 2) {
            let rightEndpoint = getRotatedEndpoint(fov.center, points[i + 1], 0.01, fov.range);
            //let rightEndpoint = this.getExtendedEndpoint(fov.center, points[i + 1], fov.range);
            let rightRay = this.getRay(fov, coneVector, rightEndpoint);
            rightRay.angle = ray2.angle;
            rays.push(rightRay);
            wallRays.push(rightRay);
          }
        }
      }

      walls.push({
        rays: wallRays,
        line: [points[i], points[i + 1]],
        startAngle: ray1.angle,
        endAngle: ray2.angle
      });
    }
  }

  getRays(objects, fov, coneVector) {
    let rays = [];
    let walls = [];
    let fovAngle = (fov.angle / 2) * DEG_TO_RAD;

    // https://stackoverflow.com/questions/4780119/2d-euclidean-vector-rotations
    let leftEnd = getRotatedEndpoint(fov.center, fov.target, -(fov.angle / 2), fov.range);
    rays.push(this.getRay(fov, coneVector, leftEnd));

    if (fov.angle < FULL_FOV) {
      let rightEnd = getRotatedEndpoint(fov.center, fov.target, fov.angle / 2, fov.range);
      rays.push(this.getRay(fov, coneVector, rightEnd));
    }
    
    let startAngle = -fov.angle / 2 + SPREAD_ANGLE;
    let endAngle = fov.angle / 2 - SPREAD_ANGLE;
    for (let angle = startAngle; angle <= endAngle; angle += SPREAD_ANGLE) {
      let end = getRotatedEndpoint(fov.center, fov.target, angle, fov.range);
      rays.push(this.getRay(fov, coneVector, end));
    }

    let relativeRange = fov.range * fov.range;
    for (const object of objects) {
      let losBounds = object.losBounds;
      if (!losBounds) continue;
      for (const bounds of losBounds) {
        if (bounds.points.every((point) => point.relativeDistanceTo(fov.center) > relativeRange)) {
          continue;
        }
        if (bounds.top.z < fov.center.z) {
          continue;
        }

        let points = [];
        if (fov.center.y > bounds.bottom.y) {
          // FOV center is below bounds
          points.push(bounds.ll, bounds.lr);
          if (fov.center.x >= bounds.right.x) {
            points.push(bounds.ur);
          } else if (fov.center.x <= bounds.left.x) {
            points.unshift(bounds.ul);
          }
        } else if (fov.center.y >= bounds.top.y) {
          // FOV center is between upper and lower bounds
          if (fov.center.x >= bounds.right.x) {
            points.push(bounds.lr, bounds.ur);
          } else if (fov.center.x <= bounds.left.x) {
            points.push(bounds.ul, bounds.ll);
          } else {
            // FOV center is inside bounds, show nothing
            return { rays: [], walls: [] };
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
          this.addWallFromPoints(rays, walls, fov, fovAngle, coneVector, points);
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
    
    let fullFov = fov.angle >= FULL_FOV;
    let halfFov = fov.angle >= HALF_FOV;
    if (!fullFov) {
      sortedRays = rays.rays.slice(startIdx, endIdx + 1);
      if (endIdx < startIdx) {
        sortedRays = sortedRays.concat(rays.rays.slice(0, endIdx + 1));
      }
    }
    rays.rays = sortedRays;

    let wallIdx = 0;
    let nearWalls = [];
    if (halfFov) {
      nearWalls = rays.walls;
    }
    for (const ray of sortedRays) {
      let newEndpoints = [];

      // TRICKY: this optimization fails if FOV is > 180 and due to angles wrapping from
      // -3.14 to 3.14. Should find a way around this.
      if (!halfFov) {
        // Add all walls to near walls list that start before the ray
        while (wallIdx < rays.walls.length && rays.walls[wallIdx].startAngle <= ray.angle) {
          if (rays.walls[wallIdx].endAngle >= ray.angle) {
            nearWalls.push(rays.walls[wallIdx]);
          }
          wallIdx++;
        }
        // Remove any walls that have gone out of range
        _.remove(nearWalls, (wall) => wall.endAngle < ray.angle);
      }

      for (const wall of nearWalls) {
        if (!wall.rays.includes(ray)) {
          let intersection = getLineIntersection(ray.line, wall.line);
          //let intersection = this.getFovRangeIntersection(fov, wall.line[0], wall.line[1]);
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
  // TODO: figure out how to make this work. May also not be necessary.
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
          axis = X_AXIS;
          count = 1;
        }
      }
      
      if (ray.line[1].y === lastY) {
        if (axis === Y_AXIS) {
          count++;
        } else {
          axis = Y_AXIS;
          count = 1;
        }
      }

      if (count > 2 && rays[i - 1].clipped) {
        rays.splice(i - 1, 1);
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

    if (window.debug) {
      this.walls = rays.walls;
    }
    //this.pruneRays(rays.rays);

    let bounds = [];
    for (let i = 0; i < rays.rays.length; i++) {
      if (i === 0 || i === rays.rays.length - 1) {
        continue;
      }

      //let ray = rays.rays[i];
      // Make sure the difference in angle between two rays making up a triangle is no greater
      // than MAX_ANGLE. Create rays in between if this is the case.
      // if (!ray.clipped && !rays.rays[i + 1].clipped) {
      //   let spread = Math.abs(rays.rays[i + 1].angle - ray.angle);
      //   if (spread > MAX_ANGLE) {
      //     let newRays = Math.ceil((spread * 100) / (MAX_ANGLE * 100)) - 1;
      //     let angle = spread / newRays;
      //     if (newRays > 0) {
      //       for (let j = 0; j < newRays; j++) {
      //         let end = getRotatedEndpointRad(ray.line[0], ray.line[1], angle + angle * j, fov.range);
      //         rays.rays.splice(i + j, 0, this.getRay(fov, coneVector, end));
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

    // Come full circle
    if (fov.angle >= FULL_FOV) {
      bounds.push(new Bounds({
        dimensions: {
          triangle: [
            fov.center,
            rays.rays[rays.rays.length - 1].line[1],
            rays.rays[0].line[1]
          ]
        }
      }));
    }

    return bounds;
  }

  isInView(object, losHiddenObjs) {
    // TODO: test if object is owned by player instead of if is player
    if (object.losHidden) {
      let objBounds = object.visibleBounds;
      if (object.isThisPlayer || boundsIntersectsBounds2D(this.fovBounds, objBounds)) {
        losHiddenObjs.push(object);
        return true;
      }
      return false;
    }
    return true;
  }

  debugRays(context) {
    context.strokeStyle = "yellow";
    context.fillStyle = "goldenrod";
    for (const triangle of this.fovBounds) {
      context.beginPath();
      context.moveTo(triangle.points[0].x, triangle.points[0].y);
      context.lineTo(triangle.points[1].x, triangle.points[1].y);
      context.lineTo(triangle.points[2].x, triangle.points[2].y);
      context.lineTo(triangle.points[0].x, triangle.points[0].y);
      context.fill();
      context.stroke();
    }

    // context.strokeStyle = "yellow";
    // for (const triangle of this.fovBounds) {
    //   context.beginPath();
    //   context.moveTo(triangle.points[0].x, triangle.points[0].y);
    //   context.lineTo(triangle.points[1].x, triangle.points[1].y);
    //   context.moveTo(triangle.points[0].x, triangle.points[0].y);
    //   context.lineTo(triangle.points[2].x, triangle.points[2].y);
    //   context.stroke();
    // }
    context.strokeStyle = "green";
    if (this.walls) {
    for (const wall of this.walls) {
        context.beginPath();
        context.moveTo(wall.line[0].x, wall.line[0].y);
        context.lineTo(wall.line[1].x, wall.line[1].y);
        context.stroke();
      }
    }
  }
}
