import GameObject from "../../Engine/GameObject/GameObject.mjs"
import magicEffects from "./magicEffects.mjs"
import MagicRenderer from "./MagicRenderer.mjs"
import Point from "../../Engine/GameObject/Point.mjs"
import Dimensions from "../../Engine/GameObject/Dimensions.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"
import ObjectRenderer from "../Renderers/ObjectRenderer.mjs";

export default class Magic extends GameObject {
  constructor(params) {
    super(params);
    this.type = "Magic";
    this.magic = magicEffects[params.attackType];
    this.dimensions = new Dimensions(this.magic.dimensions);
    this.collisionDimensions = this.magic.effect.collisionDimensions;
    this.effect = this.magic.effect;
    this.position = new Point(params.position);
    this.physics.surfaceType = SURFACE_TYPE.PROJECTILE;
    this.damagedTargets = [];

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
      attackType: this.magic.name
    });
  }
  
  static create(params) {
    let magic = magicEffects[params.attackType];
    let position = new Point(params.position).minus({
      //x: magic.rendering.imageSize / 2,
      //y: magic.rendering.imageSize / 2
    });

    return new Magic({
      position: position,
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
