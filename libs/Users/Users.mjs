import JsonDB from "node-json-db"
import bcrypt from "bcrypt"
import q from "q"
import uuid from "uuid/v4"

const saltRounds = 10;
const DB_ROOT = "/";

let db = new JsonDB("database/users", true, true);

function register(data) {
  return bcrypt.hash(data.password, saltRounds).then((hash) => {
    db.push(DB_ROOT + data.username, {
      password: hash,
      username: data.username,
      kills: 0,
      wins: 0,
      losses: 0,
      id: uuid()
    });

    return true;
  });
}

function updateScores(scores) {
  for (const score of scores) {
    let playerName = this.getPlayerName(score.playerId);
    let player = db.getData(DB_ROOT + playerName);
    if (player) {
      player.kills += score.kills;
      if (score.won) {
        player.wins++;
      } else {
        player.losses++;
      }

      db.push(DB_ROOT + playerName, player);
    }
  }
}

function login(data) {
  let user = db.getData(DB_ROOT + data.username);
  return bcrypt.compare(data.password, user.password).then((result) => {
    if (result) {
      return user.id;
    }
    throw "Invalid password";
  });
}

function validateLogin(req, res, next) {
  let user;
  try {
    user = db.getData(DB_ROOT + req.body.username);
  } catch (er) {
    return next("Invalid username/password");
  }

  bcrypt.compare(req.body.password, user.password).then((result) => {
    if (result) {
      next();
    } else {
      next("Invalid username/password");
    }
  });
}

function validateRegister(req, res, next) {
  let user;

  if (!req.body.username) {
    return next("Username required");
  }

  if (!req.body.password) {
    return next("Password required");
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next("Passwords don't match");
  }

  try {
    user = db.getData(DB_ROOT + req.body.username);
  } catch (er) {
    return next();
  }
  next("Username taken");
}

function getPlayerName(playerId) {
  let users = db.getData(DB_ROOT);
  let user = _.find(users, { id: playerId });
  return user && user.username;
}

function getScores() {
  let users = db.getData(DB_ROOT);
  let scores =_.map(users, (user) => {
    return {
      kills: user.kills,
      wins: user.wins,
      losses: user.losses,
      playerId: user.id,
      playerName: user.username
    };
  });

  return q.resolve(scores);
}

export {
  updateScores,
  getScores,
  getPlayerName,
  register,
  login,
  validateRegister,
  validateLogin
}
