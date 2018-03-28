
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
  light: {
    // Particles per second
    imageSource: "/Assets/effects/light.png",
    frequency: 10,
    // Distribution of particle spawning
    radius: 10,
    particles: {
      speed: 100,
      duration: 500
    }
    // acceleration
    // TODO: angle of direction
  }
}
