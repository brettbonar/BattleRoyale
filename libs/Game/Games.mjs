import Simulation from "./Simulation.mjs";
import _ from "lodash";
global._ = _;
import q from "q";
import now from "performance-now"
import * as Users from "../Users/Users.mjs"

let games = [];
let gameId = 1;

let io;
let sockets = {};

const PING_INTERVAL = 5000;

function setPing(client) {
  return setInterval(() => {
    client.pingTime = now();
    //client.socket.emit("pingpong");
  }, PING_INTERVAL);
}

function getPlayerInGame(playerId) {
  for (const game of games) {
    let player = game.players.find((player) => player.playerId === playerId);
    if (player) {
      return {
        player: player,
        game: game
      };
    }
  }
}

function getPlayerSocket(playerId) {
  return _.find(sockets, { playerId: playerId });
}

function initSockets(socketIo) {
  io = socketIo;
  io.sockets.setMaxListeners(0);

  io.on("connection", (socket) => {
    let client = {
      socket: socket,
      latency: 0,
      lastPing: 0,
      pings: new Array(5).fill(0),
      pingTime: now()
    }
    sockets[socket.id] = client;
    //client.ping = setPing(client);

    // socket.on("pingpong", () => {
    //   let newPing = (client.lastPing + 1) % 5;
    //   client.pings[newPing] = (now() - client.pingTime) / 2;
    //   client.lastPing = newPing;
    //   client.latency = _.mean(client.pings);
    //   //console.log("Latency for " + socket.id + ": " + client.latency);
    // });

    console.log("Connected");
    socket.on("playerId", (playerId) => {
      client.playerId = playerId;
      client.playerName = Users.getPlayerName(playerId);
      let playerGame = getPlayerInGame(playerId);
      if (playerGame) {
        console.log("Reconnected", client.playerName);
        playerGame.game.initPlayerSocket(playerGame.player, client);
      }
    });

    socket.on("disconnect", () => {
      // TODO: remove player from game
      let client = sockets[socket.id];
      if (client && client.playerId) {
        let game = _.find(games, { gameId: client.gameId });
        if (game) {
          game.onDisconnect(client.playerId);
        }
        console.log("Disconnected", client.playerName);
        //clearInterval(client.ping);
        delete sockets[socket.id];
      } else {
        console.log("Disconnected", socket.id);
      }
    });
  });
}

const STATUS = {
  LOBBY: "lobby",
  IN_PROGRESS: "inProgress"
};

const PLAYER_STATUS = {
  NOT_READY: "notReady",
  READY: "ready",
  LOADING: "loading",
  INITIALIZED: "initialized"
};

class Game {
  constructor(params) {
    _.merge(this, params);

    this.gameId = gameId++;
    this.players = [];
    this.sockets = [];
    this.gameParams = {
      mapSize: params.mapSize || 128,
      biomes: params.biomes || {
        plain: 50,
        forest: 25,
        desert: 25
      }
    };

    _.defaultsDeep(this, {
      name: "New Game",
      maxPlayers: 100,
      status: STATUS.LOBBY
    });

    // TESTING
    // this.initialize();
    // this.start();
  }

