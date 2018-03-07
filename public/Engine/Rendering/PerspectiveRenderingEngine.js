import RenderingEngine from "./RenderingEngine.js"
import { SURFACE_TYPE } from "../Physics/PhysicsConstants.js";
import Bounds from "../GameObject/Bounds.js";

export default class PerspectiveRenderingEngine extends RenderingEngine{
  constructor(params) {
    super(params);
  }

  // Render highest to lowest y
  render(objects, elapsedTime, center) {
    this.context.save();
    if (center) {
      this.context.translate(-(center.x - this.context.canvas.width / 2), -(center.y - this.context.canvas.height / 2));
    }

    let renderObjects = this.getRenderObjects(objects, center);
    for (const object of renderObjects) {
      this.context.save();
      if (object.losObstacle && object.losFade && object.boundingBox.box.ul.y > center.y - 10) {
        this.context.globalAlpha = 0.5;
      }
      object.render(this.context, elapsedTime, center);
      this.context.restore();
    }

    this.context.restore();
  }
  
  sortByPosition(obj) {
    return obj.perspectivePosition.y;
  }

  getRenderObjects(objects, center) {
    let renderObjects = [];
    for (const object of objects) {
      if (object.physics.surfaceType !== SURFACE_TYPE.CHARACTER || object.isPlayer) {
        renderObjects = renderObjects.concat(object.getAllRenderObjects());
      }
    }
    
    renderObjects = renderObjects.concat(this.getCharactersInFov(objects, center));

    return _.sortBy(renderObjects, this.sortByPosition);
  }

  getCharactersInFov(objects, center) {
    let characters = [];
    let centerBox = new Bounds({
      position: {
        x: center.x,
        y: center.y
      },
      dimensions: {
        width: 32,
        height: 32
      }
    });
    for (const obj of objects) {
      if (obj.physics.surfaceType === SURFACE_TYPE.CHARACTER && !obj.isPlayer) {
        let lines = [];

        this.context.strokeStyle = "magenta";
        _.each(obj.boundingBox.box, (point) => {
          _.each(centerBox.box, (centerPoint) => {
            lines.push([point, centerPoint]);
            // DEBUG
            // this.context.beginPath();
            // this.context.moveTo(point.x, point.y);
            // this.context.lineTo(centerPoint.x, centerPoint.y);
            // this.context.stroke();
          });
        });

        let losObjs = _.filter(objects, "losObstacle");
        if (lines.some((line) => {
          for (const losObj of losObjs) {
            if (losObj.getAllBounds().some((bounds) => bounds.intersects(line))) {
              return false;
            }
          }
          return true;
        })) {
          characters.push(obj);
        }
      }
    }

    return characters;
  }
}
