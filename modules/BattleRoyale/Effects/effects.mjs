
export default {
  blood: {
    imageSource: "../../Assets/effects/blood-64.png",
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
    initialCount: 5,
    radius: 5,
    duration: 0,
    particles: {
      imageSource: "/Assets/effects/lightSmall.png",
      dimensions: {
        width: 3,
        height: 3
      },
      minSpeed: 10,
      maxSpeed: 40,
      //speed: 20,
      zspeed: 10,
      minDuration: 1000,
      maxDuration: 2000,
      //duration: 2000,
      acceleration: {
        z: -0.5
      },
      // Stickiness, friction, and elasticity currently only apply to the ground
      friction: 3.0,
      stickiness: 0.5,
      elasticity: 0.5
    }
    // acceleration
    // TODO: spread: angle of direction
  },
  light: {
    initialCount: 10,
    radius: 10,
    duration: 0,
    particles: {
      imageSource: "/Assets/effects/light.png",
      dimensions: {
        width: 5,
        height: 5
      },
      minSpeed: 10,
      maxSpeed: 40,
      //speed: 20,
      zspeed: 10,
      minDuration: 1000,
      maxDuration: 3000,
      //duration: 2000,
      acceleration: {
        z: -0.5
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
