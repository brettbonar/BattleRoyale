const ANIMATIONS = {
  MOVE_UP: "movingUp",
  MOVE_LEFT: "movingLeft",
  MOVE_DOWN: "movingDown",
  MOVE_RIGHT: "movingRight",
  IDLE_UP: "idleUp",
  IDLE_LEFT: "idleLeft",
  IDLE_DOWN: "idleDown",
  IDLE_RIGHT: "idleRight",
  ATTACK_THRUST_UP: "attackThrustUp",
  ATTACK_THRUST_LEFT: "attackThrustLeft",
  ATTACK_THRUST_DOWN: "attackThrustDown",
  ATTACK_THRUST_RIGHT: "attackThrustRight",
  ATTACK_STAFF_UP: "attackSTAFFUp",
  ATTACK_STAFF_LEFT: "attackSTAFFLeft",
  ATTACK_STAFF_DOWN: "attackSTAFFDown",
  ATTACK_STAFF_RIGHT: "attackSTAFFRight",
  ATTACK_SLASH_UP: "attackSLASHUp",
  ATTACK_SLASH_LEFT: "attackSLASHLeft",
  ATTACK_SLASH_DOWN: "attackSLASHDown",
  ATTACK_SLASH_RIGHT: "attackSLASHRight",
  ATTACK_BOW_UP: "attackBowUp",
  ATTACK_BOW_LEFT: "attackBowLeft",
  ATTACK_BOW_DOWN: "attackBowDown",
  ATTACK_BOW_RIGHT: "attackBowRight",
  COOLDOWN_BOW_UP: "COOLDOWNBowUp",
  COOLDOWN_BOW_LEFT: "COOLDOWNBowLeft",
  COOLDOWN_BOW_DOWN: "COOLDOWNBowDown",
  COOLDOWN_BOW_RIGHT: "COOLDOWNBowRight",
  DEATH: "death"
};

const WEAPON_ANIMATIONS = {
  thrust: {
    up: ANIMATIONS.ATTACK_THRUST_UP,
    left: ANIMATIONS.ATTACK_THRUST_LEFT,
    down: ANIMATIONS.ATTACK_THRUST_DOWN,
    right: ANIMATIONS.ATTACK_THRUST_RIGHT
  },
  staff: {
    up: ANIMATIONS.ATTACK_STAFF_UP,
    left: ANIMATIONS.ATTACK_STAFF_LEFT,
    down: ANIMATIONS.ATTACK_STAFF_DOWN,
    right: ANIMATIONS.ATTACK_STAFF_RIGHT
  },
  slash: {
    up: ANIMATIONS.ATTACK_SLASH_UP,
    left: ANIMATIONS.ATTACK_SLASH_LEFT,
    down: ANIMATIONS.ATTACK_SLASH_DOWN,
    right: ANIMATIONS.ATTACK_SLASH_RIGHT
  },
  bow: {
    up: ANIMATIONS.ATTACK_BOW_UP,
    left: ANIMATIONS.ATTACK_BOW_LEFT,
    down: ANIMATIONS.ATTACK_BOW_DOWN,
    right: ANIMATIONS.ATTACK_BOW_RIGHT
  }
};

const MOVE_ANIMATIONS = {
  up: ANIMATIONS.MOVE_UP,
  left: ANIMATIONS.MOVE_LEFT,
  down: ANIMATIONS.MOVE_DOWN,
  right: ANIMATIONS.MOVE_RIGHT
};

const DEATH_ANIMATIONS = {
  up: ANIMATIONS.DEATH,
  down: ANIMATIONS.DEATH,
  left: ANIMATIONS.DEATH,
  right: ANIMATIONS.DEATH
};

const IDLE_ANIMATIONS = {
  up: ANIMATIONS.IDLE_UP,
  left: ANIMATIONS.IDLE_LEFT,
  down: ANIMATIONS.IDLE_DOWN,
  right: ANIMATIONS.IDLE_RIGHT
}

