
let attacks = {
  magicBall: {
    rendering: {
      imageSource: "/Assets/magic/magic-ball.png",
      dimensions: {
        width: 32,
        height: 32
      },
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
      actionRate: 2,
      actionType: "exclusive",
      automatic: false,
      manaCost: 10,
      charge: {
        speed: {
          maxTime: 1000,
          maxMult: 2.0
        }
      },
    },
    rendering: {
      imageSource: "/Assets/projectiles/boulder2.png",
      dimensions: {
        width: 32,
        height: 32
      },
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
      shadow: "/Assets/shadows/shadow32.png"
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
  lightBeam: {
    type: "projectile",
    name: "lightBeam",
    dimensions: {
      width: 32,
      height: 32,
      zheight: 16
    },
    audio: {
      loop: "/Assets/Audio/beam.ogg"
    },
    action: {
      name: "lightBeam",
      actionDuration: 0,
      actionRate: 4,
      actionType: "channeling",
      automatic: false,
      manaCost: 5,
      manaCostPerSec: 10
    },
    rendering: {
      start: {
        imageSource: "/Assets/projectiles/lightBeamStart.png",
        dimensions: {
          width: 32,
          height: 32
        },
        // frames: 4,
        // framesPerSec: 4,
        // repeat: true,
        // modelDimensions: {
        //   dimensions: {
        //     width: 32,
        //     height: 32
        //   }
        // },
      },
      end: {
        imageSource: "/Assets/projectiles/lightBeamEnd.png",
        dimensions: {
          width: 32,
          height: 32
        },
      },
      body: {
        imageSource: "/Assets/projectiles/lightBeamBody.png",
        dimensions: {
          width: 32,
          height: 32
        }
      },
      // TODO: may need a maximum rate at which hit effects are added
      // Right now a new hit effect is created each frame
      // TODO: maybe attach a single effect to each projectile and move it with projectile?
      hitEffect: {
        particleEffect: "lightSmall"
      }
    },
    effect: {
      persistAfterHit: true,
      path: "beam",
      damage: 2,
      damageRate: 8,
      physics: {
        push: false,
        alwaysPushed: true
      },
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
      },
      {
        boundsType: "ray",
        offset: {
          x: 8,
          y: 8
        },
        dimensions: {
          // Perpendicular distance from object position + offset
          rayDistance: 11
        }
      },
      {
        boundsType: "ray",
        offset: {
          x: 8,
          y: 8
        },
        dimensions: {
          rayDistance: -11
        }
      }],
      range: 350,
      punchThrough: false
    }
  },
  lightMote: {
    type: "projectile",
    name: "lightMote",
    audio: {
      play: "/Assets/Audio/lightMote.ogg"
    },
    dimensions: {
      width: 32,
      height: 32,
      zheight: 16
    },
    action: {
      name: "lightMote",
      actionDuration: 0,
      actionRate: 4,
      actionType: "channeling",
      automatic: false,
      manaCost: 10,
      //manaCostPerSec: 0
    },
    rendering: {
      imageSource: "/Assets/projectiles/lightMote.png",
      dimensions: {
        width: 32,
        height: 32
      },
      // TODO: add a "trail" particle effect option

      // frames: 4,
      // framesPerSec: 4,
      // repeat: true,
      modelDimensions: {
        offset: {
          x: 8,
          y: 8
        },
        dimensions: {
          width: 16,
          height: 16,
          zheight: 16
        }
      },
      shadowColor: "white",
      //shadow: "/Assets/shadows/shadow16white.png",
      hitEffect: {
        particleEffect: "light"
      }
    },
    effect: {
      path: "tracking",
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
      punchThrough: false,
      speed: 500,
      range: 500
    }
  },
  arrow: {
    type: "projectile",
    name: "arrow",
    audio: {
      play: "/Assets/Audio/soundpack/combat/bow.wav"
    },
    dimensions: {
      width: 30,
      height: 7
    },
    action: {
      name: "arrow",
      actionDuration: 0,
      actionRate: 2,
      actionType: "exclusive",
      automatic: false,
      charge: {
        speed: {
          maxTime: 500,
          maxMult: 2.0
        }
      },
      manaCost: 0
    },
    rendering: {
      imageSource: "/Assets/projectiles/arrow.png",
      dimensions: {
        width: 30,
        height: 7
      },
      hitEffect: {
        audio: {
          play: "/Assets/Audio/soundpack/combat/hit.wav"
        },
        imageSource: "/Assets/projectiles/arrow_hit.png",
        imageDimensions: {
          width: 30,
          height: 7,
          x: 0,
          y: 0
        },
        location: "self"
        // offset: {
        //   x: 5,
        //   y: 12
        // },
        //duration: 5000
      },
      shadow: "/Assets/shadows/shadow24x4.png"
    },
    effect: {
      path: "arc",
      damage: 5,
      triggerDamagedEffect: true,
      collisionDimensions: [{
        offset: {
          x: 11,
          y: 0
        },
        dimensions: {
          width: 8,
          height: 8,
          zheight: 8
        }
      }],
      range: 1000,
      punchThrough: false,
      speed: 350
    }
  },
  shadowArrow: {
    type: "projectile",
    name: "shadowArrow",
    audio: {
      play: "/Assets/Audio/soundpack/combat/bow.wav"
    },
    dimensions: {
      width: 30,
      height: 7
    },
    action: {
      name: "shadowArrow",
      actionDuration: 0,
      actionRate: 2,
      actionType: "exclusive",
      automatic: false,
      charge: {
        speed: {
          maxTime: 500,
          maxMult: 2.0
        }
      },
      manaCost: 0
    },
    rendering: {
      imageSource: "/Assets/projectiles/shadow_arrow.png",
      dimensions: {
        width: 30,
        height: 7
      },
      hitEffect: {
        audio: {
          play: "/Assets/Audio/soundpack/combat/hit.wav"
        },
        imageSource: "/Assets/projectiles/shadow_arrow_hit.png",
        imageDimensions: {
          width: 30,
          height: 7,
          x: 0,
          y: 0
        },
        location: "self"
        // offset: {
        //   x: 5,
        //   y: 12
        // },
        //duration: 5000
      },
      shadow: "/Assets/shadows/shadow24x4.png"
    },
    effect: {
      path: "arc",
      damage: 5,
      triggerDamagedEffect: true,
      collisionDimensions: [{
        offset: {
          x: 11,
          y: 0
        },
        dimensions: {
          width: 8,
          height: 8,
          zheight: 8
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
      imageSource: "/Assets/magic/plasmaball.png",
      dimensions: {
        width: 32,
        height: 32
      },
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
        imageSource: "/Assets/magic/plasmaBallHit.png",
        dimensions: {
          width: 32,
          height: 32
        },
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
      range: 500,
      punchThrough: false,
      speed: 512
    }
  },
  flamethrower: {
    type: "projectile",
    name: "flamethrower",
    audio: {
      play: "/Assets/Audio/spells/flamethrower_short.ogg"
    },
    rendering: {
      imageSource: "/Assets/projectiles/flame.png",
      dimensions: {
        width: 64,
        height: 32
      },
      frames: 4,
      framesPerSec: 8,
      repeat: true,
      hitEffect: {
        particleEffect: "sparkSmall"
      }
      // dimensions: {
      //   width: 64,
      //   height: 32
      // },
      // shadow: false
    },
    action: {
      name: "flamethrower",
      actionDuration: 0,
      actionRate: 12,
      actionType: "exclusive",
      automatic: true,
      manaCost: 1
    },
    effect: {
      path: "stream",
      damage: 2,
      // TODO: more shapes
      collisionDimensions: [{
        offset: {
          x: 8,
          y: 8
        },
        dimensions: {
          width: 32,
          height: 32,
          zheight: 32
        }
      }],
      range: 220,
      spread: 15,
      attackTime: 1000,
      automatic: true,
      punchThrough: false,
      speed: 400
    }
  },
  waterJet: {
    type: "projectile",
    name: "waterJet",
    dimensions: {
      width: 32,
      height: 32,
      zheight: 16
    },
    audio: {
      loop: "/Assets/Audio/soundpack/environment/stream.wav"
    },
    action: {
      name: "waterJet",
      actionDuration: 0,
      actionRate: 4,
      actionType: "channeling",
      automatic: false,
      manaCost: 5,
      manaCostPerSec: 10
    },
    rendering: {
      start: {
        imageSource: "/Assets/projectiles/water_jet_start.png",
        dimensions: {
          width: 32,
          height: 32
        },
        // frames: 4,
        // framesPerSec: 4,
        // repeat: true,
        // modelDimensions: {
        //   dimensions: {
        //     width: 32,
        //     height: 32
        //   }
        // },
      },
      end: {
        imageSource: "/Assets/projectiles/water_jet_end.png",
        dimensions: {
          width: 32,
          height: 32
        },
      },
      body: {
        imageSource: "/Assets/projectiles/water_jet_body.png",
        dimensions: {
          width: 64,
          height: 32
        },
        frames: 9,
        framesPerSec: 54,
        repeat: true,
      },
      hitEffect: {
        particleEffect: "splash"
      }
    },
    effect: {
      path: "beam",
      persistAfterHit: true,
      damage: 2,
      damageRate: 8,
      physics: {
        push: false,
        alwaysPushed: true
      },
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
      },
      {
        boundsType: "ray",
        offset: {
          x: 8,
          y: 8
        },
        dimensions: {
          // Perpendicular distance from object position + offset
          rayDistance: 11
        }
      },
      {
        boundsType: "ray",
        offset: {
          x: 8,
          y: 8
        },
        dimensions: {
          rayDistance: -11
        }
      }],
      range: 350,
      punchThrough: false
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
      manaCost: 15,
      charge: {
        speed: {
          maxTime: 1000,
          maxMult: 2.0
        }
      },
    },
    rendering: {
      imageSource: "/Assets/magic/flare.png",
      dimensions: {
        width: 32,
        height: 32
      },
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
      hitEffect: {
        particleEffect: "sparkSmall"
      },
      shadowColor: "rgba(230, 140, 100, 1)",
      shadow: "/Assets/shadows/shadow16orange.png"
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
      speed: 400,
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
        position.z = Math.max(0, position.z - 32);
        collision.source.done = true;
        return {
          create: {
            type: "Magic",
            attackType: "fireLion",
            ownerId: collision.source.ownerId,
            position: position,
            direction: collision.source.direction
          },
          remove: collision.source
        };
      }
      //zspeed: 5000
    }
  },
};

export default attacks;
