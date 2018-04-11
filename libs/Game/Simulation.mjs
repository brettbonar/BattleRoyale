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
      objects: initGame(this.players, maps)
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

  getPlayerViewObjects(player) {
    return _.intersectionBy(this.lastState, this.game.grid.getRenderObjects(player.character.viewBounds), "objectId");
    //return this.lastState;
  }

  getPlayerViewCollisions(player) {
    let viewBounds = player.character.viewBounds;
    // TODO: find out why this check doesn't work
    //return this.lastCollisions.filter((collision) => viewBounds.intersects(collision.position));
    return this.lastCollisions;
  }

  getPlayerIdFromObjectId(objectId) {
    return this.players.find((player) => player.character.objectId === objectId).playerId;
  }

  getEvent(event) {
    if (event.eventType === "kill") {
      return {
        eventType: event.eventType,
        killed: event.killed,
        killedBy: this.getPlayerIdFromObjectId(event.killedBy)
      };
    }
    return event;
  }

  sendUpdates() {
    let broadcastEvents = this.game.broadcastEvents.map((event) => this.getEvent(event));


    for (const player of this.players) {
      if (this.lastState.length > 0) {
        player.socket.emit("update", {
          elapsedTime: this.lastElapsedTime,
          objects: this.getPlayerViewObjects(player)
        });
      }
      if (this.lastCollisions.length > 0) {
        player.socket.emit("collision", this.getPlayerViewCollisions(player));
      }
      if (this.removedObjects.length > 0) {
        // TODO: also filter this by player position - do when it is removed?
        player.socket.emit("remove", this.removedObjects);
      }
      if (this.game.broadcastEvents.length > 0) {
        player.socket.emit("event", )
      }
    }

    this.lastState.length = 0;
    this.lastCollisions.length = 0;
    this.removedObjects.length = 0;
  }

  update() {
    let currentTime = now();
    let elapsedTime = currentTime - this.previousTime;
    this.previousTime = currentTime;
    
    this.game.processUpdates(elapsedTime, currentTime);
    this.game._update(elapsedTime);

    this.sendUpdates();

    this.lastElapsedTime = elapsedTime;
    this.removedObjects = _.difference(this.lastObjects, this.game.gameState.objects)
      .map((obj) => obj.objectId);
    this.lastObjects = this.game.gameState.objects.slice();
    this.lastCollisions = this.game.collisions.map(this.getCollision);
    
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
