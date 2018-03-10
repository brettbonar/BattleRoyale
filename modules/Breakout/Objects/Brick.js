import GameObject from "../../Engine/GameObject/GameObject.mjs"
import ImageRenderer from "../../Engine/Rendering/Renderers/ImageRenderer.mjs"
import BrickRenderer from "./BrickRenderer.mjs"
import { SURFACE_TYPE, MOVEMENT_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"
import RectangleRenderer from "../../Engine/Rendering/Renderers/RectangleRenderer.mjs";

let images = {
  lawnGreen: new Image(),
  aqua: new Image(),
  orange: new Image(),
  yellow: new Image()
};
images.lawnGreen.src = "../../Assets/green-brick.png";
images.aqua.src = "../../Assets/blue-brick.png";
images.orange.src = "../../Assets/orange-brick.png";
images.yellow.src = "../../Assets/yellow-brick.png";

let imageShadows = {
  lawnGreen: new Image(),
  aqua: new Image(),
  orange: new Image(),
  yellow: new Image()
};
imageShadows.lawnGreen.src = "../../Assets/lawnGreen-shadow.png";
imageShadows.aqua.src = "../../Assets/aqua-shadow.png";
imageShadows.orange.src = "../../Assets/orange-shadow.png";
imageShadows.yellow.src = "../../Assets/yellow-shadow.png";

export default class Brick extends GameObject {
  constructor(params) {
    super(Object.assign({}, params, {
      dimensions: { 
        width: params.gameSettings.brickWidth,
        height: params.gameSettings.brickHeight
      },
      renderer: new BrickRenderer({
        strokeStyle: params.color,
        fillStyle: params.color,
        lineWidth: params.gameSettings.brickLineWidth,
        imageShadow: imageShadows[params.color]
      }),
      // renderer: new RectangleRenderer({
      //   strokeStyle: params.color,
      //   fillStyle: params.color,
      //   lineWidth: params.gameSettings.brickLineWidth
      //   // shadowColor: params.color,
      //   // shadowBlur: params.gameSettings.brickShadowBlur,
      // }),
      position: params.position || {
        x: params.gameSettings.playArea.top.x + params.column * 
          (params.gameSettings.brickWidth + params.gameSettings.brickLineWidth * 2) + params.gameSettings.brickLineWidth,
        y: params.gameSettings.playArea.top.y + params.gameSettings.buffer + params.row * 
          (params.gameSettings.brickHeight + params.gameSettings.brickLineWidth * 2) + params.gameSettings.brickLineWidth
      }
    }));
    this.physics.movementType = MOVEMENT_TYPE.STATIC;

    if (!params.demo) {
      this.pieces = [];
      this.breakDuration = 500;
    }
  }
}
