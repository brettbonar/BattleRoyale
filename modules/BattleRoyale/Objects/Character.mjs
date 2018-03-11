import GameObject from "../../Engine/GameObject/GameObject.mjs"
import CharacterRenderer from "../Renderers/CharacterRenderer.mjs"
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
      hasMana: true
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
      this.renderer.setAnimation(CharacterRenderer.ANIMATIONS.MOVE_DOWN);
    }
  }

  setDirection(direction) {
    Object.assign(this.direction, direction);
    this.direction = this.normalize(this.direction);
    if (this.direction.x !== 0 || this.direction.y !== 0) {
      this.renderer.animating = true;
    } else if (!this.attacking) {
      this.renderer.animating = false;
      this.renderer.frame = 0;
    }
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
    this.renderer.dead = true;
    this.renderer.animating = true;
    this.renderer.setAnimation(CharacterRenderer.ANIMATIONS.DEATH);
  }

  attack(duration, attackTime) {
    this.renderer.setAnimation(CharacterRenderer.WEAPON_ANIMATIONS[this.loadout.weapon.attackType][this.characterDirection], duration);
    this.renderer.animating = true;
    this.attacking = true;
    this.attackTime = attackTime || 0;
    this.attackDuration = duration;
  }

  setTarget(target) {
    let center = this.center;
    let direction = this.normalize({
      x: target.x - center.x,
      y: target.y - center.y
    });

    if (target.x < center.x && Math.abs(direction.x) >= Math.abs(direction.y)) {
      if (!this.attacking) {
        this.renderer.setAnimation(CharacterRenderer.ANIMATIONS.MOVE_LEFT);
      }
      this.characterDirection = "left";
    } else if (target.x > center.x && Math.abs(direction.x) >= Math.abs(direction.y)) {
      if (!this.attacking) {
        this.renderer.setAnimation(CharacterRenderer.ANIMATIONS.MOVE_RIGHT);
      }
      this.characterDirection = "right";
    } else if (target.y > center.y && Math.abs(direction.y) >= Math.abs(direction.x)) {
      if (!this.attacking) {
        this.renderer.setAnimation(CharacterRenderer.ANIMATIONS.MOVE_DOWN);
      }
      this.characterDirection = "down";
    } else if (target.y < center.y && Math.abs(direction.y) >= Math.abs(direction.x)) {
      if (!this.attacking) {
        this.renderer.setAnimation(CharacterRenderer.ANIMATIONS.MOVE_UP);
      }
      this.characterDirection = "up";
    }
  }

  update(elapsedTime) {
    this.renderer.update(elapsedTime);
    if (this.attacking) {
      this.attackTime += elapsedTime;
      if (this.attackTime >= this.attackDuration) {
        this.attackTime = 0;
        this.attacking = false;
        this.renderer.frame = 0;
        if (this.direction.x == 0 && this.direction.y == 0) {
          this.renderer.animating = false;
        }
        this.renderer.setAnimation(CharacterRenderer.MOVE_ANIMATIONS[this.characterDirection]);
      }
    }
  }

  updateState(state) {
    _.merge(this, state);
    if (state.target) {
      this.setTarget(state.target);
    }
    if (state.direction) {
      this.setDirection(state.direction);
    }
  }
}
