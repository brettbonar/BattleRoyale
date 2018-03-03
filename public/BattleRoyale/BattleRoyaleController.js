import { registerController, GameController } from "../Engine/GameController.js"
import Game from "../Engine/Game.js"
import Map from "./Map.js"
import BattleRoyale from "../BattleRoyale/BattleRoyale.js"
import BreakoutUI from "../Breakout/BreakoutUI.js"

export default class BattleRoyaleController extends GameController {
  constructor(element, params) {
    super(element, params, {
      game: new BattleRoyale({
        canvas: document.getElementById("canvas-main"),
        map: new Map(),
        gameSettings: {
          cellSize: 32,
          viewDistance: 32 * 12
        }
      }),
      menus: new BreakoutUI()
    });
    this.start();
  }

}

registerController("BattleRoyaleController", BattleRoyaleController);
