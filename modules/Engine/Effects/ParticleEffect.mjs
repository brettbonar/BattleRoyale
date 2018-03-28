

class Particle {
  constructor(params) {
    this.currentTime = 0;
    this.particleTime = 0;
    _.merge(this, params);

    this.image = ImageCache.get(this.imageSource);
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;

    if (this.direction) {
      this.position.add(this.direction.times(elapsedTime / 1000));
    }

    if (this.acceleration) {
      this.direction.add(this.acceleration.times(elapsedTime / 1000));
    }

    if (this.currentTime >= this.duration) {
      this.done = true;
    }
  }
}

export default class ParticleEffect {
  constructor(params) {
    this.currentTime = 0;
    this.particles = [];
    _.merge(this, params);
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;
    this.particleTime += elapsedTime;

    _.remove(this.particles, "done");
    for (const particle of this.particles) {
      particle.update(elapsedTime);
    }

    let numParticles = Math.floor(this.frequency * (this.particleTime / 1000));
    for (let i = 0; i < numParticles; i++) {
      this.particles.push(new Particle({
        position: this.position,
        particleInfo: this.particle
      }));
    }
    this.particleTime -= numParticles * this.frequency * (this.particleTime / 1000);

    if (this.currentTime >= elapsedTime && this.particles.length === 0) {
      this.done = true;
    }
  }

  render(elapsedTime) {

  }
}
