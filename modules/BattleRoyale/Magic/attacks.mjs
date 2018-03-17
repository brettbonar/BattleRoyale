
export default {
  magicBall: {
    rendering: {
      imageSource: "../../Assets/magic/magic-ball.png",
      imageSize: 32,
      frames: 8,
      framesPerSec: 8,
      repeat: true,
      cycleStart: 4
    },
    effect: {
      damage: 10,
      range: 1000,
      punchThrough: false,
      speed: 512
    }
  },
  plasmaBall: {
    type: "projectile",
    rendering: {
      imageSource: "../../Assets/magic/plasmaball.png",
      imageSize: 32,
      frames: 4,
      framesPerSec: 4,
      repeat: true,
      modelDimensions: {
        offset: {
          x: 8,
          y: 8
        },
        dimensions: {
          width: 16,
          height: 16
        }
      }
    },
    effect: {
      damage: 10,
      // TODO: more shapes
      collisionDimensions: [{
        offset: {
          x: 8,
          y: 8
        },
        dimensions: {
          width: 16,
          height: 16,
          zheight: 16
        }
      }],
      offset: {
        z: 20
      },
      shadow: true,
      range: 1000,
      attackTime: 1000,
      automatic: false,
      punchThrough: false,
      speed: 512
    }
  },
  flamethrower: {
    type: "projectile",
    rendering: {
      imageSource: "../../Assets/magic/flamethrower.png",
      imageSize: 128,
      frames: 8,
      framesPerSec: 16,
      repeat: false,
      renderOffset: {
        x: 48,
        y: 16
      }
    },
    effect: {
      damage: 10,
      // TODO: more shapes
      collisionDimensions: [{
        offset: {
          x: 64,
          y: 64
        },
        dimensions: {
          width: 16,
          height: 16,
          zheight: 16
        }
      }],
      shadow: false,
      offset: {
        z: 20
      },
      range: 100,
      attackTime: 1000,
      automatic: true,
      punchThrough: true,
      speed: 200
    }
  }
}
