let io;

function create(socket) {
  io = socket;

  io.on("connection", (socket) => {
    socket.emit("test");
  });
}

//module.exports = create;
export default create;
