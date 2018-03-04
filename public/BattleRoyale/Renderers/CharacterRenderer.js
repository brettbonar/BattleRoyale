const imageSize = 64;

const ANIMATIONS = {
  MOVING_RIGHT: "movingRight",
  MOVING_LEFT: "movingLeft",
  MOVING_UP: "movingUp",
  MOVING_DOWN: "movingDown"
};

const ANIMATION_SETTINGS = {
  [ANIMATIONS.MOVING_RIGHT]: {
    offset: {
      x: 0,
      y: 11 * imageSize
    },
    frames: 9,
    rate: 5
  },
  [ANIMATIONS.MOVING_DOWN]: {
    offset: {
      x: 0,
      y: 10 * imageSize
    },
    frames: 9,
    rate: 5
  },
  [ANIMATIONS.MOVING_LEFT]: {
    offset: {
      x: 0,
      y: 9 * imageSize
    },
    frames: 9,
    rate: 5
  },
  [ANIMATIONS.MOVING_UP]: {
    offset: {
      x: 0,
      y: 8 * imageSize
    },
    frames: 9,
    rate: 5
  }
};

function getOffset(animation, frame) {
  let offset = ANIMATION_SETTINGS[animation].offset;
  return {
    x: offset.x + frame * imageSize,
    y: offset.y
  };
}

export default class CharacterRenderer {
  constructor(params) {
    Object.assign(this, params);

    this.animation = ANIMATIONS.MOVING_DOWN;
    this.frame = 0;
    this.currentTime = 0;
    this.initBody(params);
  }

  initBody(params) {
    this.body = new Image();
    this.body.src = "../../Assets/Universal-LPC-spritesheet-master/body/" + params.gender + "/" + params.body + ".png";
    this.body.onload = () => this.render = this._render;

    this.loadout = {};
    _.each(params.loadout, (path, type) => {
      this.loadout[type] = new Image();
      this.loadout[type].src = path;
    });
  }

  static get ANIMATIONS() { return ANIMATIONS; }

  setAnimation(animation) {
    if (this.animation !== animation) {
      this.animation = animation;
      this.frame = 0;
      this.currentTime = 0;
    }
  }

  _render(context, object, elapsedTime) {
    let pos = {
      x: object.position.x - imageSize / 2,
      y: object.position.y - imageSize
    }
    let offset = getOffset(this.animation, this.frame);

    context.drawImage(this.body, offset.x, offset.y, imageSize, imageSize,
      pos.x, pos.y, imageSize, imageSize);

    _.each(this.loadout, (image) => {
      if (image.complete) {
        context.drawImage(image, offset.x, offset.y, imageSize, imageSize,
          pos.x, pos.y, imageSize, imageSize);
      }
    });

    // DEBUG
    let box = object.boundingBox.box;
    context.strokeStyle = "magenta";
    context.strokeRect(box.ul.x, box.ul.y, object.width, object.height);

    let terrainBox = object.terrainBoundingBox.box;
    context.strokeStyle = "aqua";
    context.strokeRect(terrainBox.ul.x, terrainBox.ul.y,
      object.terrainDimensions.width, object.terrainDimensions.height);
  }

  render() {}

  update(elapsedTime) {
    if (this.animating) {
      let animationSettings = ANIMATION_SETTINGS[this.animation];
      this.currentTime += elapsedTime;
      while (this.currentTime > 1000 / animationSettings.rate) {
        this.currentTime -= 1000 / animationSettings.rate;
        this.frame = (this.frame + 1) % animationSettings.frames;
      }
    }
  }
}
