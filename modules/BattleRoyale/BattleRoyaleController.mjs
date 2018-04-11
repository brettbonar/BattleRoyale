import { registerController, GameController } from "../Engine/GameController.mjs"
import Game from "../Engine/Game.mjs"
import BattleRoyale from "../BattleRoyale/BattleRoyale.mjs"
import BattleRoyaleUI from "../BattleRoyale/BattleRoyaleUI.mjs"
import Map from "/modules/Map.mjs"
import * as API from "./API.mjs"
import GameSettings from "../Engine/GameSettings.mjs"
import ImageCache from "../Engine/Rendering/ImageCache.mjs"
import BattleRoyaleClient from "./BattleRoyaleClient.mjs"
import objects from "./Objects/objects.mjs"
import buildings from "./Buildings/buildings.mjs"
//import { initialize } from "../Engine/Rendering/Scratch.mjs"

export default class BattleRoyaleController extends GameController {
  constructor(element, params) {
    super(element, params, {
      menus: new BattleRoyaleUI()
    });

    //initialize();


    this.initializedDeferred = Q.defer();
    this.initialized = this.initializedDeferred.promise;

    // TODO: put asset initialization in a function somewhere else
    let imagePromises = [];
    imagePromises.push(ImageCache.put("/Assets/terrain_atlas.png"));

    _.each(objects, (obj) => {
      if (obj.imageSource) {
        imagePromises.push(ImageCache.put(obj.imageSource));
      } else if (obj.images) {
        _.each(obj.images, (image) => imagePromises.push(ImageCache.put(image.imageSource)));
      }
    });

    _.each(buildings, (obj) => {
      imagePromises.push(ImageCache.put(obj.exterior.imageSource));
      imagePromises.push(ImageCache.put(obj.interior.imageSource));
    });

    Q.all(imagePromises).then(this.initializedDeferred.resolve());
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
    this.socket.on("collision", (data) => {
      //console.log("Got update");
      this.game.onCollisions(data);
    });
    this.socket.on("initialize", (data) => {
      console.log("Initializing");

      $.when(API.getMaps(game.gameId), API.getObjects(game.gameId))
      .done((mapsData, objectsData) => {
        let maps = {};
        let quadTrees = {};
        _.each(mapsData[0], (map, level) => {
          maps[level] = new Map(Object.assign({
            gameCanvas: document.getElementById("canvas-main")
          }, map));
          quadTrees[level] = new Quadtree({
            width: map.mapWidth * map.tileSize,
            height: map.mapHeight * map.tileSize,
            maxElements: 5
          });
        });
        let mapCanvas = document.getElementById("canvas-map");
        this.game = new BattleRoyaleClient({
          canvas: document.getElementById("canvas-main"),
          mapCanvas: mapCanvas,
          maps: maps,
          player: this.player,
          gameSettings: {
            viewDistance: 32 * 12
          },
          socket: this.socket,
          quadTrees: quadTrees
        });
        this.game.updateObjects({ objects: objectsData[0], elapsedTime: 0 });
        this.initialized.then(() => this.socket.emit("initialized", "initialized"));

        this.socket.on("start", (data) => {
          console.log("Starting");
          this.start();
        });
      });
    });
  }

  ready() {
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
