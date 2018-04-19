import equipment from "../Objects/equipment.mjs"

const ANIMATIONS = {
  MOVE_UP: "movingUp",
  MOVE_LEFT: "movingLeft",
  MOVE_DOWN: "movingDown",
  MOVE_RIGHT: "movingRight",
  DEATH_UP: "death_up",
  DEATH_LEFT: "death_left",
  DEATH_DOWN: "death_down",
  DEATH_RIGHT: "death_right",
  ATTACK_UP: "attack_up",
  ATTACK_LEFT: "attack_left",
  ATTACK_DOWN: "attack_right",
  ATTACK_RIGHT: "attack_down",
  COOLDOWN_ATTACK_UP: "cooldown_attack_up",
  COOLDOWN_ATTACK_LEFT: "cooldown_attack_left",
  COOLDOWN_ATTACK_DOWN: "cooldown_attack_right",
  COOLDOWN_ATTACK_RIGHT: "cooldown_attack_down",
};

const MOVE_ANIMATIONS = {
  up: ANIMATIONS.MOVE_UP,
  left: ANIMATIONS.MOVE_LEFT,
  down: ANIMATIONS.MOVE_DOWN,
  right: ANIMATIONS.MOVE_RIGHT
};

const DEATH_ANIMATIONS = {
  up: ANIMATIONS.DEATH_UP,
  left: ANIMATIONS.DEATH_LEFT,
  down: ANIMATIONS.DEATH_DOWN,
  right: ANIMATIONS.DEATH_RIGHT
};

const ATTACK_ANIMATIONS = {
  up: ANIMATIONS.ATTACK_UP,
  left: ANIMATIONS.ATTACK_LEFT,
  down: ANIMATIONS.ATTACK_DOWN,
  right: ANIMATIONS.ATTACK_RIGHT
};

