import { registerController, GameController } from "../Engine/GameController.mjs"
import Game from "../Engine/Game.mjs"
import BattleRoyale from "../BattleRoyale/BattleRoyale.mjs"
import BattleRoyaleUI from "../BattleRoyale/BattleRoyaleUI.mjs"
import Map from "/modules/Map.mjs"
import * as API from "./API.mjs"

export default class BattleRoyaleController extends GameController {
  constructor(element, params) {
    super(element, params, {
      menus: new BattleRoyaleUI()
    });
  }

  showCharacterCreation() {
    $("#character-name").focus();
  }

  createCharacter() {
    let name = $("#character-name").val();
    this.player.playerName = name;
    this.menus.transition("MAIN");
  }

  createGame() {

  }

  leaveGame() {
    API.leaveGame(this.game.gameId, this.player);
    this.menus.transition("MAIN");
  }

  joinGame(game) {
    this.gameInfo = game;
    this.socket.on("update", (data) => {
      //console.log("Got update");
      this.game.updateObjects(data);
    });
    this.socket.on("remove", (data) => {
      //console.log("Got update");
      this.game.removeObjects(data);
    });
    this.socket.on("initialize", (data) => {
      console.log("Initializing");

      $.when(API.getMaps(game.gameId), API.getObjects(game.gameId))
      .done((mapsData, objectsData) => {
        let maps = {};
        _.each(mapsData[0], (map, level) => {
          maps[level] = new Map(Object.assign({
            gameCanvas: document.getElementById("canvas-main")
          }, map));
        });
        this.game = new BattleRoyale({
          canvas: document.getElementById("canvas-main"),
          maps: maps,
          player: this.player,
          gameSettings: {
            viewDistance: 32 * 12
          },
          socket: this.socket
        });
        this.game.updateObjects(objectsData[0]);
        this.socket.emit("initialized", "initialized");

        this.socket.on("start", (data) => {
          console.log("Starting");
          this.start();
        });
      });
    });
    this.socket.emit("ready", "ready");
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
