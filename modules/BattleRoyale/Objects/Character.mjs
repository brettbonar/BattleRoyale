import GameObject from "../../Engine/GameObject/GameObject.mjs"
import CharacterRenderer, { STATE } from "../Renderers/CharacterRenderer.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs";

export default class Character extends GameObject {
  constructor(params) {
    super(params);
    _.defaults(this, {
      speed: 96,
      direction: {
        x: 0,
        y: 0
      },
      type: "Character",
      characterDirection: "down",
      attacking: false,
      attackTime: 0,
      maxHealth: 100,
      maxMana: 100,
      currentHealth: 100,
      currentMana: 100,
      hasHealth: true,
      hasMana: true,
      attackDuration: 1000
    });
    
    this.physics.surfaceType = "character";
    this.dimensions = params.dimensions || {
      width: 32,
      height: 20
    };

    this.modelDimensions = {
      width: 32,
      height: 64
    };

    if (!params.simulation) {
      this.renderer = new CharacterRenderer({
        gender: params.gender,
        body: params.body,
        loadout: params.loadout,
        isOtherPlayer: this.isOtherPlayer
      });
    }
  }

  setDirection(direction) {
    Object.assign(this.direction, direction);
    this.direction = this.normalize(this.direction);
  }

  get center() {
    return {
      x: this.position.x,
      y: this.position.y - 32
    }
  }

  get perspectivePosition() {
    if (this.dead) {
      return {
        x: this.position.x,
        y: this.position.y - this.modelDimensions.height / 2
      };
    }
    return this.position;
  }

  damage(source) {
    this.currentHealth -= source.effect.damage;
    if (!this.dead && this.currentHealth <= 0) {
      this.kill(source);
    }
  }

  kill(source) {
    this.dead = true;
    this.physics.surfaceType = SURFACE_TYPE.NONE;
  }

  attack(duration, elapsedTime) {
    this.attacking = true;
    this.attackTime = elapsedTime || 0;
    //this.attackDuration = duration;
  }

  setTarget(target) {
    let center = this.center;
    let direction = this.normalize({
      x: target.x - center.x,
      y: target.y - center.y
    });

    if (target.x < center.x && Math.abs(direction.x) >= Math.abs(direction.y)) {
      this.characterDirection = "left";
    } else if (target.x > center.x && Math.abs(direction.x) >= Math.abs(direction.y)) {
      this.characterDirection = "right";
    } else if (target.y > center.y && Math.abs(direction.y) >= Math.abs(direction.x)) {
      this.characterDirection = "down";
    } else if (target.y < center.y && Math.abs(direction.y) >= Math.abs(direction.x)) {
      this.characterDirection = "up";
    }
  }

  update(elapsedTime) {
    this.renderer.update(elapsedTime + this.elapsedTime, this);
    if (this.attacking) {
      this.attackTime += elapsedTime + this.elapsedTime;
      if (this.attackTime >= this.attackDuration) {
        this.attackTime = 0;
        this.attacking = false;
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
      "attacking",
      //"attackTime",
      "characterDirection",
      "maxHealth",
      "maxMana",
      "currentHealth",
      "currentMana",
      "hasHealth",
      "hasMana",
      "attackDuration",
      "dead"
    ]));
  }
}
