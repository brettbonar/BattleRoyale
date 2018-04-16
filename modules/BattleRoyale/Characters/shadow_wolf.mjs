import equipment from "../Objects/equipment.mjs"

const ANIMATIONS = {
  MOVE_UP: "movingUp",
  MOVE_LEFT: "movingLeft",
  MOVE_DOWN: "movingDown",
  MOVE_RIGHT: "movingRight",
  IDLE_UP: "idleUp",
  IDLE_LEFT: "idleLeft",
  IDLE_DOWN: "idleDown",
  IDLE_RIGHT: "idleRight",
  DEATH_UP: "death_up",
  DEATH_LEFT: "death_left",
  DEATH_DOWN: "death_down",
  DEATH_RIGHT: "death_right",
  ATTACK_UP: "attack_up",
  ATTACK_LEFT: "attack_left",
  ATTACK_DOWN: "attack_right",
  ATTACK_RIGHT: "attack_down",
  STEALTH_UP: "stealth_up",
  STEALTH_LEFT: "stealth_left",
  STEALTH_DOWN: "stealth_right",
  STEALTH_RIGHT: "stealth_down"
};

const MOVE_ANIMATIONS = {
  up: ANIMATIONS.MOVE_UP,
  left: ANIMATIONS.MOVE_LEFT,
  down: ANIMATIONS.MOVE_DOWN,
  right: ANIMATIONS.MOVE_RIGHT
};

const IDLE_ANIMATIONS = {
  up: ANIMATIONS.IDLE_UP,
  left: ANIMATIONS.IDLE_LEFT,
  down: ANIMATIONS.IDLE_DOWN,
  right: ANIMATIONS.IDLE_RIGHT
};

const STEALTH_ANIMATIONS = {
  up: ANIMATIONS.STEALTH_UP,
  left: ANIMATIONS.STEALTH_LEFT,
  down: ANIMATIONS.STEALTH_DOWN,
  right: ANIMATIONS.STEALTH_RIGHT
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
      height: 65
    },
    offset: {
      x: 0,
      y: 66
    },
    renderOffset: {
      y: -8,
      x: 16
    },
    frames: 4,
    framesPerSec: 10,
    forceAnimation: true
  },
  [ANIMATIONS.DEATH_RIGHT]: {
    dimensions: {
      width: 66,
      height: 33
    },
    offset: {
      x: 356,
      y: 0
    },
    renderOffset: {
      y: 16
    },
    frames: 4,
    framesPerSec: 10,
    forceAnimation: true
  },
  [ANIMATIONS.DEATH_UP]: {
    dimensions: {
      width: 32,
      height: 65
    },
    offset: {
      x: 160,
      y: 68
    },
    renderOffset: {
      y: -8,
      x: 16
    },
    frames: 4,
    framesPerSec: 10,
    forceAnimation: true
  },
  [ANIMATIONS.DEATH_LEFT]: {
    dimensions: {
      width: 66,
      height: 33
    },
    offset: {
      x: 356,
      y: 198
    },
    renderOffset: {
      y: 16
    },
    frames: 4,
    framesPerSec: 10,
    forceAnimation: true
  },
  [ANIMATIONS.MOVE_DOWN]: {
    dimensions: {
      width: 32,
      height: 66
    },
    offset: {
      x: 0,
      y: 197
    },
    renderOffset: {
      y: -8,
      x: 16
    },
    frames: 5,
    framesPerSec: 10,
    repeat: true
  },
  [ANIMATIONS.MOVE_RIGHT]: {
    dimensions: {
      width: 66,
      height: 33
    },
    offset: {
      x: 356,
      y: 130
    },
    renderOffset: {
      y: 16
    },
    frames: 5,
    framesPerSec: 10,
    repeat: true
  },
  [ANIMATIONS.MOVE_UP]: {
    dimensions: {
      width: 32,
      height: 66
    },
    offset: {
      x: 161,
      y: 197
    },
    renderOffset: {
      y: -8,
      x: 16
    },
    frames: 5,
    framesPerSec: 10,
    repeat: true
  },
  [ANIMATIONS.MOVE_LEFT]: {
    dimensions: {
      width: 66,
      height: 33
    },
    offset: {
      x: 356,
      y: 323
    },
    renderOffset: {
      y: 16
    },
    frames: 5,
    framesPerSec: 10,
    repeat: true
  },
  [ANIMATIONS.IDLE_DOWN]: {
    dimensions: {
      width: 32,
      height: 66
    },
    offset: {
      x: 0,
      y: 197
    },
    renderOffset: {
      y: -8,
      x: 16
    },
    frames: 1
  },
  [ANIMATIONS.IDLE_RIGHT]: {
    dimensions: {
      width: 66,
      height: 33
    },
    offset: {
      x: 356,
      y: 97
    },
    renderOffset: {
      y: 16
    },
    frames: 1
  },
  [ANIMATIONS.IDLE_UP]: {
    dimensions: {
      width: 32,
      height: 66
    },
    offset: {
      x: 161,
      y: 198
    },
    renderOffset: {
      y: -8,
      x: 16
    },
    frames: 1
  },
  [ANIMATIONS.IDLE_LEFT]: {
    dimensions: {
      width: 66,
      height: 33
    },
    offset: {
      x: 356,
      y: 290
    },
    renderOffset: {
      y: 16
    },
    frames: 1
  },

  [ANIMATIONS.ATTACK_DOWN]: {
    dimensions: {
      width: 32,
      height: 66
    },
    offset: {
      x: 0,
      y: 264
    },
    renderOffset: {
      y: -8,
      x: 16
    },
    frames: 5,
    framesPerSec: 10,
    forceAnimation: true
  },
  [ANIMATIONS.ATTACK_RIGHT]: {
    dimensions: {
      width: 66,
      height: 33
    },
    offset: {
      x: 356,
      y: 163
    },
    renderOffset: {
      y: 16
    },
    frames: 5,
    framesPerSec: 10,
    forceAnimation: true
  },
  [ANIMATIONS.ATTACK_UP]: {
    dimensions: {
      width: 32,
      height: 66
    },
    renderOffset: {
      y: -8,
      x: 16
    },
    offset: {
      x: 161,
      y: 260
    },
    frames: 5,
    framesPerSec: 10,
    forceAnimation: true
  },
  [ANIMATIONS.ATTACK_LEFT]: {
    dimensions: {
      width: 66,
      height: 33
    },
    offset: {
      x: 356,
      y: 357
    },
    renderOffset: {
      y: 16
    },
    frames: 5,
    framesPerSec: 10,
    forceAnimation: true
  }
};

