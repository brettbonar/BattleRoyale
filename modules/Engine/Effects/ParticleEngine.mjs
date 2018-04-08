export default class EffectsEngine {
  constructor(params, grid) {
    _.merge(this, params);
    this.effects = [];
    this.grid = grid;
  }

  update(elapsedTime) {
    for (const effect of this.effects) {
      effect.update(elapsedTime);
      if (effect.done && _.isFunction(effect.onDone)) {
        effect.onDone(this);
        this.grid.remove(effect);
      }
    }

    _.remove(this.effects, "done");
  }

  getRenderObjects() {
    // TODO: pass in a position or bounding box to only get objects in area?
    // let objects = [];
    // for (const effect of this.effects) {
    //   objects = objects.concat(effect.renderObjects);
    // }
    // return objects;
    return this.effects;
  }

  // render(elapsedTime, center) {
  //   this.context.save();

  //   // if (center) {
  //   //   this.context.translate(-(center.x - this.context.canvas.width / 2), -(center.y - this.context.canvas.height / 2));
  //   // }

  //   for (const effect of this.effects) {
  //     effect.render(this.context, elapsedTime);
  //   }

  //   this.context.restore();
  // }

  addEffect(effect) {
    this.effects.push(effect);
    this.grid.add(effect);
  }
}
