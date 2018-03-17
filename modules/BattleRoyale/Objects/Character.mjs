import GameObject from "../../Engine/GameObject/GameObject.mjs"
import Point from "../../Engine/GameObject/Point.mjs"
import Dimensions from "../../Engine/GameObject/Dimensions.mjs"
import CharacterRenderer, { STATE } from "../Renderers/CharacterRenderer.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs";

export default class Character extends GameObject {
  constructor(params) {
    super(params);
    _.defaults(this, {
      speed: 96,
      type: "Character",
      state: {
        inventory: [],
        loadout: params.loadout,
        characterDirection: "down",
        attacking: false,
        attackTime: 0,
        maxHealth: 100,
        maxMana: 100,
        currentHealth: 100,
        currentMana: 100,
        hasHealth: true,
        hasMana: true
      },
      // Dimensions of the actual model within the image
      modelDimensions: {
        offset: {
          x: 16,
          y: 16
        },
        dimensions: new Dimensions({
          width: 32,
          height: 44,
          zheight: 44
        })
      },
      attackDuration: 1000
    });

    if (params.collisionDimensions) {
      this.collisionDimensions = this.parseDimensions(params.collisionDimensions);
    } else {
      this.collisionDimensions = [
        {
          offset: {
            x: 16,
            y: 44, // 64 - 20,
            z: 0
          },
          dimensions: new Dimensions({
            width: 32,
            height: 20,
            zheight: 44
          })
        }
      ];
    }

    this.dimensions = params.dimensions || new Dimensions({
      width: 64,
      height: 64,
      zheight: 64
    });
    
    this.physics.surfaceType = "character";

    if (!params.simulation) {
      this.renderer = new CharacterRenderer({
        gender: params.gender,
        body: params.body,
        loadout: params.state.loadout,
        isOtherPlayer: this.isOtherPlayer
      });
    }
  }

  setDirection(direction) {
    Object.assign(this.direction, direction);
    this.direction = this.normalize(this.direction);
  }

  damage(source) {
    this.state.currentHealth -= source.effect.damage;
    if (!this.state.dead && this.state.currentHealth <= 0) {
      this.kill(source);
    }
  }

  kill(source) {
    this.state.dead = true;
    this.physics.surfaceType = SURFACE_TYPE.NONE;
  }

  attack(duration, elapsedTime) {
    this.state.attacking = true;
    this.state.attackTime = elapsedTime || 0;
    //this.attackDuration = duration;
  }

  setTarget(target) {
    let center = this.center;
    let direction = new Point(target).minus(center).normalize();

    if (target.x < center.x && Math.abs(direction.x) >= Math.abs(direction.y)) {
      this.state.characterDirection = "left";
    } else if (target.x > center.x && Math.abs(direction.x) >= Math.abs(direction.y)) {
      this.state.characterDirection = "right";
    } else if (target.y > center.y && Math.abs(direction.y) >= Math.abs(direction.x)) {
      this.state.characterDirection = "down";
    } else if (target.y < center.y && Math.abs(direction.y) >= Math.abs(direction.x)) {
      this.state.characterDirection = "up";
    }
  }

  update(elapsedTime) {
    this.renderer.update(elapsedTime + this.elapsedTime, this);
    if (this.state.attacking) {
      this.state.attackTime += elapsedTime + this.elapsedTime;
      if (this.state.attackTime >= this.attackDuration) {
        this.state.attackTime = 0;
        this.state.attacking = false;
      }
    }

    this.elapsedTime = 0;
  }

  updateState(state) {
    _.merge(this, _.omit(state, "renderer"));
    if (state.target) {
      this.setTarget(state.target);
    }
    if (state.direction) {
      this.setDirection(state.direction);
    }
  }

  getUpdateState() {
    return Object.assign(super.getUpdateState(), _.pick(this, [
      "state",
      "body",
      "gender",
      "isPlayer",
      // TODO: make this part of character type, or just part of weapon
      "damagedEffect"
    ]));
  }
}
