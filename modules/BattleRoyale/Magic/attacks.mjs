
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
    name: "plasmaBall",
    action: {
      name: "plasmaBall",
      actionDuration: 0,
      actionRate: 5,
      actionType: "exclusive",
      automatic: true,
      manaCost: 0
    },
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
      },
      hitEffect: {
        imageSource: "../../Assets/magic/plasmaBallHit.png",
        imageSize: 32,
        frames: 4,
        framesPerSec: 16,
        repeat: false
      },
      shadow: false
    },
    effect: {
      damage: 5,
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
      range: 1000,
      punchThrough: false,
      speed: 512
    }
  },
  flamethrower: {
    type: "projectile",
    name: "flamethrower",
    rendering: {
      imageSource: "../../Assets/magic/flamethrower.png",
      imageSize: 128,
      frames: 8,
      framesPerSec: 16,
      repeat: false,
      renderOffset: {
        x: 48,
        y: 16
      },
      shadow: false
    },
    effect: {
      damage: 5,
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
      range: 100,
      attackTime: 1000,
      automatic: true,
      punchThrough: true,
      speed: 200
    }
  },
  flare: {
    type: "projectile",
    name: "flare",
    action: {
      name: "flare",
      actionDuration: 0,
      actionRate: .75,
      actionType: "blocking",
      automatic: false,
      manaCost: 0
    },
    rendering: {
      imageSource: "../../Assets/magic/flare.png",
      imageSize: 32,
      frames: 4,
      framesPerSec: 8,
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
      },
      shadowColor: "rgba(230, 140, 100, 1)",
      shadow: true
    },
    effect: {
      path: "arc",
      damage: 5,
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
      range: 1000,
      attackTime: 1000,
      automatic: false,
      punchThrough: false,
      speed: 200,
      doTriggerCollision: function (object) {
        return object.direction.z < 0 && object.position.z <= 32;
      },
      onCollision: function (collision) {
        // TODO: change collisionDimensions to attackDimensions
        let position = collision.position
          .plus(collision.source.effect.collisionDimensions[0].offset)
          .minus({ x: 64, y: 96, z: 32 })
          .plus({
            x: collision.source.effect.collisionDimensions[0].dimensions.width / 2,
            y: collision.source.effect.collisionDimensions[0].dimensions.height / 2
          });
        position.z = Math.max(0, position.z);
        collision.source.done = true;
        return {
          create: {
            type: "Magic",
            attackType: "fireLion",
            position: position,
            direction: collision.source.direction
          },
          remove: collision.source
        };
      }
      //zspeed: 5000
    }
  }
}
