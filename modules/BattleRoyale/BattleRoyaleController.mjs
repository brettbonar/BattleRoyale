import { registerController, GameController } from "../Engine/GameController.mjs"
import Game from "../Engine/Game.mjs"
import BattleRoyale from "../BattleRoyale/BattleRoyale.mjs"
import BreakoutUI from "../Breakout/BreakoutUI.mjs"
import Map from "/modules/Map.mjs"

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

      $.get("game/objects", (data) => {
        this.game.updateObjects(data);
        this.start();
      });
    });
  }
}

registerController("BattleRoyaleController", BattleRoyaleController);
