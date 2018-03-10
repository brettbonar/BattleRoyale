import { registerController, GameController } from "../Engine/GameController.js"
import Game from "../Engine/Game.js"
import BattleRoyale from "../BattleRoyale/BattleRoyale.js"
import BreakoutUI from "../Breakout/BreakoutUI.js"
import Map from "/libs/Map.js"

export default class BattleRoyaleController extends GameController {
  constructor(element, params) {
    super(element, params, {
      menus: new BreakoutUI()
    });

    $.get("game/maps", (data) => {
      let maps = {};
      _.each(data, (map, level) => {
        maps[level] = new Map(Object.assign({
          gameCanvas: document.getElementById("canvas-main")
        }, map));
      });
      this.game = new BattleRoyale({
        canvas: document.getElementById("canvas-main"),
        maps: maps,
        gameSettings: {
          viewDistance: 32 * 12
        }
      });
      this.start();
    });
  }
}

registerController("BattleRoyaleController", BattleRoyaleController);
