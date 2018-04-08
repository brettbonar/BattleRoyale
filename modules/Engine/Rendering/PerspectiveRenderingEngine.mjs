import RenderingEngine from "./RenderingEngine.mjs"
import { SURFACE_TYPE } from "../Physics/PhysicsConstants.mjs"
import Bounds from "../GameObject/Bounds.mjs"
import Vec3 from "../GameObject/Vec3.mjs"
import Dimensions from "../GameObject/Dimensions.mjs"
import { getLineIntersection } from "../util.mjs"
import ImageCache from "./ImageCache.mjs"

export default class PerspectiveRenderingEngine extends RenderingEngine{
  constructor(params) {
    super(params);

    this.fovImage = ImageCache.get("/Assets/fov.png");
  }

  renderFOV(center, fov, fovBounds) {
    if (!this.fovImage.complete) return;
    
    this.context.save();

    let dimensions = {
      width: 2000,
      height: 2000
    };
    let position = center.minus({
      x: dimensions.width / 2,
      y: dimensions.height / 2
    });

    this.context.beginPath();
    //this.context.arc(center.x, center.y, fov.range, 0, 2 * Math.PI);

    for (const triangle of fovBounds) {
      this.context.moveTo(triangle.points[0].x, triangle.points[0].y);
      this.context.lineTo(triangle.points[1].x, triangle.points[1].y);
      this.context.lineTo(triangle.points[2].x, triangle.points[2].y);
      this.context.lineTo(triangle.points[0].x, triangle.points[0].y);
    }
      this.context.clip();

    this.context.drawImage(this.fovImage, position.x, position.y, dimensions.width, dimensions.height);

    // if (clipping) {
    //   position = clipping.offset.plus(position);
    //   let imageDimensions = clipping.dimensions || dimensions;
    //   this.context.drawImage(this.image, clipping.offset.x, clipping.offset.y, clipping.dimensions.width, clipping.dimensions.height,
    //     position.x, position.y, imageDimensions.width, imageDimensions.height);
    // } else {
    //   this.context.drawImage(this.image, position.x, position.y, dimensions.width, dimensions.height);
    // }

    this.context.restore();
  }

  renderFaded(object, elapsedTime) {
    if (object.fadeDimensions) {
      this.context.globalAlpha = 0.3;
      //object.render(this.context, elapsedTime);
      object.render(this.context, elapsedTime, object.fadeDimensions);
      let offset = object.fadeDimensions.offset || new Vec3();
      let dimensions = object.fadeDimensions.dimensions || new Dimensions();

      this.context.globalAlpha = 1;
      object.render(this.context, 0, {
        offset: offset.plus({ y: dimensions.height }),
        dimensions: {
          width: object.dimensions.width,
          height: object.dimensions.height - dimensions.height
        }
      });
    } else {
      this.context.globalAlpha = 0.3;
      object.render(this.context, elapsedTime);
    }
  }

  isAnyObjectHidden(losHiddenObjects, fadeObject) {
    return losHiddenObjects.some((obj) => obj.modelBounds.intersects(fadeObject.modelBounds));
  }

  renderObject(object, elapsedTime, losHiddenObjects, clipping) {
    this.context.save();
    if (object.losFade && this.isAnyObjectHidden(losHiddenObjects, object)) {
      this.renderFaded(object, elapsedTime, clipping);
    } else {
      object.render(this.context, elapsedTime, clipping);
    }
    this.context.restore();
  }

  sortClips(clip) {
    return clip.object.position.z + clip.object.dimensions.zheight;
  }

