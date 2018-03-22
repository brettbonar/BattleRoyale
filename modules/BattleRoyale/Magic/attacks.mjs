
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
  boulder: {
    type: "projectile",
    name: "boulder",
    dimensions: {
      width: 32,
      height: 32,
      zheight: 32
    },
    action: {
      name: "boulder",
      actionDuration: 0,
      actionRate: 0.5,
      actionType: "exclusive",
      automatic: false,
      manaCost: 0,
      charge: {
        speed: {
          maxTime: 1000,
          maxMult: 2.0
        }
      },
    },
    rendering: {
      imageSource: "../../Assets/projectiles/boulder2.png",
      imageSize: 32,
      modelDimensions: {
        offset: {
          x: 4,
          y: 4
        },
        dimensions: {
          width: 24,
          height: 24
        }
      },
      shadow: true
    },
    effect: {
      damage: 15,
      // TODO: more shapes
      collisionDimensions: [{
        offset: {
          x: 0,
          y: 0
        },
        dimensions: {
          width: 32,
          height: 32,
          zheight: 32
        }
      }],
      physics: {
        elasticity: 0.5,
        friction: 0.8
      },
      acceleration: {
        z: -1
      },
      direction: {
        z: 0.2
      },
      range: 5000,
      speed: 250
    }
  },
  arrow: {
    type: "projectile",
    name: "arrow",
    dimensions: {
      width: 32,
      height: 32
    },
    action: {
      name: "arrow",
      actionDuration: 0,
      actionRate: 2,
      actionType: "exclusive",
      automatic: false,
      charge: {
        speed: {
          maxTime: 1000,
          maxMult: 2.0
        }
      },
      manaCost: 0
    },
    rendering: {
      imageSource: "../../Assets/projectiles/Arrow2.png",
      imageSize: 32,
      frames: 4,
      framesPerSec: 4,
      repeat: true,
      modelDimensions: {
        offset: {
          x: 5,
          y: 12
        },
        dimensions: {
          width: 23,
          height: 9
        }
      },
      hitEffect: {
        imageSource: "../../Assets/projectiles/Arrow2.png",
        imageDimensions: {
          width: 32,
          height: 32,
          x: 0,
          y: 0
        },
        // offset: {
        //   x: 5,
        //   y: 12
        // },
        //duration: 5000
      },
      shadow: true
    },
    effect: {
      path: "arc",
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
      speed: 350
    }
  },
  plasmaBall: {
    type: "projectile",
    name: "plasmaBall",
    action: {
      name: "plasmaBall",
      actionDuration: 0,
      actionRate: 3,
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
        repeat: false,
        imageDimensions: {
          width: 32,
          height: 32,
          x: 0,
          y: 0
        },
        offset: {
          x: 8,
          y: 8
        },
        dimensions: {
          width: 16,
          height: 16
        }
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
  lionFlare: {
    type: "projectile",
    name: "lionFlare",
    action: {
      name: "lionFlare",
      actionDuration: 0,
      actionRate: .75,
      actionType: "exclusive",
      automatic: false,
      manaCost: 0,
      charge: {
        speed: {
          maxTime: 1000,
          maxMult: 2.0
        }
      },
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
      //attackTime: 1000,
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
          .subtract({ x: 64, y: 96, z: 32 })
          .add({
            x: collision.source.effect.collisionDimensions[0].dimensions.width / 2,
            y: collision.source.effect.collisionDimensions[0].dimensions.height / 2
          });
          //.add(collision.source.direction.times(collision.source.speed / 5));
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
