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

  renderFaded(context, object, elapsedTime, clipping, player) {
    context.globalAlpha = 0.3;
    object.render(context, elapsedTime, clipping, player);
  }

  isAnyObjectHidden(losHiddenObjects, fadeObject) {
    return losHiddenObjects.some((obj) => {
      return obj.perspectivePosition.y < fadeObject.perspectivePosition.y && 
        obj.modelBounds.intersects2D(fadeObject.modelBounds);
    });
  }

  renderObject(context, object, elapsedTime, player, losHiddenObjects, clipping) {
    context.save();
    if (object.losFade && this.isAnyObjectHidden(losHiddenObjects, object)) {
      this.renderFaded(context, object, elapsedTime, clipping, player);
    } else {
      object.render(context, elapsedTime, clipping, player);
    }
    context.restore();
  }

  sortClips(clip) {
    return clip.object.position.z + clip.object.dimensions.zheight;
  }

  renderClips(context, y, clips, elapsedTime, player, objsToRender) {
    // TODO: ignore small things like particles when clipping
    for (const clip of clips) {
      let height = 0;
      if (y >= clip.bottom) {
        height = clip.object.height - clip.previousClip;
      } else {
        height = Math.round(Math.min(clip.object.height - clip.previousClip,
          (y - clip.top - clip.previousClip)));
      }

      if (height > 0) {
        let clipping = {
          offset: {
            x: 0,
            y: clip.previousClip
          },
          dimensions: new Dimensions({
            width: clip.object.width,
            height: height + 1 // TRICKY: add 1 to prevent one off rendering artifacts
          })
        };
        // TODO: reset elapsed time after first render?
        this.renderObject(context, clip.object, elapsedTime, player, objsToRender.losHiddenObjects, clipping);

        clip.previousClip += height;
        if (clip.previousClip >= clip.object.height) {
          clip.done = true;
        }
      }
    }
    _.remove(clips, "done");
  }

  // Render highest to lowest y
  render(context, objects, elapsedTime, player, fov) {
    //window.debug = true;
    context.save();

    if (window.debug) {
      //fov.debugRays(context);
    }

    let objsToRender = this.getRenderObjects(objects, player, fov);
    let renderObjects = objsToRender.renderObjects;

    // TODO: remember why these were separated out
    for (const groundObject of objsToRender.groundObjects) {
      this.renderObject(context, groundObject, elapsedTime, player, objsToRender.losHiddenObjects);
    }

    if (fov) {
      fov.render(context, player);
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
            bottom: y + object.dimensions.height - object.dimensions.zheight,
            top: y,
            previousClip: 0
          });
          clips = _.sortBy(clips, this.sortClips);
          continue;
        }

        if (clips.some((clip) => clip.object.modelBounds.intersects2D(object.modelBounds))) {
          this.renderClips(context, y, clips, elapsedTime, player, objsToRender);
        }
        this.renderObject(context, object, elapsedTime, player, objsToRender.losHiddenObjects);
      }
    }

    this.renderClips(context, Number.MAX_SAFE_INTEGER, clips, elapsedTime, player, objsToRender);
    
    if (window.debug) {
      this.debugBoxes(context, objects);
    }

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

    // let box = object.modelBounds;
    // if (box) {
    //   context.strokeStyle = "yellow";
    //   context.strokeRect(box.ul.x, box.ul.y, box.width, box.height);
    // }
      
    if (object.lastCollisionBounds) {
      for (const bounds of object.lastCollisionBounds) {
        if (!bounds.box) continue; // TODO: render ray bounds
        context.strokeStyle = "orange";
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

  getRenderObjects(objects, player, fov) {
    let renderObjects = [];
    let groundObjects = [];
    let losHiddenObjects = [];
    let losBounds = [];

    for (const object of objects) {
      for (const renderObj of object.renderObjects) {
        // TODO: create new grid for rendering
        if (!renderObj.hidden && (!fov || fov.isInView(renderObj, losHiddenObjects, player))) {
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
    
    //renderObjects = renderObjects.concat(this.getCharactersInFov(characters, player));

    //return _.sortBy(renderObjects, this.sortByY, this.sortByZ);
    //return _.sortBy(renderObjects, this.sortByPerspective);
    return { groundObjects: groundObjects, renderObjects: renderObjects, losHiddenObjects: losHiddenObjects };
  }
}
