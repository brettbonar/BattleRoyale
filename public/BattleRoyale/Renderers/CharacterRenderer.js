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
    cycleStart: 2,
    rate: 5
  },
  [ANIMATIONS.MOVING_DOWN]: {
    offset: {
      x: 0,
      y: 10 * imageSize
    },
    frames: 9,
    cycleStart: 2,
    rate: 5
  },
  [ANIMATIONS.MOVING_LEFT]: {
    offset: {
      x: 0,
      y: 9 * imageSize
    },
    frames: 9,
    cycleStart: 2,
    rate: 5
  },
  [ANIMATIONS.MOVING_UP]: {
    offset: {
      x: 0,
      y: 8 * imageSize
    },
    frames: 9,
    cycleStart: 2,
    rate: 5
  }
};

const LOADOUT_ORDER = {
  hands: 10,
  head: 9,
  weapon: 5,
  torso: 3,
  pants: 1,
  feet: 0
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
    this.direction = 1;
    this.initBody(params);
  }

  initBody(params) {
    this.body = new Image();
    this.body.src = "../../Assets/character/body/" + params.gender + "/" + params.body + ".png";
    this.body.onload = () => this.render = this._render;

    this.loadout = {};
    _.each(params.loadout, (path, type) => {
      this.loadout[type] = {
        image: new Image(),
        type: type
      };
      this.loadout[type].image.src = path;
    });
  }

  static get ANIMATIONS() { return ANIMATIONS; }

  setAnimation(animation) {
    if (this.animation !== animation) {
      this.animation = animation;
      this.frame = 0;
      this.currentTime = 0;
      this.direction = 1;
    }
  }

  drawLoadout(context, pos, offset) {
    let loadout = _.sortBy(this.loadout, (item) => {
      let order = LOADOUT_ORDER[item.type];
      // if (item.type === "weapon" && this.animation === ANIMATIONS.MOVING_RIGHT) {
      //   order = LOADOUT_ORDER.torso + 1;
      // }
      return order;
    });

    for (const item of loadout) {
      if (item.image.complete) {
        context.drawImage(item.image, offset.x, offset.y, imageSize, imageSize,
          pos.x, pos.y, imageSize, imageSize);
      }
    }    
  }

  _render(context, object, elapsedTime, center) {
    let pos = {
      x: object.position.x - imageSize / 2,
      y: object.position.y - imageSize
    }
    let offset = getOffset(this.animation, this.frame);

    context.drawImage(this.body, offset.x, offset.y, imageSize, imageSize,
      pos.x, pos.y, imageSize, imageSize);
    this.drawLoadout(context, pos, offset);

    // DEBUG
    // let box = object.boundingBox.box;
    // context.strokeStyle = "magenta";
    // context.strokeRect(box.ul.x, box.ul.y, object.width, object.height);

    // let terrainBox = object.terrainBoundingBox.box;
    // context.strokeStyle = "aqua";
    // context.strokeRect(terrainBox.ul.x, terrainBox.ul.y,
    //   object.terrainDimensions.width, object.terrainDimensions.height);
  }

  render() {}

  update(elapsedTime) {
    if (this.animating) {
      let animationSettings = ANIMATION_SETTINGS[this.animation];
      this.currentTime += elapsedTime;
      while (this.currentTime > 1000 / animationSettings.rate) {
        this.currentTime -= 1000 / animationSettings.rate;
        this.frame++;
        if (this.frame >= animationSettings.frames) {
          this.frame = animationSettings.cycleStart;
        }


        //this.frame += this.direction;
        // if (this.frame >= animationSettings.frames) {
        //   this.frame = animationSettings.frames - 2;
        //   this.direction = -1;
        // }

        // if (prevFrame === animationSettings.cycleStart && this.frame < animationSettings.cycleStart) {
        //   this.frame = animationSettings.cycleStart + 1;
        //   this.direction = 1;
        // }
        console.log(this.frame);
        //fthis.frame = ((this.frame + 1) % animationSettings.frames);
      }
    }
  }
}
