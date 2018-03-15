export default class Effect {
  constructor(params) {
    this.currentTime = 0;

    _.merge(this, params);
  }

  update(elapsedTime) {}
  render(elapsedTime) {}
}
