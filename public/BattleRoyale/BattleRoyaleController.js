import { registerController, GameController } from "../Engine/GameController.js"
import Game from "../Engine/Game.js"
import Map from "./Map.js"
import BreakoutUI from "../Breakout/BreakoutUI.js"

export default class BattleRoyaleController extends GameController {
  constructor(element, params) {
    super(element, params, {
      // game: new BreakoutDemo({ canvas: document.getElementById("canvas-main") }),
      menus: new BreakoutUI()
    });
    //this.start();

    this.map = new Map();

    let canvas = document.getElementById("canvas-main");
    let context = canvas.getContext("2d");

    // FOREST: "forest",
    // DESERT: "desert",
    // DEATH: "death",
    // PLAIN: "plain"
    let size = canvas.width / this.map.mapSize;
    for (const column of this.map.map) {
      for (const cell of column) {
        let color;
        if (cell.type === "forest") {
          color = "green";
        } else if (cell.type === "desert") {
          color = "red";
        } else if (cell.type === "death") {
          color = "black";
        } else if (cell.type === "plain") {
          color = "yellow";
        } else if (cell.type === "water") {
          color = "blue";
        }

        context.fillStyle = color;
        context.fillRect(cell.position.x * size, cell.position.y * size, size, size);
      }
    }
  }

}

registerController("BattleRoyaleController", BattleRoyaleController);
