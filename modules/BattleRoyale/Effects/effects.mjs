
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
    frequency: 4,
    // Distribution of particle spawning
    radius: 10,
    duration: 500,
    particles: {
      imageSource: "/Assets/effects/light.png",
      dimensions: {
        width: 5,
        height: 5
      },
      speed: 10,
      duration: 100
    }
    // acceleration
    // TODO: spread: angle of direction
  }
}
