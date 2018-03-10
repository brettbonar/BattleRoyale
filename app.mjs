// TODO: figure out a way around this
import path from "path";
import express from "express";
import game from "./routes/game.mjs";
import http from "http";
import socketIo from "socket.io";
import clientSockets from "./clientSockets.mjs";

const app = express();
let server = http.Server(app);
let io = socketIo(server);
clientSockets(io);

server.listen(80);

app.use(express.static("public"));
app.use("/modules", express.static("modules"));
app.use("/extern", express.static("node_modules"));
app.use("/node_modules", express.static("node_modules"));
app.use("/game", game);
