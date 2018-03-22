import BattleRoyale from "../../modules/BattleRoyale/BattleRoyale.mjs"
import Game from "../../modules/Engine/Game.mjs"
import { initGame } from "./initGame.mjs"
import Map from "../../modules/Map.mjs"
import Projectile from "../../modules/BattleRoyale/Objects/Projectile.mjs"
import now from "performance-now"
import StaticObject from "../../modules/BattleRoyale/Objects/StaticObject.mjs"
import GameSettings from "../../modules/Engine/GameSettings.mjs"

const TICK_RATE = 20;
const SIMULATION_TIME = 1000 / TICK_RATE;

GameSettings.isServer = true;

export default class Simulation {
  constructor(params) {
    _.merge(this, params);
    let maps = {
      // "-1": new Map({
      //   seeds: {
      //     death: 5,
      //     water: 5
      //   }
      // }),
      "0": new Map({
        seeds: {
          plain: 5,
          forest: 5
        }
      })
    };
    this.game = new BattleRoyale({
      isServer: true,
      simulation: true,
      canvas: {
        width: 2048,
        height: 2048
      },
      maps: maps,
      objects: initGame(params.players, maps)
    });
    this.lastState = [];
    this.updates = [];    
  }

  updateState(data, elapsedTime) {
    this.game.updateState(data, elapsedTime, now());
  }

  getMaps() { return this.game.maps }
  getObjects() { return this.game.gameState.objects.map((obj) => obj.getUpdateState()) }

  update() {
    let currentTime = now();
    let elapsedTime = currentTime - this.previousTime;
    this.previousTime = currentTime;
    
    this.game.processUpdates(elapsedTime, currentTime);
    this.game._update(elapsedTime);
    
    // TODO: do for each player
    let state = this.game.gameState.objects
      .filter((obj) => obj._modified)
      .map(obj => {
        obj._modified = false;
        return obj.getUpdateState();
      });

    for (const player of this.players) {
      player.socket.emit("update", state);
    }

    let removedObjects = _.difference(this.lastState, this.game.gameState.objects);
    for (const player of this.players) {
      player.socket.emit("remove", _.map(removedObjects, "objectId"));
    }

    this.lastState = this.game.gameState.objects.slice();

    this.interval = setTimeout(() => {
      this.update();
    }, SIMULATION_TIME);
  }

  start() {
    this.game.previousTime = now();
    this.game.transitionState(Game.STATE.PLAYING);

    this.interval = setTimeout(() => {
      this.update();
    }, SIMULATION_TIME);
  }
}