const ANIMATION_SETTINGS = {
  [ANIMATIONS.DEATH_DOWN]: {
    dimensions: {
      width: 32,
      height: 32
    },
    offset: {
      x: 0,
      y: 0
    },
    frames: 1,
    forceAnimation: true
  },
  [ANIMATIONS.DEATH_RIGHT]: {
    dimensions: {
      width: 32,
      height: 32
    },
    offset: {
      x: 0,
      y: 32
    },
    frames: 1,
    forceAnimation: true
  },
  [ANIMATIONS.DEATH_UP]: {
    dimensions: {
      width: 32,
      height: 32
    },
    offset: {
      x: 0,
      y: 64
    },
    frames: 1,
    forceAnimation: true
  },
  [ANIMATIONS.DEATH_LEFT]: {
    dimensions: {
      width: 32,
      height: 32
    },
    offset: {
      x: 0,
      y: 96
    },
    frames: 1,
    forceAnimation: true
  },
  [ANIMATIONS.MOVE_DOWN]: {
    dimensions: {
      width: 32,
      height: 32
    },
    offset: {
      x: 32,
      y: 0
    },
    frames: 3,
    framesPerSec: 12,
    repeat: true
  },
  [ANIMATIONS.MOVE_RIGHT]: {
    dimensions: {
      width: 32,
      height: 32
    },
    offset: {
      x: 32,
      y: 32
    },
    frames: 3,
    framesPerSec: 12,
    repeat: true
  },
  [ANIMATIONS.MOVE_UP]: {
    dimensions: {
      width: 32,
      height: 32
    },
    offset: {
      x: 32,
      y: 64
    },
    frames: 3,
    framesPerSec: 12,
    repeat: true
  },
  [ANIMATIONS.MOVE_LEFT]: {
    dimensions: {
      width: 32,
      height: 32
    },
    offset: {
      x: 32,
      y: 96
    },
    frames: 3,
    framesPerSec: 12,
    repeat: true
  },
  [ANIMATIONS.ATTACK_DOWN]: {
    dimensions: {
      width: 32,
      height: 32
    },
    offset: {
      x: 0,
      y: 128
    },
    frames: 6,
    framesPerSec: 18,
    forceAnimation: true,
    nextAnimation: ANIMATIONS.COOLDOWN_ATTACK_DOWN,
  },
  [ANIMATIONS.ATTACK_RIGHT]: {
    dimensions: {
      width: 32,
      height: 32
    },
    offset: {
      x: 0,
      y: 160
    },
    frames: 6,
    framesPerSec: 18,
    forceAnimation: true,
    nextAnimation: ANIMATIONS.COOLDOWN_ATTACK_RIGHT,
  },
  [ANIMATIONS.ATTACK_UP]: {
    dimensions: {
      width: 32,
      height: 32
    },
    offset: {
      x: 0,
      y: 192
    },
    frames: 6,
    framesPerSec: 18,
    forceAnimation: true,
    nextAnimation: ANIMATIONS.COOLDOWN_ATTACK_UP,
  },
  [ANIMATIONS.ATTACK_LEFT]: {
    dimensions: {
      width: 32,
      height: 32
    },
    offset: {
      x: 0,
      y: 224
    },
    frames: 6,
    framesPerSec: 18,
    forceAnimation: true,
    nextAnimation: ANIMATIONS.COOLDOWN_ATTACK_LEFT,
  },
  [ANIMATIONS.COOLDOWN_ATTACK_DOWN]: {
    dimensions: {
      width: 32,
      height: 32
    },
    offset: {
      x: 192,
      y: 128
    },
    frames: 2,
    framesPerSec: 24,
    forceAnimation: true
  },
  [ANIMATIONS.COOLDOWN_ATTACK_RIGHT]: {
    dimensions: {
      width: 32,
      height: 32
    },
    offset: {
      x: 192,
      y: 160
    },
    frames: 2,
    framesPerSec: 24,
    forceAnimation: true
  },
  [ANIMATIONS.COOLDOWN_ATTACK_UP]: {
    dimensions: {
      width: 32,
      height: 32
    },
    offset: {
      x: 192,
      y: 192
    },
    frames: 2,
    framesPerSec: 24,
    forceAnimation: true
  },
  [ANIMATIONS.COOLDOWN_ATTACK_LEFT]: {
    dimensions: {
      width: 32,
      height: 32
    },
    offset: {
      x: 192,
      y: 224
    },
    frames: 2,
    framesPerSec: 24,
    forceAnimation: true
  }
};

let dimensions = {
  dimensions: {
    width: 32,
    height: 32,
    zheight: 32
  },
  collisionDimensions: [
    {
      offset: {
        x: 0,
        y: 0,
        z: 0
      },
      dimensions: {
        width: 32,
        height: 32,
        zheight: 32
      }
    }
  ],
  modelDimensions: {
    offset: {
      x: 0,
      y: 0
    },
    dimensions: {
      width: 32,
      height: 32,
      zheight: 32
    }
  }
};

export default {
  rendering: {
    body: "/Assets/creatures/shadow_bat.png",
    shadowImage: "/Assets/shadows/shadow16.png",
    damagedEffect: "blood",
    ANIMATIONS: ANIMATIONS,
    MOVE_ANIMATIONS: MOVE_ANIMATIONS,
    ATTACK_ANIMATIONS: ATTACK_ANIMATIONS,
    IDLE_ANIMATIONS: MOVE_ANIMATIONS,
    ANIMATION_SETTINGS: ANIMATION_SETTINGS,
    DEATH_ANIMATIONS: DEATH_ANIMATIONS
  },
  fov: {
    range: 1300,
    angle: 360
  },
  stats: {
    canFly: true,
    canInteract: false,
    maxAltitude: 512,
    maxHealth: 10,
    speed: 192,
    loadout: {
      weapon: "shadow_bat"
    }
  },
  dimensions: {
    up: dimensions,
    right: dimensions,
    down: dimensions,
    left: dimensions
  }
};
