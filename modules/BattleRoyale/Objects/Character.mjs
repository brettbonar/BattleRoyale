import GameObject from "../../Engine/GameObject/GameObject.mjs"
import Point from "../../Engine/GameObject/Point.mjs"
import Dimensions from "../../Engine/GameObject/Dimensions.mjs"
import CharacterRenderer, { STATE } from "../Renderers/CharacterRenderer.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs";

class Action {
  constructor(params) {
  }
}

export default class Character extends GameObject {
  constructor(params) {
    super(params);
    _.defaults(this, {
      type: "Character",
      state: {
        target: this.position.plus({ x: 32, y: 32 }),
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
      attackDuration: 1000
    });
    this.speed = params.speed || 96;

    // actionDuration
    // actionRate
    // actionCooldown
    // currentDuration
    // currentCooldown
    // active
    this.cooldowns = [];
    this.actionStack = [];
    this.currentAction = null;

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

    if (!params.attackOrigin) {
      this.attackOrigin = {
        offset: new Point(this.collisionDimensions[0].offset).plus({ z: 20 }),
        dimensions: new Dimensions({
          width: this.collisionDimensions[0].dimensions.width,
          height: this.collisionDimensions[0].dimensions.height
        })
      };
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
    this.direction = this.direction.normalize();
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

  startAction(action) {

  }

  stopAction(action) {
  }

  canDoAction(action) {
    let top = _.head(this.actionStack);
    if (top && (top.actionType === "exclusive" && action.actionType === "exclusive" || top.actionType === "blocking")) {
      return false;
    }

    let manaCost = action.manaCost || 0;
    let healthCost = action.healthCost || 0;
    // TODO: add elapsedTime to cooldown here?
    let cooldown = _.find(this.cooldowns, { actionName: action.name });
    return this.state.currentMana >= manaCost && this.state.currentHealth >= healthCost && !cooldown;
  }

  nextAction(elapsedTime) {
    // Start next action in stack
    if (this.actionStack.length > 0) {
      if (this.canDoAction(this.actionStack[0])) {
        this.startAction(this.actionStack[0], elapsedTime);
      }
    }
  }

  // TODO: pull this outside of character class
  doAction(type, stopAction, action, elapsedTime, cb) {
    let top = _.head(this.actionStack);
    if (stopAction) {
      let actionToStop = _.find(this.actionStack, { name: action.name });
      // TODO: change "blocking" to "charging"?
      if (actionToStop && actionToStop.actionType !== "blocking") {
        this.stopAction(actionToStop, elapsedTime);
        _.pull(this.actionStack, actionToStop);
        this.nextAction(elapsedTime);
      }
    } else {
      if (this.canDoAction(action)) {
        this.state.currentHealth -= action.healthCost || 0;
        this.state.currentMana -= action.manaCost || 0;
        let newAction = {
          type: type,
          name: action.name,
          currentTime: elapsedTime || 0,
          actionDuration: action.actionDuration || 0,
          actionType: action.actionType,
          actionRate: action.actionRate,
          automatic: action.automatic,
          action: action,
          cb: cb
        };
        this.actionStack.unshift(newAction);

        // Pause previous action
        if (top) {
          top.currentTime = 0;
        }
        this.startAction(newAction, elapsedTime);
      }
    }
  }

  setTarget(target) {
    this.state.target = new Point(target);
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

  updateActions(elapsedTime) {
    let action = _.head(this.actionStack);

    if (action) {
      let cooldownTimeDiff = 0;
      let cooldown = _.find(this.cooldowns, { actionName: action.name });
      if (cooldown) {
        cooldownTimeDiff = cooldown.currentTime - cooldown.cooldownTime;
      }

      if (cooldownTimeDiff >= 0) {
        action.currentTime += (elapsedTime + cooldownTimeDiff);
        if (action.currentTime >= action.actionDuration) {
          let actionTimeDiff = action.actionDuration - action.currentTime;
          if (action.cb) action.cb(actionTimeDiff);

          if (action.actionRate) {
            this.cooldowns.push({
              actionName: action.name,
              currentTime: actionTimeDiff,
              cooldownTime: 1000 / action.actionRate
            });
          }

          if (action.automatic) {
            action.currentTime = actionTimeDiff;
          } else {
            this.actionStack.shift();
          }
          this.nextAction(actionTimeDiff);
        }
      }
    }
  }

  update(elapsedTime) {
    this.renderer.update(elapsedTime + this.elapsedTime, this);
    for (const cooldown of this.cooldowns) {
      cooldown.currentTime += elapsedTime;
    }
    this.updateActions(elapsedTime);
    _.remove(this.cooldowns, (cooldown) => {
      if (cooldown.currentTime >= cooldown.cooldownTime) {
        console.log("remove");
      }
      return cooldown.currentTime >= cooldown.cooldownTime;
    });
    
    // if (this.state.attacking) {
    //   this.state.attackTime += elapsedTime + this.elapsedTime;
    //   if (this.state.attackTime >= this.attackDuration) {
    //     this.state.attackTime = 0;
    //     this.state.attacking = false;
    //   }
    // }
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
    let actionStack = [];
    if (this.actionStack.length > 0) {
      actionStack.push(_.pick(this.actionStack[0], [
        "type", "name", "currentTime", "actionDuration", "actionRate"
      ]));
    }
    return Object.assign(super.getUpdateState(), _.pick(this, [
      "state",
      "body",
      "gender",
      "isPlayer",
      // TODO: make this part of character type, or just part of weapon
      "damagedEffect"
    ], {
      actionStack: actionStack
    }));
  }
}