let horizontalDimensions = {
  dimensions: {
    width: 64,
    height: 64,
    zheight: 32
  },
  collisionDimensions: [
    {
      offset: {
        x: 16,
        y: 20,
        z: 0
      },
      dimensions: {
        width: 32,
        height: 32,
        zheight: 16
      }
    }
  ],
  modelDimensions: {
    offset: {
      x: 16,
      y: 16
    },
    dimensions: {
      width: 64,
      height: 32,
      zheight: 32
    }
  }
};

let verticalDimensions = {
  dimensions: {
    width: 64,
    height: 64,
    zheight: 32
  },
  collisionDimensions: [
    {
      offset: {
        x: 16,
        y: 20,
        z: 0
      },
      dimensions: {
        width: 32,
        height: 32,
        zheight: 16
      }
    }
  ],
  modelDimensions: {
    offset: {
      x: 16,
      y: 16
    },
    dimensions: {
      width: 32,
      height: 64,
      zheight: 32
    }
  }
};

export default {
  rendering: {
    body: "/Assets/creatures/wolf/shadow_wolf.png",
    //shadowImage: "/Assets/shadows/shadow16.png",
    damagedEffect: "blood",
    statusBarOffset: {
      y: -8
    },
    ANIMATIONS: ANIMATIONS,
    MOVE_ANIMATIONS: MOVE_ANIMATIONS,
    ATTACK_ANIMATIONS: ATTACK_ANIMATIONS,
    IDLE_ANIMATIONS: IDLE_ANIMATIONS,
    ANIMATION_SETTINGS: ANIMATION_SETTINGS,
    DEATH_ANIMATIONS: DEATH_ANIMATIONS
  },
  fov: {
    range: 1300,
    angle: 120
  },
  stats: {
    maxHealth: 30,
    speed: 128,
    canInteract: false,
    loadout: {
      weapon: "shadow_wolf"
    }
  },
  dimensions: {
    up: verticalDimensions,
    right: horizontalDimensions,
    down: verticalDimensions,
    left: horizontalDimensions
  }
};
