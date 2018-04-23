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
    this.initSocket();

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

  initSocket() {
    this.socket.on("chat", (data) => {
      let text = this.getPlayerName(data.playerId) + ": " + data.message;
      $("#chat-messages").append($("<li>").text(text));
    });
    this.socket.on("update", (data) => {
      //console.log("Got update");
      if (this.game) {
        this.game.updateObjects(data);
      }
    });
    this.socket.on("remove", (data) => {
      //console.log("Got update");
      if (this.game) {
        this.game.removeObjects(data);
      }
    });
    this.socket.on("collision", (data) => {
      //console.log("Got update");
      if (this.game) {
        this.game.onCollisions(data);
      }
    });
    this.socket.on("gameOver", (data) => {
      //console.log("Got update");
      if (this.game) {
        this.game.onGameOver(data);
      }
      if (data) {
        this.scores = data;
      }
    });
    this.socket.on("scores", (data) => {
      if (data) {
        this.scores = data;
      }
    });
    this.socket.on("event", (data) => {
      //console.log("Got update");
      if (this.game) {
        this.game.onEvents(data);
      }
    });
    this.socket.on("updateLobby", (data) => {
      this.menus.updateLobby(data);
      this.players = data.players;
    });
    this.socket.on("initialize", (data) => {
      console.log("Initializing");

      $.when(API.getMaps(this.gameInfo.gameId),
             API.getObjects(this.gameInfo.gameId),
             API.getLobby(this.gameInfo.gameId))
        .done((mapsData, objectsData, lobbyData) => {
          let maps = {};
          _.each(mapsData[0], (map, level) => {
            maps[level] = new Map(map, level);
          });
          this.players = lobbyData[0].players;
          this.game = new BattleRoyaleClient({
            canvas: document.getElementById("canvas-main"),
            menus: this.menus,
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

  sendChat() {
    let chat = $("#lobby-chat-input").val();
    if (chat) {
      this.socket.emit("chat", chat);
      $("#lobby-chat-input").val("");
    }
  }

  leaveGame() {
    API.leaveGame(this.gameInfo.gameId, this.player);
    this.menus.transition("JOIN_GAME");
  }

  quitGame() {
    if (this.game) {
      API.leaveGame(this.gameInfo.gameId, this.player);
      this.quit();
      this.menus.transition("MAIN");
    }
  }

  joinGame(game) {
    this.gameInfo = game;
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
        this.doLogin(user);
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

    this.doLogin(user);
  }

  resume() {
    this.menus.hide('IN_GAME_MENU');
    this.game.bindPointerLock();
  }

  ready() {
    this.socket.emit("ready", "ready");
  }

  startGame() {
    this.socket.emit("startGame", "startGame");
  }
}

registerController("BattleRoyaleController", BattleRoyaleController);
