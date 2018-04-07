import Simulation from "./Simulation.mjs";
import _ from "lodash";
global._ = _;
import q from "q";
import now from "performance-now"

let games = [];
let gameId = 1;

let io;
let sockets = {};

const PING_INTERVAL = 5000;

function setPing(client) {
  return setInterval(() => {
    client.pingTime = now();
    client.socket.emit("pingpong");
  }, PING_INTERVAL);
}

function initSockets(socketIo) {
  io = socketIo;
  io.on("connection", (socket) => {
    let client = {
      socket: socket,
      latency: 0,
      lastPing: 0,
      pings: new Array(5).fill(0),
      pingTime: now()
    }
    sockets[socket.id] = client;
    client.ping = setPing(client);
    socket.on("pingpong", () => {
      let newPing = (client.lastPing + 1) % 5;
      client.pings[newPing] = (now() - client.pingTime) / 2;
      client.lastPing = newPing;
      client.latency = _.mean(client.pings);
      //console.log("Latency for " + socket.id + ": " + client.latency);
    });

    console.log("Connected");
    //console.log(socket);
    socket.emit("id", socket.id);

    // socket.send(socket.id);

    socket.on("disconnect", () => {
      console.log("Disconnected");
      // TODO: remove player from game
      let client = sockets[socket.id];
      if (client) {
        clearInterval(client.ping);
        delete sockets[socket.id];
      }
    });
  });
}

const STATUS = {
  LOBBY: "lobby",
  IN_PROGRESS: "inProgress"
};

class Game {
  constructor(params) {
    _.merge(this, params);

    this.gameId = gameId++;
    this.players = [];
    this.sockets = [];

    _.defaults(this, {
      maxPlayers: 96,
      //startPlayers: 2,
      status: STATUS.LOBBY
    });

    // TESTING
    // this.initialize();
    // this.start();
  }

  getObjects() {
    return this.simulation.getObjects();
  }

  getMaps() {
    let mapsJson = {};
    _.each(this.simulation.getMaps(), (map, level) => {
      mapsJson[level] = map.toJSON();
    });
    return mapsJson;
  }

  addPlayer(player) {
    player.client = sockets[player.playerId];
    player.socket = sockets[player.playerId].socket;
    this.players.push(player);
    player.socket.join(this.gameId);
    player.socket.on("update", (data) => {
      //console.log("Got update");
      if (data.source.playerId === player.playerId) {
        this.simulation.updateState(data, player.client.latency);
      }
    });
    player.socket.on("ready", (data) => {
      console.log("Got ready");
      player.ready = true;

      if (_.sumBy(this.players, "ready") >= this.players.length) {
        console.log("Initializing");
        this.initialize();
      }

      player.socket.on("initialized", () => {
        player.initialized = true;
        if (_.sumBy(this.players, "initialized") >= this.players.length) {
          console.log("Starting");
          this.start();
        }
      });
    });
  }

  getPlayers() {
    return _.map(this.players, (player) => _.pick(player, ["playerId", "playerName"]));
  }

  getLobby() {
    return {
      name: this.name,
      gameId: this.gameId,
      numberOfPlayers: this.players.length,
      maxPlayers: this.maxPlayers,
      status: this.status,
      players: this.getPlayers()
    };
  }

  removePlayer(playerId) {
    let player = _.find(this.players, { playerId: playerId });
    player.socket.leave(this.gameId);
    _.pull(this.players, player);
    // TODO: remove from game state as well
    // TODO: update "quit" for player
  }

  initialize() {
    this.simulation = new Simulation({
      gameId: this.gameId,
      players: this.players,
      io: io
    });
    
    for (const player of this.players) {
      player.socket.emit("initialize", "initialize");
    }
  }

  start() {
    this.simulation.start();

    for (const player of this.players) {
      player.socket.emit("start", "start");
    }
  }
}

function list() {
  let gamesList = games.map((game) => {
    return {
      name: game.name,
      gameId: game.gameId,
      numberOfPlayers: game.players.length,
      maxPlayers: game.maxPlayers,
      status: game.status
    };
  });
  return q.resolve(gamesList);
}

function getLobby(gameId) {
  let game = _.find(games, { gameId: gameId });
  return q.resolve(game.getLobby());
}

function create(params) {
  let game = new Game(params);
  games.push(game);
  return q.resolve(game.gameId);
}

function getObjects(gameId) {
  let game = _.find(games, { gameId: gameId });
  return q.resolve(game.getObjects());
}

function getMaps(gameId) {
  let game = _.find(games, { gameId: gameId });
  return q.resolve(game.getMaps());
}

function join(gameId, player) {
  let game = _.find(games, { gameId: gameId });
  game.addPlayer(player);
  console.log(game.getLobby());
  return q.resolve(game.getLobby());
}

function leave(gameId, player) {
  let game = _.find(games, { gameId: gameId });
  return q.resolve(game.removePlayer(player.playerId));
}

function validateCreateGame(req, res, next) {
  if (_.find(games, { name: req.body.name })) {
    next("A game with that name already exists");
  }
  if (!req.body.name) {
    next("Game name is required");
  }
  next();
}

function validateGame(req, res, next) {
  req.params.gameId = parseInt(req.params.gameId, 10);
  if (!_.find(games, { gameId: req.params.gameId })) {
    next("Game not found");
  }
  next();
}

function validateJoin(req, res, next) {
  let game = _.find(games, { gameId: req.params.gameId });
  let player = _.find(game.players, { playerId: req.body.playerId });
  // TODO: don't allow player to join a game if already in one
  if (player) {
    next("Already in game");
  }
  if (game.players.length >= game.maxPlayers) {
    next("Game is full");
  }
  next();
}

function getGame(gameId) {
  return _.find(games, { gameId: gameId });
}

games.push(new Game({ name: "Game1" }));
//games.push(new Game({ name: "Game2", maxPlayers: 5 }));

export { 
  validateGame,
  validateCreateGame,
  validateJoin,
  create,
  join,
  leave,
  list,
  getObjects,
  getMaps,
  getLobby,
  getGame,
  initSockets
}
