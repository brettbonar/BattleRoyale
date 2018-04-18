const MIN_OPACITY = 0.2;
const MAX_OPACITY = 1.0;
const MIN_SPEED_MOD = 0.5;
const MAX_SPEED_MOD = 1.0;
const FADE_TIME = 4000;

export default class Prowl {
  constructor(params) {
    this.source = params.source;
    this.currentTime = params.elapsedTime || 0;
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;
    if (this.source.currentAction && this.source.currentAction.name === "prowl") {
      this.source.state.opacity = 1.0 + (MIN_OPACITY - MAX_OPACITY) * Math.min(1.0, (this.currentTime  / FADE_TIME));
      this.source.speed = this.source.baseSpeed +
        (this.source.baseSpeed * MIN_SPEED_MOD - this.source.baseSpeed * MAX_SPEED_MOD) * Math.min(1.0, (this.currentTime  / FADE_TIME));
    } else {
      this.currentTime = 0;
      this.source.state.opacity = 1.0;
      this.source.speed = this.source.baseSpeed;
      this.done = true;
    }
  }
}