const ANIMATION_SETTINGS = {
  [ANIMATIONS.DEATH]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 20 * 64
    },
    frames: 6,
    framesPerSec: 6,
    repeat: false,
    forceAnimation: true
  },
  [ANIMATIONS.IDLE_UP]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 8 * 64
    },
    frames: 1
  },
  [ANIMATIONS.IDLE_LEFT]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 9 * 64
    },
    frames: 1
  },
  [ANIMATIONS.IDLE_DOWN]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 10 * 64
    },
    frames: 1
  },
  [ANIMATIONS.IDLE_RIGHT]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 11 * 64
    },
    frames: 1
  },
  [ANIMATIONS.MOVE_UP]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 64,
      y: 8 * 64
    },
    frames: 8,
    cycleStart: 0,
    framesPerSec: 7,
    repeat: true
  },
  [ANIMATIONS.MOVE_LEFT]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 64,
      y: 9 * 64
    },
    frames: 8,
    cycleStart: 0,
    framesPerSec: 7,
    repeat: true
  },
  [ANIMATIONS.MOVE_DOWN]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 64,
      y: 10 * 64
    },
    frames: 8,
    cycleStart: 0,
    framesPerSec: 7,
    repeat: true
  },
  [ANIMATIONS.MOVE_RIGHT]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 64,
      y: 11 * 64
    },
    frames: 8,
    cycleStart: 0,
    framesPerSec: 7,
    repeat: true
  },[ANIMATIONS.ATTACK_STAFF_UP]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 4 * 64
    },
    frames: 6,
    framesPerSec: 16,
    forceAnimation: true
  },
  [ANIMATIONS.ATTACK_STAFF_LEFT]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 5 * 64
    },
    frames: 6,
    framesPerSec: 16,
    forceAnimation: true
  },
  [ANIMATIONS.ATTACK_STAFF_DOWN]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 6 * 64
    },
    frames: 6,
    framesPerSec: 16,
    forceAnimation: true
  },
  [ANIMATIONS.ATTACK_STAFF_RIGHT]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 7 * 64
    },
    frames: 6,
    framesPerSec: 16,
    forceAnimation: true
  },
  [ANIMATIONS.ATTACK_THRUST_UP]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 4 * 64
    },
    frames: 8,
    cycleStart: 0,
    framesPerSec: 16,
    repeat: false,
    forceAnimation: true
  },
  [ANIMATIONS.ATTACK_THRUST_LEFT]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 5 * 64
    },
    frames: 8,
    cycleStart: 0,
    framesPerSec: 16,
    repeat: false,
    forceAnimation: true
  },
  [ANIMATIONS.ATTACK_THRUST_DOWN]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 6 * 64
    },
    frames: 8,
    cycleStart: 0,
    framesPerSec: 16,
    repeat: false,
    forceAnimation: true
  },
  [ANIMATIONS.ATTACK_THRUST_RIGHT]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 7 * 64
    },
    frames: 8,
    cycleStart: 0,
    framesPerSec: 16,
    repeat: false,
    forceAnimation: true
  },
  [ANIMATIONS.ATTACK_SLASH_UP]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 12 * 64
    },
    frames: 6,
    cycleStart: 0,
    framesPerSec: 16,
    repeat: false,
    forceAnimation: true
  },
  [ANIMATIONS.ATTACK_SLASH_LEFT]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 13 * 64
    },
    frames: 6,
    cycleStart: 0,
    framesPerSec: 16,
    repeat: false,
    forceAnimation: true
  },
  [ANIMATIONS.ATTACK_SLASH_DOWN]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 14 * 64
    },
    frames: 6,
    cycleStart: 0,
    framesPerSec: 16,
    repeat: false,
    forceAnimation: true
  },
  [ANIMATIONS.ATTACK_SLASH_RIGHT]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 15 * 64
    },
    frames: 6,
    cycleStart: 0,
    framesPerSec: 16,
    repeat: false,
    forceAnimation: true
  },

  [ANIMATIONS.ATTACK_BOW_UP]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 16 * 64
    },
    frames: 9,
    framesPerSec: 27,
    nextAnimation: ANIMATIONS.COOLDOWN_BOW_UP,
    forceAnimation: true
  },
  [ANIMATIONS.ATTACK_BOW_LEFT]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 17 * 64
    },
    frames: 9,
    framesPerSec: 27,
    nextAnimation: ANIMATIONS.COOLDOWN_BOW_LEFT,
    forceAnimation: true
  },
  [ANIMATIONS.ATTACK_BOW_DOWN]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 18 * 64
    },
    frames: 9,
    framesPerSec: 27,
    nextAnimation: ANIMATIONS.COOLDOWN_BOW_DOWN,
    forceAnimation: true
  },
  [ANIMATIONS.ATTACK_BOW_RIGHT]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 0,
      y: 19 * 64
    },
    frames: 9,
    framesPerSec: 27,
    nextAnimation: ANIMATIONS.COOLDOWN_BOW_RIGHT,
    forceAnimation: true
  },
  
  [ANIMATIONS.COOLDOWN_BOW_UP]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 578,
      y: 16 * 64
    },
    frames: 4,
    framesPerSec: 4,
    forceAnimation: true
  },
  [ANIMATIONS.COOLDOWN_BOW_LEFT]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 578,
      y: 17 * 64
    },
    frames: 4,
    framesPerSec: 4,
    forceAnimation: true
  },
  [ANIMATIONS.COOLDOWN_BOW_DOWN]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 578,
      y: 18 * 64
    },
    frames: 4,
    framesPerSec: 4,
    forceAnimation: true
  },
  [ANIMATIONS.COOLDOWN_BOW_RIGHT]: {
    dimensions: {
      width: 64,
      height: 64
    },
    offset: {
      x: 578,
      y: 19 * 64
    },
    frames: 4,
    framesPerSec: 4,
    forceAnimation: true
  }
};

let dimensions = {
  dimensions: {
    width: 64,
    height: 64,
    zheight: 64
  },
  collisionDimensions: [
    {
      offset: {
        x: 16,
        y: 44, // 64 - 20,
        z: 0
      },
      dimensions: {
        width: 32,
        height: 20,
        zheight: 44
      }
    }
  ],
  attackOrigin: {
    offset: {
      x: 16,
      y: 44,
      z: 20
    },
    dimensions: {
      width: 32,
      height: 20
    }
  },
  modelDimensions: {
    offset: {
      x: 16,
      y: 16
    },
    dimensions: {
      width: 32,
      height: 44,
      zheight: 44
    }
  }
};

export default {
  rendering: {
    damagedEffect: "blood",
    shadowImage: "/Assets/shadows/shadow24.png",
    bodyDimensions: {
      width: 64,
      height: 64
    },
    ANIMATIONS: ANIMATIONS,
    WEAPON_ANIMATIONS: WEAPON_ANIMATIONS,
    MOVE_ANIMATIONS: MOVE_ANIMATIONS,
    DEATH_ANIMATIONS: DEATH_ANIMATIONS,
    IDLE_ANIMATIONS: IDLE_ANIMATIONS,
    ANIMATION_SETTINGS: ANIMATION_SETTINGS
  },
  fov: {
    range: 1100,
    angle: 90
  },
  stats: {
    canInteract: true,
    canPickUp: true,
    maxHealth: 100,
    maxMana: 100,
    speed: 128,
    manaRegen: 4
  },
  dimensions: {
    up: dimensions,
    down: dimensions,
    left: dimensions,
    right: dimensions
  }
};
