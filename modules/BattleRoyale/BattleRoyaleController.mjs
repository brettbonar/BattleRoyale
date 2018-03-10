import { registerController, GameController } from "../Engine/GameController.mjs"
import Game from "../Engine/Game.mjs"
import BattleRoyale from "../BattleRoyale/BattleRoyale.mjs"
import BattleRoyaleUI from "../BattleRoyale/BattleRoyaleUI.mjs"
import Map from "/modules/Map.mjs"

export default class BattleRoyaleController extends GameController {
  constructor(element, params) {
    super(element, params, {
      menus: new BattleRoyaleUI()
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
      });
    });
  }

  getHighScores() {
    // Get top 5
    return this.highScores;
  }

  newGame() {
    // this.game = new Breakout({
    //   canvas: document.getElementById("canvas-main"),
    //   menus: this.menus,
    //   rows: 8,
    //   columns: 14
    // });
    this.game.onStateChange(Game.STATE.DONE, (game) => this.saveScore(game));
    this.game.onStateChange(Game.STATE.GAME_OVER, (game) => this.saveScore(game));

    this.menus.hideAll();
    this.start();
  }
  
  returnToMain() {
  }
}

registerController("BattleRoyaleController", BattleRoyaleController);
