import RenderingEngine from "./RenderingEngine.mjs"
import { SURFACE_TYPE } from "../Physics/PhysicsConstants.mjs";
import Bounds from "../GameObject/Bounds.mjs";

export default class PerspectiveRenderingEngine extends RenderingEngine{
  constructor(params) {
    super(params);
  }

  renderFaded(object, elapsedTime) {
    let fadeBounds = object.fadeBounds;
    if (fadeBounds) {
      this.context.globalAlpha = 0.5;
      object.render(this.context, elapsedTime);

      // TODO: figure out why the following doesn't work
      // Render faded region
      // this.context.save();
      // this.context.rect(fadeBounds.ul.x, fadeBounds.ul.y, fadeBounds.width, fadeBounds.height);
      // this.context.clip();
      // this.context.globalAlpha = 0.5;
      // object.render(this.context, elapsedTime);
      // this.context.restore();

      // // Render the rest of the image
      // this.context.save();
      // this.context.rect(fadeBounds.ll.x, fadeBounds.ll.y, object.width, object.height);
      // this.context.clip();
      // object.render(this.context, 0);
      // this.context.restore();
    } else {
      this.context.globalAlpha = 0.5;
      object.render(this.context, elapsedTime);
    }
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
      if (object.losFade && object.fadePosition.y > center.y - 20) {
        this.renderFaded(object, elapsedTime);
      } else {
        object.render(this.context, elapsedTime);
      }
      this.context.restore();
    }
    
    this.debugBoxes(objects);

    
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
    if (window.debug) {
      for (const object of objects) {
        this.context.strokeStyle = "blue";
        this.context.beginPath();
        this.context.arc(object.position.x, object.position.y, 2, 0, 2 * Math.PI);
        this.context.closePath();
        this.context.fill();

        let box = object.boundingBox;
        this.context.strokeStyle = "yellow";
        this.context.strokeRect(box.ul.x, box.ul.y, box.width, box.height);
          
        for (const bounds of object.collisionBounds) {
          this.context.strokeStyle = "crimson";
          this.context.strokeRect(bounds.ul.x, bounds.ul.y - bounds.ul.z,
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
    return _.sortBy(renderObjects, this.sortByPerspective);
  }

  getCharactersInFov(objects, center) {
    let characters = [];
    let centerBox = new Bounds({
      position: center.plus({ y: 12, x: -16 }),
      dimensions: {
        width: 32,
        height: 20
      }
    });
    let losBounds = _.reduce(objects, (bounds, obj) => bounds.concat(obj.losBounds), []);
    for (const obj of objects) {
      if (obj.physics.surfaceType === SURFACE_TYPE.CHARACTER && !obj.isThisPlayer) {
        let lines = [];

        this.context.strokeStyle = "magenta";
        // TODO: consider creating losDimensions instead of using collisionDimensions
        for (const bounds of obj.collisionBounds) {
          _.each(bounds.box, (point) => {
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
        }

        let opacities = lines.map((line) => {
          return losBounds.reduce(
            (op, bounds) => bounds.intersects(line) ? op + (bounds.opacity || 0) : op, 0);
        });

        if (_.min(opacities) < 1) {
          characters.push(obj);
        }

        // If not every los line is intersected (i.e. blocked) by a los bounding box then
        // the character is in view
        // if (!lines.every((line) => losBounds.some((bounds) => bounds.intersects(line)))) {
        //   characters.push(obj);
        // }
      }
    }

    return characters;
  }
}
