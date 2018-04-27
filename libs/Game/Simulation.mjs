import BattleRoyale from "../../modules/BattleRoyale/BattleRoyale.mjs"
import Game from "../../modules/Engine/Game.mjs"
import { initGame } from "./initGame.mjs"
import Map from "../../modules/Map.mjs"
import Projectile from "../../modules/BattleRoyale/Objects/Projectile.mjs"
import now from "performance-now"
import StaticObject from "../../modules/BattleRoyale/Objects/StaticObject.mjs"
import Bounds from "../../modules/Engine/GameObject/Bounds.mjs"
import GameSettings from "../../modules/Engine/GameSettings.mjs"
import BattleRoyaleServer from "../../modules/BattleRoyale/BattleRoyaleServer.mjs"
import createStartMap from "../../modules/BattleRoyale/StartArea/createStartMap.mjs"
import createScript from "../../modules/BattleRoyale/Scripts/Script.mjs";
import { difference } from "../../modules/Engine/util.mjs"

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

  //console.log("Free grids", freeGrids.length);

  let count = game.maps[0].mapParams.totalMapWidth / 1000;
  count = Math.ceil(count * count);

  // console.log(game.maps[0].mapParams.totalMapWidth);
  // console.log("Count", count);

  freeGrids = _.shuffle(freeGrids);
  for (let i = 0; i < count && i < freeGrids.length; i++) {
    //console.log(freeGrids[i].position);
    game.addObject(new StaticObject({
      objectType: "chest2",
      position: freeGrids[i].position,
      level: 0,
      state: "closed",
      simulation: true        
    }));
  }

  game.initTreasure();
}

const PLAYER_STATUS = {
  ALIVE: "alive",
  DEAD: "dead",
  SHADOW: "shadow"
};

