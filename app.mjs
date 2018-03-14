// TODO: figure out a way around this
import path from "path"
import express from "express"
import games from "./routes/games.mjs"
import http from "http"
import socketIo from "socket.io"
//import clientSockets from "./clientSockets.mjs"
import session from "express-session"
import { initSockets } from "./libs/Game/Games.mjs"

const app = express();
let server = http.Server(app);
let io = socketIo(server);
initSockets(io);

server.listen(3000);

app.use(session({
  name: 'server-session-cookie-id',
  secret: 'my express secret',
  saveUninitialized: true,
  resave: true  
}));

app.use(express.static("public"));
app.use("/modules", express.static("modules"));
app.use("/extern", express.static("node_modules"));
app.use("/node_modules", express.static("node_modules"));
app.use("/games", games);

app.use(function (error, req, res, next) {
  res.status(400).send(error);
});