  onDisconnect(playerId) {
    if (this.status === STATUS.IN_PROGRESS) {
      if (this.simulation) {
        this.simulation.addEvent({
          eventType: "disconnect",
          playerId: playerId
        });
      }
    } else {
      this.removePlayer(playerId);
      this.updateLobby();
    }
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

  initPlayerSocket(player, client) {
    player.client = client;
    player.client.gameId = this.gameId;
    player.socket = client.socket;
    player.socket.join(this.gameId);
    player.socket.on("update", (data) => {
      //console.log("Got update");
      if (!this.done && data.source.playerId === player.playerId) {
        this.simulation.updateState(data, player.client.latency);
      }
    });
    player.socket.on("chat", (data) => {
      for (const pl of this.players) {
        pl.socket.emit("chat", {
          message: data,
          playerId: player.playerId
        });
      }
    });
    player.socket.on("ready", (data) => {
      console.log("Got ready");
      if (!player.ready) player.status = PLAYER_STATUS.READY;
      player.ready = true;
      this.updateLobby();

      console.log("Ready players", _.sumBy(this.players, "ready"));
      let readyPlayers = _.sumBy(this.players, "ready");
      if (readyPlayers >= this.players.length && readyPlayers > 1 && !this.initialized) {
        console.log("Initializing");
        this.initialize();
        this.initialized = true;
        this.status = STATUS.IN_PROGRESS;
      }

      player.socket.on("initialized", () => {
        if (!player.initialized) player.status = PLAYER_STATUS.INITIALIZED;
        player.initialized = true;
        this.updateLobby();

        console.log("Initialized players", _.sumBy(this.players, "initialized"));
        if (_.sumBy(this.players, "initialized") >= this.players.length && !this.started) {
          console.log("Starting");
          this.started = true;
          this.start();
        }
      });
    });
  }

  addPlayer(player) {
    let client = getPlayerSocket(player.playerId);
    if (!client) {
      return "Player not found";
    }
    if (client.gameId) {
      return "Player already in a game";
    }

    player.lastUpdates = [];
    player.lastInView = [];
    player.status = PLAYER_STATUS.NOT_READY;
    this.players.push(player);

    this.initPlayerSocket(player, client);
  }

  getPlayers() {
    return _.map(this.players, (player) => _.pick(player, ["playerId", "playerName", "status"]));
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
    if (player) {
      player.client.gameId = null;
      player.socket.leave(this.gameId);
      _.pull(this.players, player);
      
      if (this.simulation) {
        this.simulation.addEvent({
          eventType: "leave",
          playerId: playerId
        });
      } else {
        // TODO: add disconnect message to chat
      }
    }

    if ((this.done || this.status !== STATUS.LOBBY) && this.players.length === 0) {
      this.simulation.done = true;
      this.simulation = null;
      _.pull(games, this);
    }
  }

  onDone(scores) {
    Users.updateScores(scores);
    this.done = true;
    for (const player of this.players) {
      player.socket.emit("gameOver", this.scores);
    }
  }

  initialize() {
    this.simulation = new Simulation({
      gameId: this.gameId,
      players: this.players,
      gameParams: this.gameParams,
      io: io,
      onDone: (scores) => this.onDone(scores)
    });
    
    for (const player of this.players) {
      player.socket.emit("initialize", "initialize");
    }
  }

  updateLobby(game) {
    for (const player of this.players) {
      player.socket.emit("updateLobby", this.getLobby());
      //player.socket.emit("updateLobby", "updateLobby");
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
  if (params && params.biomes) {
    _.each(params.biomes, (val, key) => params.biomes[key] = parseInt(val, 10));
  }
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
  if (game) {
    if (game.status === STATUS.LOBBY) {
      game.addPlayer(player);
      game.updateLobby(game);
      return q.resolve(game.getLobby());
    } else {
      return q.reject("Game in progress");
    }
  }
  return q.reject("Game not found");
}

function leave(gameId, player) {
  let game = _.find(games, { gameId: gameId });
  if (game) {
    game.removePlayer(player.playerId)
    game.updateLobby(game);
    return q.resolve("Left game");
  }
  return q.reject("Game not found");
}

function validateCreateGame(req, res, next) {
  if (_.find(games, { name: req.body.name })) {
    next("A game with that name already exists");
  }
  if (!req.body.name) {
    next("Game name is required");
  }
  if (!_.some(req.body.biomes, (val) => parseInt(val, 10))) {
    next("Game requires some biome");
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

games.push(new Game({
  name: "Game1",
  biomes: {
    desert: 25,
    forest: 50,
    plain: 50
  }
}));
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
