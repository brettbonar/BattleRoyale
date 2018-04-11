
export default {
  blood: {
    imageSource: "/Assets/effects/blood-64.png",
    // offset: {
    //   x: 0,
    //   y: 80
    // },
    // perspectiveOffset: {
    //   x: 0,
    //   y: 48
    // }
    imageSize: 64,
    frames: 6,
    framesPerSec: 12
  },
  lightSmall: {
    initialCount: 10,
    radius: 5,
    duration: 0,
    particles: {
      imageSource: "/Assets/effects/lightSmall.png",
      dimensions: {
        width: 4,
        height: 4
      },
      minSpeed: 20,
      maxSpeed: 40,
      //speed: 20,
      zspeed: 20,
      minDuration: 250,
      maxDuration: 500,
      //duration: 2000,
      acceleration: {
        z: -1
      },
      baseDirection: {
        min: {
          x: -1,
          y: -1,
          z: 1
        },
        max: {
          x: 1,
          y: 1,
          z: 1
        }
      },
      // Momentum will add part of the speed/direction of the source projectile
      //momentum: 1.0,
      // Stickiness, friction, and elasticity currently only apply to the ground
      friction: 3.0,
      stickiness: 0.5,
      elasticity: 0.5
    }
    // acceleration
    // TODO: spread: angle of direction
  },
  light: {
    initialCount: 15,
    radius: 10,
    duration: 0,
    particles: {
      imageSource: "/Assets/effects/light.png",
      dimensions: {
        width: 8,
        height: 8
      },
      minSpeed: 20,
      maxSpeed: 80,
      //speed: 20,
      zspeed: 20,
      minDuration: 1000,
      maxDuration: 2000,
      //duration: 2000,
      acceleration: {
        z: -1
      },
      // Stickiness, friction, and elasticity currently only apply to the ground
      friction: 3.0,
      stickiness: 0.5,
      elasticity: 0.5
    }
    // acceleration
    // TODO: spread: angle of direction
  },
  lightRay: {
    // Particles per second
    frequency: 20,
    // Distribution of particle spawning
    radius: 10,
    duration: 100,
    particles: {
      imageSource: "/Assets/effects/lightRay.png",
      dimensions: {
        width: 12,
        height: 11
      },
      speed: 100,
      duration: 500
    }
    // acceleration
    // TODO: spread: angle of direction
  }
}
