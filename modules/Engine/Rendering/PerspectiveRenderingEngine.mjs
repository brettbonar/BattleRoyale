import RenderingEngine from "./RenderingEngine.mjs"
import { SURFACE_TYPE } from "../Physics/PhysicsConstants.mjs";
import Bounds from "../GameObject/Bounds.mjs";

export default class PerspectiveRenderingEngine extends RenderingEngine{
  constructor(params) {
    super(params);
  }

  // Render highest to lowest y
  render(objects, elapsedTime, center) {
    //window.debug = true;
    this.context.save();
    // if (center) {
    //   this.context.translate(-(center.x - this.context.canvas.width / 2), -(center.y - this.context.canvas.height / 2));
    // }

    let renderObjects = this.getRenderObjects(objects, center);
    for (const object of renderObjects) {
      this.context.save();
      if (object.losFade && object.losBounds.some((box) => box.ul.y > center.y - 20)) {
        this.context.globalAlpha = 0.5;
      }
      object.render(this.context, elapsedTime, center);
      this.context.restore();
    }
    
    this.debugBoxes(objects);

    this.context.restore();
  }
  
  sortByZ(obj) {
    return obj.perspectivePosition.z + (obj.renderHeight || 0);
  }
  sortByY(obj) {
    return obj.perspectivePosition.y;
  }
  sortByLos(obj) {
    let pos = obj.perspectivePosition;
    return pos.y + pos.z * 32;
  }

  debugBoxes(objects) {
    if (window.debug) {
      for (const object of objects) {
        let box = object.boundingBox;
        this.context.strokeStyle = "magenta";
        this.context.strokeRect(box.ul.x, box.ul.y, box.width, box.height);
          
        for (const bounds of object.collisionBounds) {
          this.context.strokeStyle = "crimson";
          this.context.strokeRect(bounds.ul.x, bounds.ul.y - bounds.ul.z * 32,
            bounds.width, bounds.height);
        }
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

  getRenderObjects(objects, center) {
    let renderObjects = [];
    for (const object of objects) {
      if (object.physics.surfaceType !== SURFACE_TYPE.CHARACTER || object.isThisPlayer) {
        renderObjects = renderObjects.concat(object.getAllRenderObjects());
      }
    }
    
    renderObjects = renderObjects.concat(this.getCharactersInFov(objects, center));

    //return _.sortBy(renderObjects, this.sortByY, this.sortByZ);
    return _.sortBy(renderObjects, this.sortByLos);
  }

  getCharactersInFov(objects, center) {
    let characters = [];
    let centerBox = new Bounds({
      position: center,
      dimensions: {
        width: 32,
        height: 32
      }
    });
    let losBounds = _.reduce(objects, (bounds, obj) => bounds.concat(obj.losBounds), []);
    for (const obj of objects) {
      if (obj.physics.surfaceType === SURFACE_TYPE.CHARACTER && !obj.isThisPlayer) {
        let lines = [];

        this.context.strokeStyle = "magenta";
        _.each(obj.boundingBox.box, (point) => {
          _.each(centerBox.box, (centerPoint) => {
            lines.push([point, centerPoint]);

            if (window.debug) {
              // DEBUG
              this.context.beginPath();
              this.context.moveTo(point.x, point.y);
              this.context.lineTo(centerPoint.x, centerPoint.y);
              this.context.stroke();
            }
          });
        });

        // If not every los line is intersected (i.e. blocked) by a los bounding box then
        // the character is in view
        if (!lines.every((line) => losBounds.some((bounds) => bounds.intersects(line)))) {
          characters.push(obj);
        }
      }
    }

    return characters;
  }
}
