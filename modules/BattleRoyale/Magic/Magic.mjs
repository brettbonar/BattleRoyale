import GameObject from "../../Engine/GameObject/GameObject.mjs"
import magicEffects from "./magicEffects.mjs"
import Vec3 from "../../Engine/GameObject/Vec3.mjs"
import Dimensions from "../../Engine/GameObject/Dimensions.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"
import ObjectRenderer from "../Renderers/ObjectRenderer.mjs"

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
    this.source = params.source;
    this.ownerId = params.source && params.source.objectId;

    if (!params.simulation) {
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
    
    this.currentTime = 0;
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;
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
      position.subtract(magic.positionOffset);
    }

    return new Magic({
      position: position,
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