export default class Simulation {
  constructor(params) {
    _.merge(this, params);
    let maps = {};
    maps[0] = new Map(params.gameParams, 0);
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
      players: this.players,
      maps: maps,
      objects: objects
    });

    this.scores = [];
    this.onDone = params.onDone;
    this.initScores();
    this.updateScores();

    // TODO: fix this awful hack
    this.game.addScript(createScript("EntryPortals", {
      grid: this.game.grid,
      map: maps[0],
      duration: 15000,
      characters: this.players.map((player) => player.character),
      spawnMap: startArea.spawnMap
    }));
    addTreasure(this.game);

    this.lastState = [];
    this.lastObjects = [];
    this.lastCollisions = [];
    this.lastElapsedTime = 0;
    this.removedObjects = [];
    this.events = [];
  }

  addEvent(event) {
    this.events.push(event);
  }

  initScores() {
    for (const player of this.players) {
      this.scores.push({
        playerId: player.playerId,
        kills: 0,
        status: PLAYER_STATUS.ALIVE
      });
    }
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
    // TRICKY: intersect by player's last updates and visible objects to handle cases where
    // a previously visible object goes out of view - you want the update that moves it out of view
    let visibleObjects = this.game.grid.getRenderObjects(player.character.viewBounds, player.character.level);
    let newVisible = _.difference(visibleObjects, player.lastInView);
    player.lastInView = visibleObjects; 

    // Make sure we also update objects that the player was aware of last time, even if they
    // are no longer in view
    let intersection = _.intersectionBy(this.lastState,
      visibleObjects.concat(player.lastUpdates),
      "objectId");

    // Also make sure we update any objects that are newly in view
    intersection = intersection.concat(newVisible.map((obj) => _.cloneDeep(obj.getUpdateState())));
      
    return _.uniqBy(intersection, "objectId");
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

  updateScores() {
    let alive = this.scores.filter((player) => player.status === PLAYER_STATUS.ALIVE);
    if (alive.length === 1) {
      alive[0].won = true;
      this.done = true;
    }

    for (const player of this.players) {
      player.socket.emit("scores", this.scores);
    }
  }

  getEvent(event) {
    if (event.eventType === "kill") {
      let killedByPlayer = this.getPlayerIdFromObjectId(event.killedBy);
      let killer = this.scores.find((score) => score.playerId === killedByPlayer);
      if (killer) {
        killer.kills++;
      }
      let player = this.scores.find((score) => score.playerId === event.killed);
      if (player) {
        player.status = PLAYER_STATUS.DEAD;
      }

      this.updateScores();
      return {
        eventType: event.eventType,
        killed: event.killed,
        killedByPlayer: killedByPlayer,
        killedBy: event.killedBy
      };
    } else if (event.eventType === "playerAvatarChange") {
      let player = this.players.find((player) => player.playerId === event.playerId);
      player.character = this.game.gameState.objects.find((obj) => obj.objectId === event.objectId);

      let playerScore = this.scores.find((score) => score.playerId === event.playerId);
      if (playerScore) {
        playerScore.status = PLAYER_STATUS.SHADOW;
      }

      this.updateScores();
      return event;
    }
    return event;
  }

  refine(object, base) {
    return _.transform(object, (result, value, key) => {
      // Bad hack, interpolated values need to be copied fully
      if (!_.isEqual(value, base[key])) {
        result[key] = 
          _.isObject(value) && _.isObject(base[key]) && !_.isArray(value) && !_.isArray(base[key]) ?
          difference(value, base[key]) : value;
      }
    });
  }

  // Don't send updates for properties that haven't actually changed
  refineUpdates(lastUpdates, updates) {
    let refinedUpdates = [];

    for (let i = 0; i < updates.length; i++) {
      let existing = lastUpdates.find((update) => update.objectId === updates[i].objectId);
      if (existing) {
        let update = this.refine(updates[i], existing);

        if (!_.isEmpty(update)) {
          update.objectId = updates[i].objectId;
          refinedUpdates.push(update);
        }
      } else {
        refinedUpdates.push(updates[i]);
      }
    }

    return refinedUpdates;
  }

  sendUpdates() {
    let broadcastEvents = this.game.broadcastEvents.map((event) => this.getEvent(event))
      .concat(this.events);

    for (const player of this.players) {
      if (player.refinedUpdates.length > 0) {
        player.socket.emit("update", {
          elapsedTime: this.lastElapsedTime,
          objects: player.refinedUpdates
        });
      }
      // TODO: fix issues with sending too many collision events
      if (this.lastCollisions.length > 0) {
        player.socket.emit("collision", this.getPlayerViewCollisions(player));
      }
      if (this.removedObjects.length > 0) {
        // TODO: also filter this by player position - do when it is removed?
        player.socket.emit("remove", this.removedObjects);
      }
      if (broadcastEvents.length > 0) {
        player.socket.emit("event", broadcastEvents);
      }
    }

    this.lastState.length = 0;
    this.lastCollisions.length = 0;
    this.removedObjects.length = 0;
    this.game.broadcastEvents.length = 0;
    this.events.length = 0;
  }

  update() {
    if (!this.game) return;

    let currentTime = now();
    let elapsedTime = currentTime - this.previousTime;
    this.previousTime = currentTime;

    if (this.done) {
      this.sendUpdates();
      this.onDone(this.scores);
      this.game = null;
      return;
    }
    
    this.game.processUpdates(elapsedTime, currentTime);
    this.game._update(elapsedTime);

    this.sendUpdates();

    this.lastElapsedTime = elapsedTime;
    this.removedObjects = _.difference(this.lastObjects, this.game.gameState.objects)
      .map((obj) => obj.objectId);
    this.lastObjects = this.game.gameState.objects.slice();
    this.lastCollisions = this.game.collisions.map(this.getCollision);
    
    let lastState = this.lastState.slice();
    this.lastState = []
    for (const obj of this.game.modified) {
      if (!obj._skipUpdate) {
        let result = obj.getUpdateState();
        this.lastState.push(_.cloneDeep(result));
        // TODO: find a way to make this work. Can't only get modified keys since
        // a player may not have received the latest update and needs more info
        // _.pickBy(obj.getUpdateState(), (val, key) => {
        //   obj._modifiedKeys.includes(key);
        // });
        obj._modifiedKeys.length = 0;
        // if (!_.isEmpty(result)) {
        //   this.lastState.push(_.cloneDeep(result));
        // }
      }
    }

    for (const player of this.players) {
      let updates = this.getPlayerViewObjects(player);
      player.refinedUpdates = this.refineUpdates(player.lastUpdates, updates);
      player.lastUpdates = updates;
      //player.awareOf = _.union(player.awareOf, player.lastUpdates.map((update) => update.objectId));
    }

    this.interval = setTimeout(() => {
      this.update();
    }, SIMULATION_TIME);
  }

  start() {
    this.game.previousTime = now();
    this.game.transitionState(Game.STATE.PLAYING);
    this.previousTime = now();

    this.interval = setTimeout(() => {
      this.update();
    }, SIMULATION_TIME);
  }
}
