import { drawShadow } from "../../Engine/Rendering/renderUtils.mjs";
import Dimensions from "../../Engine/GameObject/Dimensions.mjs"

const imageSize = 64;

export const STATE = {
  IDLE: "idle",
  MOVING: "moving",
  ATTACKING: "attacking",
  DEAD: "dead"
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
  ATTACK_SLASH_UP: "attackSLASHUp",
  ATTACK_SLASH_LEFT: "attackSLASHLeft",
  ATTACK_SLASH_DOWN: "attackSLASHDown",
  ATTACK_SLASH_RIGHT: "attackSLASHRight",
  DEATH: "death"
};

const WEAPON_ANIMATIONS = {
  thrust: {
    up: ANIMATIONS.ATTACK_THRUST_UP,
    left: ANIMATIONS.ATTACK_THRUST_LEFT,
    down: ANIMATIONS.ATTACK_THRUST_DOWN,
    right: ANIMATIONS.ATTACK_THRUST_RIGHT
  },
  slash: {
    up: ANIMATIONS.ATTACK_SLASH_UP,
    left: ANIMATIONS.ATTACK_SLASH_LEFT,
    down: ANIMATIONS.ATTACK_SLASH_DOWN,
    right: ANIMATIONS.ATTACK_SLASH_RIGHT
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
    framesPerSec: 16,
    repeat: false
  },
  [ANIMATIONS.ATTACK_THRUST_LEFT]: {
    offset: {
      x: 0,
      y: 5
    },
    frames: 8,
    cycleStart: 0,
    framesPerSec: 16,
    repeat: false
  },
  [ANIMATIONS.ATTACK_THRUST_DOWN]: {
    offset: {
      x: 0,
      y: 6
    },
    frames: 8,
    cycleStart: 0,
    framesPerSec: 16,
    repeat: false
  },
  [ANIMATIONS.ATTACK_THRUST_RIGHT]: {
    offset: {
      x: 0,
      y: 7
    },
    frames: 8,
    cycleStart: 0,
    framesPerSec: 16,
    repeat: false
  },
  [ANIMATIONS.ATTACK_SLASH_UP]: {
    offset: {
      x: 0,
      y: 12
    },
    frames: 6,
    cycleStart: 0,
    framesPerSec: 16,
    repeat: false
  },
  [ANIMATIONS.ATTACK_SLASH_LEFT]: {
    offset: {
      x: 0,
      y: 13
    },
    frames: 6,
    cycleStart: 0,
    framesPerSec: 16,
    repeat: false
  },
  [ANIMATIONS.ATTACK_SLASH_DOWN]: {
    offset: {
      x: 0,
      y: 14
    },
    frames: 6,
    cycleStart: 0,
    framesPerSec: 16,
    repeat: false
  },
  [ANIMATIONS.ATTACK_SLASH_RIGHT]: {
    offset: {
      x: 0,
      y: 15
    },
    frames: 6,
    cycleStart: 0,
    framesPerSec: 16,
    repeat: false
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
    _.merge(this, params);

    this.animation = ANIMATIONS.MOVE_DOWN;
    this.prevAnimation = ANIMATIONS.MOVE_DOWN;
    this.frame = 0;
    this.currentTime = 0;
    this.currentAnimationTime = 0;
    this.framesPerSec = 0;
    this.initBody(params);

    // Dimensions of the actual model within the image
    _.defaults(this, {
      modelDimensions: {
        offset: {
          x: 16,
          y: 16
        },
        dimensions: new Dimensions({
          width: 32,
          height: 44,
          zheight: 44
        })
      }
    });
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
      x: object.position.x + object.width / 4,
      y: object.position.y - object.position.z
    };

    if (object.state.hasMana) {
      context.fillStyle = "blue";
      context.strokeStyle = "black";
      context.fillRect(offset.x, offset.y,
        Math.max(0, (object.width / 2) * (object.state.currentMana / object.state.maxMana)), barHeight);
      context.strokeRect(offset.x, offset.y, object.width / 2, barHeight);
      offset.y -= (barHeight + 4);
    }

    if (object.state.hasHealth) {
      context.fillStyle = "red";
      context.strokeStyle = "black";
      context.fillRect(offset.x, offset.y,
        Math.max(0, (object.width / 2) * (object.state.currentHealth / object.state.maxHealth)), barHeight);
      context.strokeRect(offset.x, offset.y, object.width / 2, barHeight);
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
        let offset = getOffset(this.animation, this.frame, item.imageSize);
        context.drawImage(item.image, offset.x, offset.y, item.imageSize, item.imageSize,
          object.position.x, object.position.y - object.position.z, item.imageSize, item.imageSize);
      }
    }
  }

  _render(context, object, elapsedTime, center) {
    let offset = getOffset(this.animation, this.frame, imageSize);

    if (object.position.z > 0) {
      drawShadow(context, object, this.modelDimensions);
    }

    context.drawImage(this.body, offset.x, offset.y, imageSize, imageSize,
      object.position.x, object.position.y - object.position.z, imageSize, imageSize);
    this.drawLoadout(context, object);

    if (this.state !== STATE.DEAD && !object.isOtherPlayer) {
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

  setAnimation(elapsedTime, object) {
    this.currentAnimationTime += elapsedTime;
    let currentAction = object.currentAction || object.latestAction;
    // We may start and finish an action within a frame, make sure we still animate it
    if (currentAction) {
      this.currentAction = currentAction;
      this.currentAnimationTime = 0;
      // if (currentAction.name !== (this.currentAction && this.currentAction.name)) {
      //   this.currentAction = currentAction;
      //   this.currentAnimationTime = 0;
      // }
    }

    this.prevAnimation = this.animation;
    this.prevState = this.state;

    if (object.state.dead) {
      this.state = STATE.DEAD;
      this.animation = ANIMATIONS.DEATH;
    } else if (this.currentAction && this.currentAction.type === "attack") {
      this.state = STATE.ATTACKING;
      this.animation = WEAPON_ANIMATIONS[object.state.loadout.weapon.attackType][object.state.characterDirection];
      this.animationDuration = Math.max(this.currentAction.actionDuration, 250);
    } else if (object.direction.x || object.direction.y) {
      this.state = STATE.MOVING;
      this.animation = MOVE_ANIMATIONS[object.state.characterDirection];
    } else {
      this.state = STATE.IDLE;
      this.animation = MOVE_ANIMATIONS[object.state.characterDirection];
    }

    if (this.state !== this.prevState) {
      this.frame = 0;
      this.currentTime = 0;
      if (this.animationDuration) {
        this.framesPerSec = ANIMATION_SETTINGS[this.animation].frames / (this.animationDuration / 1000);
      } else {
        this.framesPerSec = ANIMATION_SETTINGS[this.animation].framesPerSec;
      }
    }

    if (this.currentAction && this.currentAnimationTime >= this.animationDuration) {
      this.currentAction = null;
      this.animationDuration = 0;
    }
  }

  update(elapsedTime, object) {
    this.setAnimation(elapsedTime, object);
    if (this.state !== STATE.IDLE) {
      let animationSettings = ANIMATION_SETTINGS[this.animation];
      this.currentTime += elapsedTime;
      while (this.currentTime >= 1000 / this.framesPerSec) {
        this.currentTime -= 1000 / this.framesPerSec;
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
