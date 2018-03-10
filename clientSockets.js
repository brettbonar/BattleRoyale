let io;

function create(socket) {
  io = socket;

  io.on("connection", (socket) => {
    socket.emit("test");
    console.log("test");
  });
}

module.exports = create;