  // Render highest to lowest y
  render(objects, elapsedTime, center, grid, fov) {
    objects = grid.getRenderObjects(new Bounds({
      position: center.minus({
        x: this.context.canvas.width / 2,
        y: this.context.canvas.height / 2
      }),
      dimensions: {
        width: this.context.canvas.width,
        height: this.context.canvas.height
      }
    }));

    //window.debug = true;
    this.context.save();

    let fovBounds;
    if (fov) {
      fovBounds = this.getFovBounds(objects, fov);
    }

    if (window.debug) {
      this.debugRays(fovBounds);
    }

    // if (center) {
    //   this.context.translate(-(center.x - this.context.canvas.width / 2), -(center.y - this.context.canvas.height / 2));
    // }

    let objsToRender = this.getRenderObjects(objects, center, fovBounds);
    let renderObjects = objsToRender.renderObjects;

    for (const groundObject of objsToRender.groundObjects) {
      this.renderObject(groundObject, elapsedTime);
    }

    if (fov) {
      this.renderFOV(center, fov, fovBounds);
    }

    let clips = [];
    //for (const object of renderObjects) {
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
            this.renderObject(clip.object, elapsedTime, objsToRender.losHiddenObjects, clipping);

            clip.previousClip += height;
            if (clip.previousClip >= clip.object.height) {
              _.pull(clips, clip);
            }
          }
        }

        this.renderObject(object, elapsedTime, objsToRender.losHiddenObjects);
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
      this.renderObject(clip.object, elapsedTime, center, clipping);
    }
    
    if (window.debug) {
      this.debugBoxes(renderObjects);
    }

    
    // let pos = {
    //   x: 600,
    //   y: 600
    // };
    // let radius = 1000;
    // //this.context.globalCompositeOperation='difference';

    // this.context.globalCompositeOperation='saturation';
    // this.context.fillStyle = "hsl(0, 100%, 1%)";
    // // let gradient2 = this.context.createRadialGradient(pos.x, pos.x, radius,
    // //   pos.x, pos.y, 0);
    // // this.context.globalAlpha = 1;
    // // gradient2.addColorStop(0.5, "transparent");
    // // gradient2.addColorStop(0.25, "white");
    // // this.context.fillStyle = gradient2;
    // this.context.fillRect(pos.x - radius, pos.y - radius,
    //   radius * 2, radius * 2);

    this.context.restore();
  }
  
  sortByPerspective(obj) {
    return obj.perspectivePosition.y;
  }

  debugBoxes(objects) {
    for (const objSets of objects) {
      if (!objSets) continue;
      for (const object of objSets) {
        if (object.particles) continue;

        this.context.fillStyle = "black";
        this.context.beginPath();
        this.context.arc(object.position.x, object.position.y, 2, 0, 2 * Math.PI);
        this.context.closePath();
        this.context.fill();

        // this.context.fillStyle = "purple";
        // this.context.beginPath();
        // this.context.arc(object.perspectivePosition.x, object.perspectivePosition.y, 5, 0, 2 * Math.PI);
        // this.context.closePath();
        // this.context.fill();

        let perspectivePosition = object.perspectivePosition;
        if (perspectivePosition) {
          this.context.strokeStyle = "purple";
          this.context.strokeRect(perspectivePosition.x, perspectivePosition.y,
            object.width, object.height);
        }

        let box = object.boundingBox;
        if (box) {
          this.context.strokeStyle = "yellow";
          this.context.strokeRect(box.ul.x, box.ul.y, box.width, box.height);
        }
          
        if (object.lastCollisionBounds) {
          for (const bounds of object.lastCollisionBounds) {
            if (!bounds.box) continue; // TODO: render ray bounds
            this.context.strokeStyle = "lawnGreen";
            this.context.strokeRect(bounds.ul.x, bounds.ul.y - bounds.ul.z,
              bounds.width, bounds.height);
          }
        }

        if (object.collisionBounds) {
          for (const bounds of object.collisionBounds) {
            if (!bounds.box) continue; // TODO: render ray bounds
            this.context.strokeStyle = "crimson";
            this.context.strokeRect(bounds.ul.x, bounds.ul.y - bounds.ul.z,
              bounds.width, bounds.height);
          }
        }
        // for (let i = 0; i < object.collisionBounds.length; i++) {
        //   this.context.strokeStyle = "blue";
        //   let bounds = object.lastCollisionBounds[i].plus(object.collisionBounds[i]);
        //   this.context.strokeRect(bounds.ul.x, bounds.ul.y - bounds.ul.z,
        //     bounds.width, bounds.height);
        // }
        // for (const terrainBox of object.terrainBoundingBox) {
        //   this.context.strokeStyle = "lawnGreen";
        //   this.context.strokeRect(terrainBox.ul.x, terrainBox.ul.y, terrainBox.width, terrainBox.height);
        // }
        // for (const hitbox of object.hitbox) {
        //   this.context.strokeStyle = "crimson";
        //   this.context.strokeRect(hitbox.ul.x, hitbox.ul.y, hitbox.width, hitbox.height);
        // }
        // for (const losBox of object.losBoundingBox) {
        //   this.context.strokeStyle = "aqua";
        //   this.context.strokeRect(losBox.ul.x, losBox.ul.y, losBox.width, losBox.height);
        // }
      }
    }
  }


  isWithinAngle(end, start, coneVector, angle) {
    let testVector = end.minus(start).normalize();
    let dot = coneVector.dot(testVector);
    return dot > angle;
  }
  
  addRay(rays, fov, coneVector, end) {
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

    rays.push(ray);

    return ray;
  }

  addWallFromPoints(rays, walls, fov, coneVector, points) {
    let extendedPoints = points.slice();
    // extendedPoints[0] = fov.center.plus(points[0].minus(fov.center).normalize().times(fov.range));
    // extendedPoints[points.length - 1] = fov.center.plus(points[points.length - 1].minus(fov.center).normalize().times(fov.range));
    let leftRay = this.getRotatedRayEndpoint(fov.center, points[0], -0.1, fov.range);
    let rightRay = this.getRotatedRayEndpoint(fov.center, points[points.length - 1], 0.1, fov.range);
    this.addRay(rays, fov, coneVector, leftRay);
    this.addRay(rays, fov, coneVector, rightRay);

    for (let i = 0; i < points.length - 1; i++) {
      let wallRays = [];
      let ray1 = this.addRay(rays, fov, coneVector, points[i]);
      let ray2 = this.addRay(rays, fov, coneVector, points[i + 1]);
      wallRays.push(ray1);
      wallRays.push(ray2);

      walls.push({
        rays: wallRays,
        line: [points[i], points[i + 1]],
        startAngle: ray1.angle,
        endAngle: ray2.angle
      });
    }
  }

  addWall(rays, walls, fov, coneVector, end1, end2) {
    let ray1 = this.addRay(rays, fov, coneVector, end1);
    let ray2 = this.addRay(rays, fov, coneVector, end2);
    rays.push(ray1);
    rays.push(ray2);
    walls.push({
      rays: [ray1, ray2],
      line: [end1, end2],
      startAngle: ray1.angle,
      endAngle: ray2.angle
    });
  }

  getRotatedRayEndpoint(start, end, rotation, range) {
    let angle = Math.cos((rotation / 2) * (Math.PI / 180));
    let sinAngle = Math.sin((rotation / 2) * (Math.PI / 180));

    return start.plus(new Vec3({
      x: (end.x - start.x) * angle - (end.y - start.y) * sinAngle,
      y: (end.x - start.x) * sinAngle + (end.y - start.y) * angle
    }).normalize().times(range));

  }

  getRays(objects, fov) {
    let rays = [];
    let walls = [];
    let coneVector = new Vec3(fov.target).minus(fov.center).normalize();

    // https://stackoverflow.com/questions/4780119/2d-euclidean-vector-rotations
    let leftEnd = this.getRotatedRayEndpoint(fov.center, fov.target, -fov.angle, fov.range);
    let rightEnd = this.getRotatedRayEndpoint(fov.center, fov.target, fov.angle, fov.range);
    this.addRay(rays, fov, coneVector, leftEnd);
    this.addRay(rays, fov, coneVector, rightEnd);

    for (let angle = -fov.angle + 5; angle <= fov.angle - 5; angle += 5) {
      let end = this.getRotatedRayEndpoint(fov.center, fov.target, angle, fov.range);
      this.addRay(rays, fov, coneVector, end);
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
          //this.addWall(rays, walls, fov, coneVector, bounds.ll, bounds.lr);
          points.push(bounds.ll, bounds.lr);
          if (fov.center.x >= bounds.right.x) {
            //this.addWall(rays, walls, fov, coneVector, bounds.lr, bounds.ur);
            points.push(bounds.ur);
          } else if (fov.center.x <= bounds.left.x) {
            //this.addWall(rays, walls, fov, coneVector, bounds.ul, bounds.ll);
            points.unshift(bounds.ul);
          }
        } else if (fov.center.y > bounds.top.y) {
          // FOV center is between upper and lower bounds
          if (fov.center.x >= bounds.right.x) {
            //this.addWall(rays, walls, fov, coneVector, bounds.ur, bounds.lr);
            points.push(bounds.lr, bounds.ur);
          } else if (fov.center.x <= bounds.left.x) {
            //this.addWall(rays, walls, fov, coneVector, bounds.ul, bounds.ll);
            points.push(bounds.ul, bounds.ll);
          } else {
            // TODO: handle case where center is inside bounds
          }

        } else {
          // FOV center is above bounds
          points.push(bounds.ur, bounds.ul);
          //this.addWall(rays, walls, fov, coneVector, bounds.ul, bounds.ur);
          if (fov.center.x >= bounds.right.x) {
            points.unshift(bounds.lr);
            //this.addWall(rays, walls, fov, coneVector, bounds.ur, bounds.lr);
          } else if (fov.center.x <= bounds.left.x) {
            points.push(bounds.ll);
            //this.addWall(rays, walls, fov, coneVector, bounds.ul, bounds.ll);
          }
        }

        if (points.length > 0) {
          this.addWallFromPoints(rays, walls, fov, coneVector, points);
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

  debugRays(bounds) {
    this.context.strokeStyle = "yellow";
    this.context.fillStyle = "goldenrod";
    for (const triangle of bounds) {
      this.context.beginPath();
      this.context.moveTo(triangle.points[0].x, triangle.points[0].y);
      this.context.lineTo(triangle.points[1].x, triangle.points[1].y);
      this.context.lineTo(triangle.points[2].x, triangle.points[2].y);
      this.context.lineTo(triangle.points[0].x, triangle.points[0].y);
      this.context.fill();
      this.context.stroke();
    }

    // this.context.strokeStyle = "yellow";
    // for (const triangle of bounds) {
    //   this.context.beginPath();
    //   this.context.moveTo(triangle.points[0].x, triangle.points[0].y);
    //   this.context.lineTo(triangle.points[1].x, triangle.points[1].y);
    //   this.context.moveTo(triangle.points[0].x, triangle.points[0].y);
    //   this.context.lineTo(triangle.points[2].x, triangle.points[2].y);
    //   this.context.stroke();
    // }
    // this.context.strokeStyle = "green";
    // for (const wall of rays.walls) {
    //   this.context.beginPath();
    //   this.context.moveTo(wall.line[0].x, wall.line[0].y);
    //   this.context.lineTo(wall.line[1].x, wall.line[1].y);
    //   this.context.stroke();
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
