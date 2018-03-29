import Point from "../GameObject/Point.mjs"
import ImageCache from "../Rendering/ImageCache.mjs"

class Particle {
  constructor(params) {
    this.currentTime = 0;
    this.rotation = 0;
    _.merge(this, params);

    this.image = ImageCache.get(this.particleInfo.imageSource);
  }

  get perspectivePosition() { return this.position; }

  update(elapsedTime) {
    this.currentTime += elapsedTime;

    if (this.direction && this.particleInfo.speed) {
      this.position.add(this.direction.times(this.particleInfo.speed * (elapsedTime / 1000)));
    }

    if (this.acceleration && this.particleInfo.speed) {
      this.direction.add(this.acceleration.times(this.particleInfo.speed * (elapsedTime / 1000)));
    }

    if (this.spin) {
      this.rotation += this.spin * (elapsedTime / 1000);
    }

    if (this.currentTime >= this.particleInfo.duration) {
      this.done = true;
    }
  }

  render(context, elapsedTime) {
    // TODO: allow animated particles
    if (!this.image.complete) {
      return;
    }
    //let offset = getAnimationOffset(this.image, this.projectile.imageSize, this.frame);

    // if (this.projectile.shadow) {
    //   drawShadow(context, object, this.projectile.modelDimensions, this.projectile.shadowColor);
    // }

    let position = this.position.minus({ y: this.position.z });

    context.save();
    
    if (this.rotation) {
      let center = position.plus({ x: this.particleInfo.dimensions.width / 2, y: this.particleInfo.dimensions.height / 2});
      context.translate(center.x, center.y);
      context.rotate((this.rotation * Math.PI) / 180);
      context.translate(-center.x, -center.y);        
    }
    
    context.drawImage(this.image, position.x, position.y,
      this.particleInfo.dimensions.width, this.particleInfo.dimensions.height);

    context.restore();
  }
}

export default class ParticleEffect {
  constructor(params) {
    this.currentTime = 0;
    this.particleTime = 0;
    this.particles = [];
    this.position = params.position;
    this.direction = params.direction;
    this.particleInfo = params.effect.particles;
    this.frequency = params.effect.frequency;
    this.radius = params.effect.radius;
    this.duration = params.effect.duration;
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;
    this.particleTime += elapsedTime;

    _.remove(this.particles, "done");
    for (const particle of this.particles) {
      particle.update(elapsedTime);
    }

    // TODO: find out how much currentTime is over duration, may need to create some particles
    if (this.currentTime <= this.duration) {
      let numParticles = Math.floor(this.frequency * (this.particleTime / 1000));
      for (let i = 0; i < numParticles; i++) {
        let position = this.position.copy();
        let direction = new Point({
          x: _.random(-1, 1, true),
          y: _.random(-1, 1, true),
          z: _.random(-1, 1, true)
        }).normalize();
        if (this.radius) {
          position.add(direction.times(this.radius));
        }
        this.particles.push(new Particle({
          position: this.position,
          direction: direction,
          particleInfo: this.particleInfo
        }));
      }
      this.particleTime -= numParticles * (this.frequency / 1000);
    }

    if (this.currentTime >= this.duration && this.particles.length === 0) {
      this.done = true;
    }
  }

  get renderObjects() {
    return this.particles;
  }
}
