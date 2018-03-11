export default class EffectsEngine {
  constructor(params) {
    Object.assign(this, params);
    this.effects = [];
  }

  update(elapsedTime) {
    for (const effect of this.effects) {
      effect.update(elapsedTime);
      if (effect.done && _.isFunction(effect.onDone)) {
        effect.onDone(this);
      }
    }

    _.remove(this.effects, "done");
  }

  render(elapsedTime, center) {
    this.context.save();

    if (center) {
      this.context.translate(-(center.x - this.context.canvas.width / 2), -(center.y - this.context.canvas.height / 2));
    }

    for (const effect of this.effects) {
      effect.render(this.context, elapsedTime);
    }

    this.context.restore();
  }

  addEffect(effect) {
    this.effects.push(effect);
  }
}
