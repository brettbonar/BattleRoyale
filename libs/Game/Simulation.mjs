import BattleRoyale from "../../modules/BattleRoyale/BattleRoyale.mjs"
import Game from "../../modules/Engine/Game.mjs"
import { initGame } from "./initGame.mjs"
import Map from "../../modules/Map.mjs"
import Projectile from "../../modules/BattleRoyale/Objects/Projectile.mjs"
import now from "performance-now"

const TICK_RATE = 10;
const SIMULATION_TIME = 1000 / 65;

export default class Simulation {
  constructor(params) {
    Object.assign(this, params);
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

    this.eventHandlers = {
      changeDirection: (data, elapsedTime) => this.changeDirection(data, elapsedTime),
      changeTarget: (data, elapsedTime) => this.changeTarget(data, elapsedTime),
      attack: (data, elapsedTime) => this.attack(data, elapsedTime),
      use: (data, elapsedTime) => this.use(data, elapsedTime)
    };
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
      object.target = data.target;
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
    let handler = this.eventHandlers[data.type];
    if (handler) {
      //handler(data, elapsedTime);
      handler(data);
    } else {
      console.log("Unknown update: ", data.type);
      console.log(data);
    }
  }

  getMaps() { return this.game.maps }
  getObjects() { return this.game.gameState.objects }

  update() {
    let currentTime = now();
    let elapsedTime = currentTime - this.previousTime;
    this.previousTime = currentTime;

    this.game._update(elapsedTime);
    
    for (const player of this.players) {
      player.socket.emit("update", this.game.gameState.objects.map((obj) => obj.getUpdateState()));
    }
  }

  start() {
    this.game.previousTime = now();
    this.game.transitionState(Game.STATE.PLAYING);

    this.interval = setInterval(() => {
      this.update();
    }, SIMULATION_TIME);
  }
}
