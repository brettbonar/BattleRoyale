import BattleRoyale from "../../modules/BattleRoyale/BattleRoyale.mjs"
import Game from "../../modules/Engine/Game.mjs"
import { initGame } from "./initGame.mjs"
import Map from "../../modules/Map.mjs"
import Projectile from "../../modules/BattleRoyale/Objects/Projectile.mjs"
import now from "performance-now"
import StaticObject from "../../modules/BattleRoyale/Objects/StaticObject.mjs"

const TICK_RATE = 20;
const SIMULATION_TIME = 1000 / TICK_RATE;

export default class Simulation {
  constructor(params) {
    _.merge(this, params);
    let maps = {
      "-1": new Map({
        seeds: {
          death: 5,
          water: 5
        }
      }),
      "0": new Map()
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

    this.eventHandlers = {
      changeDirection: (data, elapsedTime) => this.changeDirection(data, elapsedTime),
      changeTarget: (data, elapsedTime) => this.changeTarget(data, elapsedTime),
      attack: (data, elapsedTime) => this.attack(data, elapsedTime),
      use: (data, elapsedTime) => this.use(data, elapsedTime),
      changeAltitude: (data, elapsedTime) => this.changeAltitude(data, elapsedTime)
    };
  }

  // For testing
  changeAltitude(data, elapsedTime) {
    let object = _.find(this.game.gameState.objects, {
      playerId: data.source.playerId,
      objectId: data.source.objectId
    });
    if (object) {
      object.position.z += data.z;
      object.position.z = Math.max(0, object.position.z);
    }
  }

  use(data, elapsedTime) {
    let object = _.find(this.game.gameState.objects, {
      playerId: data.source.playerId,
      objectId: data.source.objectId
    });
    if (object) {
      let target = this.game.getInteraction(object);
      if (target) {
        target.interact(object);
      }
    }
  }

  changeTarget(data, elapsedTime) {
    let object = _.find(this.game.gameState.objects, {
      playerId: data.source.playerId,
      objectId: data.source.objectId
    });
    if (object) {
      //object.target = data.target;
      object.setTarget(data.target);
      object.revision = data.source.revision;
      object.elapsedTime = elapsedTime || 0;
    }
  }

  changeDirection(data, elapsedTime) {
    let object = _.find(this.game.gameState.objects, {
      playerId: data.source.playerId,
      objectId: data.source.objectId
    });
    if (object) {
      object.direction = data.direction;
      object.revision = data.source.revision;
      object.elapsedTime = elapsedTime || 0;
    }
  }

  attack(data, elapsedTime) {
    let object = _.find(this.game.gameState.objects, {
      playerId: data.source.playerId,
      objectId: data.source.objectId
    });
    if (object) {
      object.revision = data.source.revision;
      this.game.doAttack(object, data, elapsedTime);
    }
  }

  updateState(data, elapsedTime) {
    if (this.eventHandlers[data.type]) {
      //handler(data, elapsedTime);
      this.updates.push({
        update: data,
        elapsedTime: elapsedTime,
        eventTime: now()
      });
    } else {
      console.log("Unknown update: ", data.type);
      console.log(data);
    }
  }

  processUpdates(elapsedTime, currentTime) {
    for (const update of this.updates) {
      let handler = this.eventHandlers[update.update.type];
      elapsedTime = 0;//update.elapsedTime + ((currentTime - update.eventTime) - elapsedTime);
      handler(update.update, elapsedTime);
    }
    this.updates.length = 0;
  }

  getMaps() { return this.game.maps }
  getObjects() { return this.game.gameState.objects.map((obj) => obj.getUpdateState()) }

  update() {
    let currentTime = now();
    let elapsedTime = currentTime - this.previousTime;
    this.previousTime = currentTime;
    
    this.processUpdates(elapsedTime, currentTime);
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
