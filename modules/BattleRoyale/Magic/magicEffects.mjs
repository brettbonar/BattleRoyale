
let magicEffects = {
  fireLion: {
    type: "magic",
    name: "fireLion",
    dimensions: {
      width: 128,
      height: 128,
      zheight: 128
    },
    rendering: {
      images: {
        up: {
          imageSource: "/Assets/magic/firelion_up.png"
        },
        down: {
          imageSource: "/Assets/magic/firelion_down.png"
        },
        left: {
          imageSource: "/Assets/magic/firelion_left.png"
        },
        right: {
          imageSource: "/Assets/magic/firelion_right.png"
        }
      },
      imageSize: 128,
      frames: 16,
      framesPerSec: 16,
      repeat: false
    },
    effect: {
      renderingDelay: 0,
      damageDelay: 0,
      duration: 1000,
      punchThrough: true,
      //aoe: 64,
      damage: 15,
      collisionDimensions: [{
        offset: {
          x: 32,
          y: 32
        },
        dimensions: {
          width: 96,
          height: 96,
          zheight: 96
        }
      }],
      physics: {
        solidity: 0
      }
    }
  },
  snake: {
    rendering: {
      images: {
        up: {
          imageSource: "/Assets/magic/snakebite_up.png",
          offset: {
            x: 8,
            y: 48
          }
        },
        down: {
          imageSource: "/Assets/magic/snakebite_down.png",
          offset: {
            x: 8,
            y: 48
          }
        },
        left: {
          imageSource: "/Assets/magic/snakebite_side.png",
          offset: {
            x: -24,
            y: 48
          }
        },
        right: {
          imageSource: "/Assets/magic/snake_right.png",
          offset: {
            x: 24,
            y: 48
          }
        }
      },
      imageSize: 128,
      frames: 16,
      framesPerSec: 16
    },
    effect: {
      renderingDelay: 0,
      damageDelay: 1000,
      duration: 1000,
      aoe: 32,
      damage: 20
      // additional status effects
    }
  },
  icetacle: {
    rendering: {
      image: {
        imageSource: "/Assets/magic/icetacle.png",
        offset: {
          x: 10,
          y: 38
        }
      },
      imageSize: 128,
      frames: 16,
      framesPerSec: 16
    },
    effect: {
      renderingDelay: 0,
      damageDelay: 1000,
      duration: 1000,
      damage: 20,
      collisionDimensions: [{
        offset: {
          x: 32,
          y: 32
        },
        dimensions: {
          width: 96,
          height: 96,
          zheight: 96
        }
      }],
      physics: {
        solidity: 0
      }
    }
  },
  torrentacle: {
    type: "magic",
    name: "torrentacle",
    rendering: {
      image: {
        imageSource: "/Assets/magic/torrentacle.png",
        offset: {
          x: 10,
          y: 38
        }
      },
      imageSize: 128,
      frames: 16,
      framesPerSec: 16
    },
    dimensions: {
      width: 128,
      height: 128,
      zheight: 128
    },
    action: {
      name: "torrentacle",
      actionDuration: 0,
      actionRate: 1,
      actionType: "exclusive",
      automatic: false,
      manaCost: 0
    },
    positionOffset: {
      x: 64,
      y: 64
    },
    effect: {
      renderingDelay: 0,
      damageDelay: 1000,
      duration: 1000,
      damage: 20,
      collisionDimensions: [{
        offset: {
          x: 32,
          y: 32
        },
        dimensions: {
          width: 96,
          height: 96,
          zheight: 96
        }
      }],
      physics: {
        surfaceType: "gas",
        solidity: 0
      }
    }
  },
  lightningclaw: {
    rendering: {
      image: {
        imageSource: "/Assets/magic/lightningclaw.png",
        offset: {
          x: 10,
          y: 38
        }
      },
      imageSize: 128,
      frames: 16,
      framesPerSec: 16
    },
    effect: {
      renderingDelay: 0,
      damageDelay: 1000,
      duration: 1000,
      aoe: 32,
      damage: 20
      // additional status effects
    }
  },
  tornado: {
    rendering: {
      image: {
        imageSource: "/Assets/magic/tornado.png",
        offset: {
          x: 10,
          y: 8
        }
      },
      imageSize: 128,
      frames: 16,
      framesPerSec: 8
    },
    effect: {
      renderingDelay: 0,
      damageDelay: 500,
      duration: 2000,
      aoe: 32,
      damage: 20
      // additional status effects
    }
  }
};

magicEffects.bat_bite = {
  type: "magic",
  name: "bat_bite",
  rendering: {
    image: {
      imageSource: "/Assets/magic/bite.png",
      offset: {
        x: 0,
        y: 0
      }
    },
    imageSize: 512,
    renderSize: 128,
    frames: 16,
    framesPerSec: 32
  },
  dimensions: {
    width: 128,
    height: 128,
    zheight: 64
  },
  action: {
    name: "bat_bite",
    actionDuration: 0,
    actionRate: 2,
    actionType: "exclusive",
    automatic: false,
    manaCost: 0
  },
  positionOffset: {
    x: 64,
    y: 64
  },
  effect: {
    triggerDamagedEffect: true,
    distance: 48,
    renderingDelay: 0,
    damageDelay: 150,
    duration: 1000,
    noFriendlyFire: true,
    damage: 5,
    collisionDimensions: [{
      offset: {
        x: 0,
        y: 0
      },
      dimensions: {
        width: 128,
        height: 128,
        zheight: 8
      }
    }],
    physics: {
      surfaceType: "gas",
      solidity: 0
    }
  }
};

magicEffects.wolf_bite = {
  type: "magic",
  name: "wolf_bite",
  rendering: {
    image: {
      imageSource: "/Assets/magic/bite.png",
      offset: {
        x: 0,
        y: 0
      }
    },
    imageSize: 512,
    renderSize: 128,
    frames: 16,
    framesPerSec: 32
  },
  dimensions: {
    width: 128,
    height: 128,
    zheight: 64
  },
  action: {
    name: "wolf_bite",
    actionDuration: 0,
    actionRate: 2,
    actionType: "exclusive",
    automatic: false,
    manaCost: 0
  },
  positionOffset: {
    x: 64,
    y: 64
  },
  effect: {
    triggerDamagedEffect: true,
    distance: 64,
    renderingDelay: 0,
    damageDelay: 150,
    duration: 1000,
    noFriendlyFire: true,
    damage: 15,
    collisionDimensions: [{
      offset: {
        x: 0,
        y: 0
      },
      dimensions: {
        width: 128,
        height: 128,
        zheight: 8
      }
    }],
    physics: {
      surfaceType: "gas",
      solidity: 0
    }
  }
};

export default magicEffects;
