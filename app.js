const path = require("path");
const express = require("express");
const app = express();
const game = require("./routes/game");

let server = require("http").Server(app);
let io = require("socket.io")(server);
require("./clientSockets")(io);

server.listen(80);

app.use(express.static("public"));
app.use("/public/libs", express.static("libs"));
app.use("/extern", express.static("node_modules"));
app.use("/game", game);
