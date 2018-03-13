const imageSize = 64;

export const STATE = {
  IDLE: "idle",
  MOVING: "moving",
  ATTACKING: "attacking",
};

const ANIMATIONS = {
  MOVE_UP: "movingUp",
  MOVE_LEFT: "movingLeft",
  MOVE_DOWN: "movingDown",
  MOVE_RIGHT: "movingRight",
  ATTACK_THRUST_UP: "attackThrustUp",
  ATTACK_THRUST_LEFT: "attackThrustLeft",
  ATTACK_THRUST_DOWN: "attackThrustDown",
  ATTACK_THRUST_RIGHT: "attackThrustRight",
  DEATH: "death"
};

const WEAPON_ANIMATIONS = {
  thrust: {
    up: ANIMATIONS.ATTACK_THRUST_UP,
    left: ANIMATIONS.ATTACK_THRUST_LEFT,
    down: ANIMATIONS.ATTACK_THRUST_DOWN,
    right: ANIMATIONS.ATTACK_THRUST_RIGHT
  }
};

const MOVE_ANIMATIONS = {
  up: ANIMATIONS.MOVE_UP,
  left: ANIMATIONS.MOVE_LEFT,
  down: ANIMATIONS.MOVE_DOWN,
  right: ANIMATIONS.MOVE_RIGHT
};

const ANIMATION_SETTINGS = {
  [ANIMATIONS.DEATH]: {
    offset: {
      x: 0,
      y: 20
    },
    frames: 6,
    framesPerSec: 6,
    repeat: false
  },
  [ANIMATIONS.MOVE_UP]: {
    offset: {
      x: 0,
      y: 8
    },
    frames: 9,
    cycleStart: 2,
    framesPerSec: 7,
    repeat: true
  },
  [ANIMATIONS.MOVE_LEFT]: {
    offset: {
      x: 0,
      y: 9
    },
    frames: 9,
    cycleStart: 2,
    framesPerSec: 7,
    repeat: true
  },
  [ANIMATIONS.MOVE_DOWN]: {
    offset: {
      x: 0,
      y: 10
    },
    frames: 9,
    cycleStart: 2,
    framesPerSec: 7,
    repeat: true
  },
  [ANIMATIONS.MOVE_RIGHT]: {
    offset: {
      x: 0,
      y: 11
    },
    frames: 9,
    cycleStart: 2,
    framesPerSec: 7,
    repeat: true
  },
  [ANIMATIONS.ATTACK_THRUST_UP]: {
    offset: {
      x: 0,
      y: 4
    },
    frames: 8,
    cycleStart: 0,
    framesPerSec: 4,
    repeat: true
  },
  [ANIMATIONS.ATTACK_THRUST_LEFT]: {
    offset: {
      x: 0,
      y: 5
    },
    frames: 8,
    cycleStart: 0,
    framesPerSec: 4,
    repeat: true
  },
  [ANIMATIONS.ATTACK_THRUST_DOWN]: {
    offset: {
      x: 0,
      y: 6
    },
    frames: 8,
    cycleStart: 0,
    framesPerSec: 4,
    repeat: true
  },
  [ANIMATIONS.ATTACK_THRUST_RIGHT]: {
    offset: {
      x: 0,
      y: 7
    },
    frames: 8,
    cycleStart: 0,
    framesPerSec: 4,
    repeat: true
  }
};

const LOADOUT_ORDER = {
  hands: 10,
  head: 9,
  weapon: 5,
  torso: 3,
  legs: 1,
  feet: 0
};

function getOffset(animation, frame, imageSize) {
  let offset = ANIMATION_SETTINGS[animation].offset;
  return {
    x: offset.x + frame * imageSize,
    y: offset.y * imageSize
  };
}

export default class CharacterRenderer {
  constructor(params) {
    Object.assign(this, params);

    this.animation = ANIMATIONS.MOVE_DOWN;
    this.frame = 0;
    this.currentTime = 0;
    this.framesPerSec = 0;
    this.initBody(params);
  }

  initBody(params) {
    this.body = new Image();
    this.body.src = "../../Assets/character/body/" + params.gender + "/" + params.body + ".png";
    this.body.onload = () => this.render = this._render;

    this.loadout = params.loadout;
    _.each(params.loadout, (piece) => {
      piece.image = new Image();
      piece.image.src = piece.imageSource;
    });
  }

  static get ANIMATIONS() { return ANIMATIONS; }
  static get WEAPON_ANIMATIONS() { return WEAPON_ANIMATIONS; }
  static get MOVE_ANIMATIONS() { return MOVE_ANIMATIONS; }

  static drawStatusBars(context, object) {
    let barHeight = 4;

    let offset = {
      x: object.position.x - object.modelDimensions.width / 2,
      y: object.position.y - object.modelDimensions.height
    };

    if (object.hasMana) {
      context.fillStyle = "blue";
      context.strokeStyle = "black";
      context.fillRect(offset.x, offset.y,
        Math.max(0, object.width * (object.currentMana / object.maxMana)), barHeight);
      context.strokeRect(offset.x, offset.y, object.width, barHeight);
      offset.y -= (barHeight + 4);
    }

    if (object.hasHealth) {
      context.fillStyle = "red";
      context.strokeStyle = "black";
      context.fillRect(offset.x, offset.y,
        Math.max(0, object.width * (object.currentHealth / object.maxHealth)), barHeight);
      context.strokeRect(offset.x, offset.y, object.width, barHeight);
    }
  }

  setAnimation(animation, time) {
    if (this.animation !== animation) {
      this.animation = animation;
      this.frame = 0;
      this.currentTime = 0;
      if (time) {
        this.framesPerSec = ANIMATION_SETTINGS[animation].frames / (time / 1000);
      } else {
        this.framesPerSec = ANIMATION_SETTINGS[animation].framesPerSec;
      }
    }
  }

  drawLoadout(context, object) {
    let loadout = _.sortBy(this.loadout, (item) => {
      let order = LOADOUT_ORDER[item.type];
      // if (item.type === "weapon" && this.animation === ANIMATIONS.MOVE_RIGHT) {
      //   order = LOADOUT_ORDER.torso + 1;
      // }
      return order;
    });

    for (const item of loadout) {
      if (item.image.complete) {
        let pos = {
          x: object.position.x - item.imageSize / 2,
          y: object.position.y - imageSize / 2 - item.imageSize / 2
        }
        let offset = getOffset(this.animation, this.frame, item.imageSize);
        context.drawImage(item.image, offset.x, offset.y, item.imageSize, item.imageSize,
          pos.x, pos.y, item.imageSize, item.imageSize);
      }
    }
  }

  _render(context, object, elapsedTime, center) {
    let pos = {
      x: object.position.x - imageSize / 2,
      y: object.position.y - imageSize
    }
    let offset = getOffset(this.animation, this.frame, imageSize);

    context.drawImage(this.body, offset.x, offset.y, imageSize, imageSize,
      pos.x, pos.y, imageSize, imageSize);
    this.drawLoadout(context, object);

    if (!this.dead && !this.isOtherPlayer) {
      CharacterRenderer.drawStatusBars(context, object);
    }

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
      while (this.currentTime > 1000 / this.framesPerSec) {
        this.currentTime -= 1000 / this.framesPerSec;
        console.log(this.frame);
        this.frame++;
        if (this.frame >= animationSettings.frames) {
          if (animationSettings.repeat) {
            this.frame = animationSettings.cycleStart || 0;
          } else {
            this.frame = animationSettings.frames - 1;
          }
        }
      }
    }
  }
}
