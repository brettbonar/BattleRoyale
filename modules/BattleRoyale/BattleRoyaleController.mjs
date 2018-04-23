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
import equipment from "./Objects/equipment.mjs"
import buildings from "./Buildings/buildings.mjs"
import attacks from "./Magic/attacks.mjs";
import magicEffects from "./Magic/magicEffects.mjs";
//import { initialize } from "../Engine/Rendering/Scratch.mjs"

function loadAssets(group) {
  let imagePromises = [];
  _.each(group, (obj) => {
    if (obj.imageSource) {
      imagePromises.push(ImageCache.put(obj.imageSource));
    } else if (obj.images) {
      _.each(obj.images, (image) => imagePromises.push(ImageCache.put(image.imageSource)));
    } else if (obj.rendering) {
      if (obj.rendering.imageSource) {
        imagePromises.push(ImageCache.put(obj.imageSource));
      } else if (obj.images) {
        _.each(obj.rendering.images, (image) => imagePromises.push(ImageCache.put(image.imageSource)));
      }
    }
  });

  return imagePromises;
}

export default class BattleRoyaleController extends GameController {
  constructor(element, params) {
    super(element, params, {
      menus: new BattleRoyaleUI()
    });

    //initialize();


    this.initializedDeferred = Q.defer();
    this.initialized = this.initializedDeferred.promise;
    this.scores = [];

    // TODO: put asset initialization in a function somewhere else
    let imagePromises = [];
    imagePromises.push(ImageCache.put("/Assets/terrain.png"));
    imagePromises.push(ImageCache.put("/Assets/terrain_atlas.png"));
    imagePromises = imagePromises
      .concat(loadAssets(objects))
      .concat(loadAssets(equipment))
      .concat(loadAssets(attacks))
      .concat(loadAssets(magicEffects));

    _.each(buildings, (obj) => {
      imagePromises.push(ImageCache.put(obj.exterior.imageSource));
      imagePromises.push(ImageCache.put(obj.interior.imageSource));
    });

    Q.all(imagePromises).then(this.initializedDeferred.resolve());
  }

  leaveGame() {
    API.leaveGame(this.gameInfo.gameId, this.player);
    this.menus.transition("JOIN_GAME");
  }

  quitGame() {
    if (this.game) {
      API.leaveGame(this.gameInfo.gameId, this.player);
      this.game.quit();
      this.game = null;
    }
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
    this.socket.on("gameOver", (data) => {
      //console.log("Got update");
      this.game.onGameOver(data);
      this.scores = data;
    });
    this.socket.on("scores", (data) => {
      this.scores = data;
    });
    this.socket.on("event", (data) => {
      //console.log("Got update");
      this.game.onEvents(data);
    });
    this.socket.on("updateLobby", (data) => {
      this.menus.updateLobby(data);
    });
    this.socket.on("initialize", (data) => {
      console.log("Initializing");

      $.when(API.getMaps(game.gameId), API.getObjects(game.gameId), API.getLobby(game.gameId))
        .done((mapsData, objectsData, lobbyData) => {
          let maps = {};
          _.each(mapsData[0], (map, level) => {
            maps[level] = new Map(Object.assign({
              gameCanvas: document.getElementById("canvas-main")
            }, map), level);
          });
          let mapCanvas = document.getElementById("canvas-map");
          this.players = lobbyData[0].players;
          this.game = new BattleRoyaleClient({
            canvas: document.getElementById("canvas-main"),
            menus: this.menus,
            mapCanvas: mapCanvas,
            maps: maps,
            player: this.player,
            players: lobbyData[0].players,
            gameSettings: {
              viewDistance: 32 * 12
            },
            socket: this.socket
          });
          this.game.updateObjects({ objects: objectsData[0], elapsedTime: 0 });
          this.game.processUpdates(0);
          this.initialized.then(() => this.socket.emit("initialized", "initialized"));

          this.socket.on("start", (data) => {
            console.log("Starting");
            this.start();
          });
        });
    });
  }

  getPlayerName(playerId) {
    let player = _.find(this.players, { playerId: playerId });
    return player && player.playerName;
  }

  getGameScores() {
    return this.scores.map((score) => {
      return {
        playerName: this.getPlayerName(score.playerId),
        kills: score.kills,
        status: score.status
      };
    });
  }

  register() {
    let user = {
      username: this.menus.menus.REGISTER.find("#registerUsername").val(),
      password: this.menus.menus.REGISTER.find("#registerPassword").val(),
      confirmPassword: this.menus.menus.REGISTER.find("#registerConfirmPassword").val()
    };
    API.register(user)
      .done(() => {

        // this.menus.menus.REGISTER.find("#register-notification")
        //   .removeClass("error")
        //   .addClass("success")
        //   .html("Registration succeeded!");
      })
      .fail((response) => {
        this.menus.menus.REGISTER.find("#register-notification")
          .removeClass("success")
          .addClass("error")
          .html(response.responseText);
      });
  }

  doLogin(user) {
    API.login(user)
      .done((response) => {
        this.menus.menus.LOGIN.find("#login-notification")
          .removeClass("error")
          .addClass("success");
        this.menus.transition("MAIN");
        this.player.playerName = user.username;
        this.player.playerId = response;
        this.socket.emit("playerId", response);
        // TODO: set session token?
      })
      .fail((response) => {
        this.menus.menus.LOGIN.find("#login-notification")
          .removeClass("success")
          .addClass("error")
          .html(response.responseText);
      });
  }

  login() {
    let user = {
      username: this.menus.menus.LOGIN.find("#loginUsername").val(),
      password: this.menus.menus.LOGIN.find("#loginPassword").val()
    };
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
