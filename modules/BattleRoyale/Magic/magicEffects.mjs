
export default {
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
          imageSource: "../../Assets/magic/firelion_up.png",
        },
        down: {
          imageSource: "../../Assets/magic/firelion_down.png"
        },
        left: {
          imageSource: "../../Assets/magic/firelion_left.png"
        },
        right: {
          imageSource: "../../Assets/magic/firelion_right.png"
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
      }]
    }
  },
  snake: {
    rendering: {
      images: {
        up: {
          imageSource: "../../Assets/magic/snakebite_up.png",
          offset: {
            x: 8,
            y: 48
          }
        },
        down: {
          imageSource: "../../Assets/magic/snakebite_down.png",
          offset: {
            x: 8,
            y: 48
          }
        },
        left: {
          imageSource: "../../Assets/magic/snakebite_side.png",
          offset: {
            x: -24,
            y: 48
          }
        },
        right: {
          imageSource: "../../Assets/magic/snake_right.png",
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
        imageSource: "../../Assets/magic/icetacle.png",
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
  torrentacle: {
    rendering: {
      image: {
        imageSource: "../../Assets/magic/torrentacle.png",
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
  lightningclaw: {
    rendering: {
      image: {
        imageSource: "../../Assets/magic/lightningclaw.png",
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
        imageSource: "../../Assets/magic/tornado.png",
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
}
