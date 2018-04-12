import RenderingEngine from "./RenderingEngine.mjs"
import { SURFACE_TYPE } from "../Physics/PhysicsConstants.mjs"
import Bounds from "../GameObject/Bounds.mjs"
import Vec3 from "../GameObject/Vec3.mjs"
import Dimensions from "../GameObject/Dimensions.mjs"
import ImageCache from "./ImageCache.mjs"

export default class PerspectiveRenderingEngine extends RenderingEngine{
  constructor(params) {
    super(params);
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
    return losHiddenObjects.some((obj) => obj.modelBounds.intersects2D(fadeObject.modelBounds));
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

  renderClips(context, y, clips, elapsedTime, objsToRender) {
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
  }

  // Render highest to lowest y
  render(context, objects, elapsedTime, center, fov) {
    //window.debug = true;
    context.save();

    if (window.debug) {
      fov.debugRays(context);
    }

    // if (center) {
    //   context.translate(-(center.x - context.canvas.width / 2), -(center.y - context.canvas.height / 2));
    // }

    let objsToRender = this.getRenderObjects(objects, center, fov);
    let renderObjects = objsToRender.renderObjects;

    for (const groundObject of objsToRender.groundObjects) {
      this.renderObject(context, groundObject, elapsedTime, objsToRender.losHiddenObjects);
    }

    if (fov) {
      fov.render(context, center);
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

        if (clips.some((clip) => clip.object.modelBounds.intersects2D(object.modelBounds))) {
          this.renderClips(context, y, clips, elapsedTime, objsToRender);
        }
        this.renderObject(context, object, elapsedTime, objsToRender.losHiddenObjects);
      }
    }

    this.renderClips(context, Number.MAX_SAFE_INTEGER, clips, elapsedTime, objsToRender);
    // for (const clip of clips) {
    //   let clipping = {
    //     offset: new Vec3({
    //       x: 0,
    //       y: clip.previousClip
    //     }),
    //     dimensions: new Dimensions({
    //       width: clip.object.width,
    //       height: clip.object.height - clip.previousClip
    //     })
    //   };
    //   this.renderObject(context, clip.object, elapsedTime, center, clipping);
    // }
    
    if (window.debug) {
      this.debugBoxes(context, objects);
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

  drawDebugBoxes(context, object) {
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

    // let perspectivePosition = object.perspectivePosition;
    // if (perspectivePosition) {
    //   context.strokeStyle = "purple";
    //   context.strokeRect(perspectivePosition.x, perspectivePosition.y,
    //     object.width, object.height);
    // }

    let box = object.modelBounds;
    if (box) {
      context.strokeStyle = "yellow";
      context.strokeRect(box.ul.x, box.ul.y, box.width, box.height);
    }
      
    // if (object.lastCollisionBounds) {
    //   for (const bounds of object.lastCollisionBounds) {
    //     if (!bounds.box) continue; // TODO: render ray bounds
    //     context.strokeStyle = "lawnGreen";
    //     context.strokeRect(bounds.ul.x, bounds.ul.y - bounds.ul.z,
    //       bounds.width, bounds.height);
    //   }
    // }

    // if (object.collisionBounds) {
    //   for (const bounds of object.collisionBounds) {
    //     if (!bounds.box) continue; // TODO: render ray bounds
    //     context.strokeStyle = "crimson";
    //     context.strokeRect(bounds.ul.x, bounds.ul.y - bounds.ul.z,
    //       bounds.width, bounds.height);
    //   }
    // }
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

  debugBoxes(context, objects) {
    // for (const objSets of objsToRender.renderObjects) {
    //   if (!objSets) continue;
    //   for (const object of objSets) {
    //     if (!object.particles) {
    //       this.drawDebugBoxes(context, object);
    //     }
    //   }
    // }

    // for (const object of objsToRender.groundObjects) {
    //   if (!object.particles) {
    //     this.drawDebugBoxes(context, object);
    //   }
    // }

    for (const object of objects) {
      if (!object.particles) {
        this.drawDebugBoxes(context, object);
      }
    }
  }

  getRenderObjects(objects, center, fov) {
    let renderObjects = [];
    let groundObjects = [];
    let losHiddenObjects = [];
    let losBounds = [];

    for (const object of objects) {
      for (const renderObj of object.renderObjects) {
        // TODO: create new grid for rendering
        if (!renderObj.hidden && (!fov || fov.isInView(renderObj, losHiddenObjects))) {
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
