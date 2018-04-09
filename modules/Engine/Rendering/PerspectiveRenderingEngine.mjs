import RenderingEngine from "./RenderingEngine.mjs"
import { SURFACE_TYPE } from "../Physics/PhysicsConstants.mjs"
import Bounds from "../GameObject/Bounds.mjs"
import Vec3 from "../GameObject/Vec3.mjs"
import Dimensions from "../GameObject/Dimensions.mjs"
import { getLineIntersection } from "../util.mjs"
import ImageCache from "./ImageCache.mjs"

const DEG_TO_RAD = Math.PI / 180;

export default class PerspectiveRenderingEngine extends RenderingEngine{
  constructor(params) {
    super(params);

    this.fovImage = ImageCache.get("/Assets/fov.png");
  }

  renderFOV(context, center, fov, fovBounds) {
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

    for (const triangle of fovBounds) {
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

  renderFaded(context, object, elapsedTime) {
    if (object.fadeDimensions) {
      context.globalAlpha = 0.3;
      //object.render(context, elapsedTime);
      object.render(context, elapsedTime, object.fadeDimensions);
      let offset = object.fadeDimensions.offset || new Vec3();
      let dimensions = object.fadeDimensions.dimensions || new Dimensions();

      context.globalAlpha = 1;
      object.render(context, 0, {
        offset: offset.plus({ y: dimensions.height }),
        dimensions: {
          width: object.dimensions.width,
          height: object.dimensions.height - dimensions.height
        }
      });
    } else {
      context.globalAlpha = 0.3;
      object.render(context, elapsedTime);
    }
  }

  isAnyObjectHidden(losHiddenObjects, fadeObject) {
    return losHiddenObjects.some((obj) => obj.modelBounds.intersects(fadeObject.modelBounds));
  }

  renderObject(context, object, elapsedTime, losHiddenObjects, clipping) {
    context.save();
    if (object.losFade && this.isAnyObjectHidden(losHiddenObjects, object)) {
      this.renderFaded(context, object, elapsedTime, clipping);
    } else {
      object.render(context, elapsedTime, clipping);
    }
    context.restore();
  }

  sortClips(clip) {
    return clip.object.position.z + clip.object.dimensions.zheight;
  }

  // Render highest to lowest y
  render(context, objects, elapsedTime, center, fov) {
    //window.debug = true;
    context.save();

    let fovBounds;
    if (fov) {
      fovBounds = this.getFovBounds(objects, fov);
    }

    if (window.debug) {
      this.debugRays(context, fovBounds);
    }

    // if (center) {
    //   context.translate(-(center.x - context.canvas.width / 2), -(center.y - context.canvas.height / 2));
    // }

    let objsToRender = this.getRenderObjects(objects, center, fovBounds);
    let renderObjects = objsToRender.renderObjects;

    for (const groundObject of objsToRender.groundObjects) {
      this.renderObject(context, groundObject, elapsedTime, objsToRender.losHiddenObjects);
    }

    if (fov) {
      this.renderFOV(context, center, fov, fovBounds);
    }

    let clips = [];
    let y, obj;
    for (y = 0; y < renderObjects.length; y++) {
      if (!renderObjects[y]) continue;
      for (obj = 0; obj < renderObjects[y].length; obj++) {
        let object = renderObjects[y][obj];
        if (object.renderClipped) {
          clips.push({
            object: object,
            bottom: y + object.height,
            top: y,
            previousClip: 0
          });
          clips = _.sortBy(clips, this.sortClips);
          continue;
        }

        // TODO: ignore small things like particles when clipping
        for (const clip of clips) {
          let height = 0;
          if (y >= clip.bottom) {
            height = clip.object.height - clip.previousClip;
          } else {
            height = Math.round(Math.min(clip.object.height - clip.previousClip,
              (y - clip.top - clip.previousClip) - clip.object.zheight));
          }

          if (height > 0) {
            let clipping = {
              offset: new Vec3({
                x: 0,
                y: clip.previousClip
              }),
              dimensions: new Dimensions({
                width: clip.object.width,
                height: height + 1 // TRICKY: add 1 to prevent one off rendering artifacts
              })
            };
            // TODO: reset elapsed time after first render?
            this.renderObject(context, clip.object, elapsedTime, objsToRender.losHiddenObjects, clipping);

            clip.previousClip += height;
            if (clip.previousClip >= clip.object.height) {
              _.pull(clips, clip);
            }
          }
        }

        this.renderObject(context, object, elapsedTime, objsToRender.losHiddenObjects);
      }
    }

    for (const clip of clips) {
      let clipping = {
        offset: new Vec3({
          x: 0,
          y: clip.previousClip
        }),
        dimensions: new Dimensions({
          width: clip.object.width,
          height: clip.object.height - clip.previousClip
        })
      };
      this.renderObject(context, clip.object, elapsedTime, center, clipping);
    }
    
    if (window.debug) {
      this.debugBoxes(context, renderObjects);
    }

    
    // let pos = {
    //   x: 600,
    //   y: 600
    // };
    // let radius = 1000;
    // //context.globalCompositeOperation='difference';

    // context.globalCompositeOperation='saturation';
    // context.fillStyle = "hsl(0, 100%, 1%)";
    // // let gradient2 = context.createRadialGradient(pos.x, pos.x, radius,
    // //   pos.x, pos.y, 0);
    // // context.globalAlpha = 1;
    // // gradient2.addColorStop(0.5, "transparent");
    // // gradient2.addColorStop(0.25, "white");
    // // context.fillStyle = gradient2;
    // context.fillRect(pos.x - radius, pos.y - radius,
    //   radius * 2, radius * 2);

    context.restore();
  }
  
  sortByPerspective(obj) {
    return obj.perspectivePosition.y;
  }

  debugBoxes(context, objects) {
    for (const objSets of objects) {
      if (!objSets) continue;
      for (const object of objSets) {
        if (object.particles) continue;

        context.fillStyle = "black";
        context.beginPath();
        context.arc(object.position.x, object.position.y, 2, 0, 2 * Math.PI);
        context.closePath();
        context.fill();

        // context.fillStyle = "purple";
        // context.beginPath();
        // context.arc(object.perspectivePosition.x, object.perspectivePosition.y, 5, 0, 2 * Math.PI);
        // context.closePath();
        // context.fill();

        let perspectivePosition = object.perspectivePosition;
        if (perspectivePosition) {
          context.strokeStyle = "purple";
          context.strokeRect(perspectivePosition.x, perspectivePosition.y,
            object.width, object.height);
        }

        let box = object.boundingBox;
        if (box) {
          context.strokeStyle = "yellow";
          context.strokeRect(box.ul.x, box.ul.y, box.width, box.height);
        }
          
        if (object.lastCollisionBounds) {
          for (const bounds of object.lastCollisionBounds) {
            if (!bounds.box) continue; // TODO: render ray bounds
            context.strokeStyle = "lawnGreen";
            context.strokeRect(bounds.ul.x, bounds.ul.y - bounds.ul.z,
              bounds.width, bounds.height);
          }
        }

        if (object.collisionBounds) {
          for (const bounds of object.collisionBounds) {
            if (!bounds.box) continue; // TODO: render ray bounds
            context.strokeStyle = "crimson";
            context.strokeRect(bounds.ul.x, bounds.ul.y - bounds.ul.z,
              bounds.width, bounds.height);
          }
        }
        // for (let i = 0; i < object.collisionBounds.length; i++) {
        //   context.strokeStyle = "blue";
        //   let bounds = object.lastCollisionBounds[i].plus(object.collisionBounds[i]);
        //   context.strokeRect(bounds.ul.x, bounds.ul.y - bounds.ul.z,
        //     bounds.width, bounds.height);
        // }
        // for (const terrainBox of object.terrainBoundingBox) {
        //   context.strokeStyle = "lawnGreen";
        //   context.strokeRect(terrainBox.ul.x, terrainBox.ul.y, terrainBox.width, terrainBox.height);
        // }
        // for (const hitbox of object.hitbox) {
        //   context.strokeStyle = "crimson";
        //   context.strokeRect(hitbox.ul.x, hitbox.ul.y, hitbox.width, hitbox.height);
        // }
        // for (const losBox of object.losBoundingBox) {
        //   context.strokeStyle = "aqua";
        //   context.strokeRect(losBox.ul.x, losBox.ul.y, losBox.width, losBox.height);
        // }
      }
    }
  }


  isWithinAngle(end, start, coneVector, angle) {
    let testVector = end.minus(start).normalize();
    let dot = coneVector.dot(testVector);
    return dot > angle;
  }
  
  getRay(rays, fov, coneVector, end) {
    let distance = fov.center.distanceTo(end);
    if (distance > fov.range) {
      end = fov.center.plus(end.minus(fov.center).normalize().times(fov.range));
    }
    let line = [fov.center, end];

    // https://stackoverflow.com/questions/35056361/how-to-calculate-degree-between-two-line-with-integer-values-not-vectors
    // let dx1 = fov.target.x - fov.center.x;
    // let dx2 = end.x - fov.center.x;
    // let dy1 = fov.target.y - fov.center.y;
    // let dy2 = end.y - fov.center.y;
    // let len1  = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    // let len2  = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    // let angle = Math.acos((dx1 * dx2 + dy1 * dy2) / (len1 * len2));

    // https://stackoverflow.com/questions/3612814/angle-between-two-line-start-at-the-same-point
    // let angle1 = Math.atan2(coneVector.y, coneVector.x);
    // let angle2 = Math.atan2(vector.y, vector.x);
    // let angle = (angle2 - angle1) * 360 / (Math.PI * 2);
    // if (angle < 0) {
    //   angle += 360;
    // }

    // https://stackoverflow.com/questions/14066933/direct-way-of-computing-clockwise-angle-between-2-vectors/16544330#16544330
    let vector = end.minus(fov.center).normalize();
    let angle = Math.atan2(coneVector.det(vector), coneVector.dot(vector));

    let ray = {
      line: line,
      distance: distance,
      angle: angle
    };

    return ray;
  }

  addWallFromPoints(rays, walls, fov, fovAngle, maxAngle, coneVector, points) {
    let extendedPoints = points.slice();
    // extendedPoints[0] = fov.center.plus(points[0].minus(fov.center).normalize().times(fov.range));
    // extendedPoints[points.length - 1] = fov.center.plus(points[points.length - 1].minus(fov.center).normalize().times(fov.range));


    for (let i = 0; i < points.length - 1; i++) {
      let wallRays = [];
      let ray1 = this.getRay(rays, fov, coneVector, points[i]);
      // Don't bother adding walls or rays that are behind field of view
      if (ray1.angle > maxAngle || ray1.angle < -maxAngle) {
        return;
      } else if (ray1.angle > -fovAngle && ray1.angle < fovAngle) {
        rays.push(ray1);
      }

      let ray2 = this.getRay(rays, fov, coneVector, points[i + 1]);
      // Don't bother adding walls or rays that are behind field of view
      if (ray2.angle > maxAngle || ray2.angle < -maxAngle) {
        return;
      } else if (ray2.angle > -fovAngle && ray2.angle < fovAngle) {
        rays.push(ray2);
      }

      wallRays.push(ray1, ray2);

      walls.push({
        rays: wallRays,
        line: [points[i], points[i + 1]],
        startAngle: ray1.angle,
        endAngle: ray2.angle
      });
    }

    let leftEndpoint = this.getRotatedRayEndpoint(fov.center, points[0], -0.1, fov.range);
    let rightEndpoint = this.getRotatedRayEndpoint(fov.center, points[points.length - 1], 0.1, fov.range);
    rays.push(this.getRay(rays, fov, coneVector, leftEndpoint));
    rays.push(this.getRay(rays, fov, coneVector, rightEndpoint));
  }

  getRotatedRayEndpoint(start, end, rotation, range) {
    let angle = Math.cos(rotation * DEG_TO_RAD);
    let sinAngle = Math.sin(rotation * DEG_TO_RAD);

    return start.plus(new Vec3({
      x: (end.x - start.x) * angle - (end.y - start.y) * sinAngle,
      y: (end.x - start.x) * sinAngle + (end.y - start.y) * angle
    }).normalize().times(range));
  }

  getRays(objects, fov) {
    let rays = [];
    let walls = [];
    let coneVector = new Vec3(fov.target).minus(fov.center).normalize();
    let fovAngle = (fov.angle / 2) * DEG_TO_RAD;
    let maxAngle = 90 * DEG_TO_RAD;

    // https://stackoverflow.com/questions/4780119/2d-euclidean-vector-rotations
    let leftEnd = this.getRotatedRayEndpoint(fov.center, fov.target, -(fov.angle / 2), fov.range);
    let rightEnd = this.getRotatedRayEndpoint(fov.center, fov.target, fov.angle / 2, fov.range);
    rays.push(this.getRay(rays, fov, coneVector, leftEnd));
    rays.push(this.getRay(rays, fov, coneVector, rightEnd));

    for (let angle = -fov.angle + 5; angle <= fov.angle - 5; angle += 5) {
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
    // if (left.angle > right.angle) {
    //   start = right;
    //   end = left;
    // }
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

    for (const ray of sortedRays) {
      let newEndpoints = [];
      for (const wall of rays.walls) {
        //if (ray.angle > wall.startAngle && ray.angle < wall.endAngle) {
          //if (wall.rays[0].distance < ray.distance || wall.rays[1].distance < ray.distance) {
        if (!wall.rays.includes(ray)) {
          let intersection = getLineIntersection(ray.line, wall.line);
          if (intersection) {
            newEndpoints.push(intersection);
          }
        }
          //}
        //}
      }

      if (newEndpoints.length > 0) {
        let newEndpoint = _.minBy(newEndpoints, (point) => {
          return point.relativeDistanceTo(ray.line[0]);
        });
        ray.line[1] = newEndpoint.copy();
      }
    }
  }

  // https://www.redblobgames.com/articles/visibility/
  getFovBounds(objects, fov) {
    let rays = this.getRays(objects, fov);
    this.refineRays(rays, fov);

    let bounds = [];
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

  isInView(object, fovBounds, losHiddenObjs) {
    // TODO: test if object is owned by player instead of if is player
    if (object.losHidden) {
      let objBounds = object.modelBounds;
      if (fovBounds.some((bounds) => bounds.intersects(objBounds))) {
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

  getRenderObjects(objects, center, fovBounds) {
    let renderObjects = [];
    let groundObjects = [];
    let losHiddenObjects = [];
    let losBounds = [];

    for (const object of objects) {
      for (const renderObj of object.renderObjects) {
        // TODO: create new grid for rendering
        if (!renderObj.hidden && (!fovBounds || this.isInView(renderObj, fovBounds, losHiddenObjects))) {
          let pos = Math.round(renderObj.perspectivePosition.y);

          if (pos > 0) {
            if (!renderObjects[pos]) {
              renderObjects[pos] = [];
            }
            renderObjects[pos].push(renderObj);
          } else {
            groundObjects.push(renderObj);
          }
        }
      }

      //if (object.physics.surfaceType !== SURFACE_TYPE.CHARACTER || object.isThisPlayer) {
      // } else {
      //   characters.push(object);
      // }
    }
    
    //renderObjects = renderObjects.concat(this.getCharactersInFov(characters, center));

    //return _.sortBy(renderObjects, this.sortByY, this.sortByZ);
    //return _.sortBy(renderObjects, this.sortByPerspective);
    return { groundObjects: groundObjects, renderObjects: renderObjects, losHiddenObjects: losHiddenObjects };
  }
}
