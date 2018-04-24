import GameObject from "../../Engine/GameObject/GameObject.mjs"
import magicEffects from "./magicEffects.mjs"
import Vec3 from "../../Engine/GameObject/Vec3.mjs"
import Dimensions from "../../Engine/GameObject/Dimensions.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"
import ObjectRenderer from "../Renderers/ObjectRenderer.mjs"
import AudioCache from "../../Engine/Audio/AudioCache.mjs";

export default class Magic extends GameObject {
  constructor(params) {
    super(params);
    this.type = "Magic";
    this.magic = magicEffects[params.attackType];
    _.merge(this, this.magic.effect);
    this.dimensions = new Dimensions(this.magic.dimensions);
    this.collisionDimensions = this.magic.effect.collisionDimensions;
    this.effect = this.magic.effect;
    this.rendering = this.magic.rendering;
    this.position = new Vec3(params.position);
    this.physics.surfaceType = SURFACE_TYPE.GAS;
    this.damagedTargets = [];

    this.damageReady = true;
    if (this.magic.effect.damageDelay) {
      this.damageReady = false;
    }
    
    this.source = params.source;
    this.ownerId = params.source && params.source.objectId;

    if (!params.simulation && this.rendering) {
      let image = this.magic.rendering.image;
      if (!image) {
        let direction = params.direction; //  || params.target.minus(params.source).normalize();
        let imageDirection;
        if (Math.abs(direction.x) >= Math.abs(direction.y)) {
          imageDirection = direction.x >= 0 ? "right" : "left";
        } else {
          imageDirection = direction.y >= 0 ? "down" : "up";
        }
        // if (params.target.x < params.source.x && Math.abs(direction.x) >= Math.abs(direction.y)) {
        //   imageDirection = "left";
        // } else if (params.target.x > params.source.x && Math.abs(direction.x) >= Math.abs(direction.y)) {
        //   imageDirection = "right";
        // } else if (params.target.y > params.source.y && Math.abs(direction.y) >= Math.abs(direction.x)) {
        //   imageDirection = "down";
        // } else if (params.target.y < params.source.y && Math.abs(direction.y) >= Math.abs(direction.x)) {
        //   imageDirection = "up";
        // }
        image = this.magic.rendering.images[imageDirection];
        this.perspectiveOffset = image.perspectiveOffset;
      }
      this.renderer = new ObjectRenderer(Object.assign({}, image, this.magic.rendering));
    }

    if (!this.simulation && this.magic.audio) {
      if (this.magic.audio.play) {
        new Audio(this.magic.audio.play).play();
      }
      if (this.magic.audio.loop) {
        this.audio.push(AudioCache.loop(this.magic.audio.loop));
      }
    }
    
    this.currentTime = 0;
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;
    if (this.magic.effect.damageDelay && this.currentTime >= this.magic.effect.damageDelay) {
      this.damageReady = true;
    }
    if (this.currentTime >= this.magic.effect.duration) {
      this.done = true;
    }
    this.renderer.update(elapsedTime);
  }
  
  // get perspectivePosition() {
  //   if (this.image.perspectiveOffset) {
  //     return {
  //       x: this.position.x + this.image.perspectiveOffset.x,// - (this.magic.rendering.imageSize / 2 - this.imageOffset.x),
  //       y: this.position.y + this.image.perspectiveOffset.y// + (this.magic.rendering.imageSize - this.imageOffset.y)
  //     };
  //   }
  //   return this.position;
  // }

  getUpdateState() {
    return Object.assign(super.getUpdateState(), {
      attackType: this.magic.name,
      ownerId: this.ownerId
    });
  }
  
  static create(params) {
    let magic = magicEffects[params.attackType];
    let position;
    if (_.isUndefined(magic.effect.distance)) {
      position = new Vec3(params.position).minus(magic.positionOffset);
    } else {
      params.direction.z = 0;
      position = params.source.attackCenter.copy();
      if (magic.effect.targetGround) {
        position.z = 0;
      }
      position.add(params.direction.times(magic.effect.distance))
      position
        .subtract({
          x: magic.dimensions.width / 2,
          y: magic.dimensions.height / 2
        });
    }

    return new Magic({
      position: position,
      level: params.source && params.source.level,
      source: params.source,
      simulation: params.simulation,
      attackType: params.attackType,
      direction: params.direction,
      simulation: params.simulation
      // playerId: params.source.playerId,
      // ownerId: params.source.objectId,
      // elapsedTime: params.elapsedTime
    });
  }
}
