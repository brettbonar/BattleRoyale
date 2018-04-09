import BattleRoyale from "../../modules/BattleRoyale/BattleRoyale.mjs"
import Game from "../../modules/Engine/Game.mjs"
import { initGame } from "./initGame.mjs"
import Map from "../../modules/Map.mjs"
import Projectile from "../../modules/BattleRoyale/Objects/Projectile.mjs"
import now from "performance-now"
import StaticObject from "../../modules/BattleRoyale/Objects/StaticObject.mjs"
import GameSettings from "../../modules/Engine/GameSettings.mjs"
import Quadtree from "quadtree-lib"
import BattleRoyaleServer from "../../modules/BattleRoyale/BattleRoyaleServer.mjs"

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
    this.game = new BattleRoyaleServer({
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
    this.lastObjects = [];
    this.lastCollisions = [];
    this.lastElapsedTime = 0;
    this.removedObjects = [];
  }

  getCollision(collision) {
    let sourceBounds;
    if (collision.sourceBounds) {
      sourceBounds = {
        width: collision.sourceBounds.width,
        height: collision.sourceBounds.height
      }
    };
    return {
      sourceId: collision.source.objectId,
      targetId: collision.target.objectId,
      position: collision.position,
      sourceBounds: sourceBounds
    };
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

    if (this.lastState.length > 0) {
      for (const player of this.players) {
        player.socket.emit("update", { elapsedTime: this.lastElapsedTime, objects: this.lastState });
      }
      this.lastState.length = 0;
    }

    if (this.lastCollisions.length > 0) {
      for (const player of this.players) {
        player.socket.emit("collision", this.lastCollisions.map(this.getCollision));
      }
      this.lastCollisions.length = 0;
    }

    if (this.removedObjects.length > 0) {
      for (const player of this.players) {
        player.socket.emit("remove", this.removedObjects);
      }
      this.removedObjects.length = 0;
    }

    this.lastElapsedTime = elapsedTime;
    this.removedObjects = _.difference(this.lastObjects, this.game.gameState.objects)
      .map((obj) => obj.objectId);
    this.lastObjects = this.game.gameState.objects.slice();
    this.lastCollisions = this.game.collisions;
    
    // TODO: do for each player
    this.lastState = this.game.gameState.objects
      .filter((obj) => obj._modified)
      .map(obj => {
        obj._modified = false;
        return _.cloneDeep(obj.getUpdateState());
      });

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
