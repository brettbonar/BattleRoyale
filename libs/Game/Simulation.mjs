import BattleRoyale from "../../modules/BattleRoyale/BattleRoyale.mjs"
import Game from "../../modules/Engine/Game.mjs"
import { initGame } from "./initGame.mjs"
import Map from "../../modules/Map.mjs"
import Projectile from "../../modules/BattleRoyale/Objects/Projectile.mjs"
import now from "performance-now"
import StaticObject from "../../modules/BattleRoyale/Objects/StaticObject.mjs"
import Bounds from "../../modules/Engine/GameObject/Bounds.mjs"
import GameSettings from "../../modules/Engine/GameSettings.mjs"
import Quadtree from "quadtree-lib"
import BattleRoyaleServer from "../../modules/BattleRoyale/BattleRoyaleServer.mjs"
import createStartMap from "../../modules/BattleRoyale/StartArea/createStartMap.mjs"
import createScript from "../../modules/BattleRoyale/Scripts/Script.mjs";

const TICK_RATE = 20;
const SIMULATION_TIME = 1000 / TICK_RATE;

GameSettings.isServer = true;

function addTreasure(game) {
  let freeGrids = game.grid.getFreeGrids(new Bounds({
    position: {
      x: 0,
      y: 0
    },
    dimensions: {
      width: game.maps[0].mapParams.totalMapWidth,
      height: game.maps[0].mapParams.totalMapHeight
    }
  }), 0);

  let count = Math.floor(game.maps[0].mapParams.totalMapWidth / 1000);
  count *= count;


  freeGrids = _.shuffle(freeGrids);
  for (let i = 0; i < count && i < freeGrids.length; i++) {
    game.addObject(new StaticObject({
      objectType: "chest2",
      position: freeGrids[i].position,
      simulation: true        
    }));
  }
}

export default class Simulation {
  constructor(params) {
    _.merge(this, params);
    let maps = {};
    maps[0] = new Map(params.gameParams);
    maps[0].generateSimplex();

    let startArea = createStartMap(maps, params.players);
    maps["start"] = startArea.map;

    let objects = initGame(this.players, maps);
    this.game = new BattleRoyaleServer({
      isServer: true,
      simulation: true,
      canvas: {
        width: 2048,
        height: 2048
      },
      maps: maps,
      objects: objects
    });

    // TODO: fix this awful hack
    this.game.addScript(createScript("EntryPortals", {
      grid: this.game.grid,
      map: maps[0],
      duration: 150000,
      characters: this.players.map((player) => player.character),
      spawnMap: startArea.spawnMap
    }));
    addTreasure(this.game);

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
    return _.intersectionBy(this.lastState, this.game.grid.getRenderObjects(player.character.viewBounds, player.character.level), "objectId");
    //return this.lastState;
  }

  getPlayerViewCollisions(player) {
    let viewBounds = player.character.viewBounds;
    // TODO: find out why this check doesn't work
    //return this.lastCollisions.filter((collision) => viewBounds.intersects(collision.position));
    return this.lastCollisions;
  }

  getPlayerIdFromObjectId(objectId) {
    let character = this.players.find((player) => player.character.objectId === objectId);
    return character && character.playerId;
  }

  getEvent(event) {
    if (event.eventType === "kill") {
      return {
        eventType: event.eventType,
        killed: event.killed,
        killedByPlayer: this.getPlayerIdFromObjectId(event.killedBy),
        killedBy: event.killedBy
      };
    } else if (event.eventType === "playerAvatarChange") {
      let player = this.players.find((player) => player.playerId === event.playerId);
      player.character = this.game.gameState.objects.find((obj) => obj.objectId === event.objectId);
      return event;
    }
    return event;
  }

  // Don't send updates for properties that haven't actually changed
  refineUpdates(lastUpdates, updates) {
    let refinedUpdates = updates;

    for (let i = 0; i < updates.length; i++) {
      let existing = lastUpdates.find((update) => update.objectId === updates[i].objectId);
      updates[i] = _.omitBy(updates[i], (key) => {
        return lastUpdates[key] && _.isEqual(lastUpdates[key] === updates[i][key]);
      });
    }

    return refinedUpdates;
  }

  sendUpdates() {
    let broadcastEvents = this.game.broadcastEvents.map((event) => this.getEvent(event));

    for (const player of this.players) {
      if (this.lastState.length > 0) {
        let updates = this.refineUpdates(player.lastUpdates, this.getPlayerViewObjects(player));
        player.lastUpdates = updates;
        player.socket.emit("update", {
          elapsedTime: this.lastElapsedTime,
          objects: updates
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
    
    this.lastState = this.game.modified
      .map(obj => {
        let result = _.cloneDeep(obj.getUpdateState());
        //obj._modifiedKeys.length = 0;
        return result;
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
