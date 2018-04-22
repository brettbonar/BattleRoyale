function listGames() {
  return $.get("games");
}

function getMaps(gameId) {
  return $.get("games/" + gameId + "/maps");
}

function getObjects(gameId) {
  return $.get("games/" + gameId + "/objects");
}

function getLobby(gameId) {
  return $.get("games/" + gameId + "/lobby");
}

function getScores(gameId) {
  return $.get("users/scores");
}

function joinGame(gameId, player) {
  return $.ajax({
    url: "games/" + gameId + "/join", 
    type: "POST", 
    contentType: "application/json", 
    data: JSON.stringify(player)
  });
}

function leaveGame(gameId, player) {
  return $.ajax({
    url: "games/" + gameId + "/leave", 
    type: "POST", 
    contentType: "application/json", 
    data: JSON.stringify(player)
  });
}

function createGame(params) {
  return $.ajax({
    url: "games/create", 
    type: "POST", 
    contentType: "application/json", 
    data: JSON.stringify(params)
  });
}

function register(params) {
  return $.ajax({
    url: "users/register", 
    type: "POST", 
    contentType: "application/json", 
    data: JSON.stringify(params)
  });
}

function login(params) {
  return $.ajax({
    url: "users/login", 
    type: "POST", 
    contentType: "application/json", 
    data: JSON.stringify(params)
  });
}

export {
  getMaps,
  getObjects,
  getLobby,
  getScores,
  listGames,
  leaveGame,
  joinGame,
  createGame,
  register,
  login
}
