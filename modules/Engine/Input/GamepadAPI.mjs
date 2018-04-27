import Controller from "./Controller.mjs"

class GamepadAPI {
  constructor() {
    if (typeof window !== "undefined" && window) {
      window.addEventListener("gamepadconnected", this.connect);
      window.addEventListener("gamepaddisconnected", this.disconnect);

      this.gamepads = {};
    }
  }

  connect(event) {
    gamepads[event.gamepad.index] = event.gamepad;
    console.log("Gamepad connected", event.gamepad);
  }

  disconnect(event) {
    console.log("Gamepad disconnected from index %d: %s",
      event.gamepad.index, event.gamepad.id);
    //_.remove(this.controllers, (gamepad) => gamepad.index === event.gamepad.index);
  }
}

let gamepadAPI = new GamepadAPI();

export default gamepadAPI;
