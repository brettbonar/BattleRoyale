import GameObject from "../../Engine/GameObject/GameObject.mjs"
import Point from "../../Engine/GameObject/Point.mjs"
import Dimensions from "../../Engine/GameObject/Dimensions.mjs"
import CharacterRenderer, { STATE } from "../Renderers/CharacterRenderer.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"
import GameSettings from "../../Engine/GameSettings.mjs"
import equipment from "./equipment.mjs"

class Action {
  constructor(params) {
  }
}

let actionId = 0;

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
    this.baseSpeed = this.speed;

    // actionDuration
    // actionRate
    // actionCooldown
    // currentDuration
    // currentCooldown
    // active
    this.cooldowns = [];
    this.actionStack = [];

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
        offset: new Point(this.collisionDimensions[0].offset).plus({
          y: this.collisionDimensions[0].dimensions.height,
          z: 20
        }),
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

  isWeapon(item) {
    return equipment[item].type === "weapon";
  }

  previousWeapon() {
    let inventory = this.state.inventory.slice().reverse();
    let current = inventory.indexOf(this.state.loadout.weapon.itemType);
    let next = _.find(inventory, this.isWeapon, current + 1);
    if (!next) {
      next = _.find(inventory, this.isWeapon);
    }
    if (next) {
      this.stopAllActions();
      this.state.loadout.weapon = equipment[next];
    }
  }

  nextWeapon() {
    let current = this.state.inventory.indexOf(this.state.loadout.weapon.itemType);
    let next = _.find(this.state.inventory, this.isWeapon, current + 1);
    if (!next) {
      next = _.find(this.state.inventory, this.isWeapon);
    }
    if (next) {
      this.stopAllActions();
      this.state.loadout.weapon = equipment[next];
    }
  }

  setDirection(direction) {
    Object.assign(this.direction, direction);
    this.direction = this.direction.normalize();
  }

  get attackCenter() {
    let center = this.position
      .plus(this.attackOrigin.offset)
      .plus({
        x: this.attackOrigin.dimensions.width / 2,
        y: this.attackOrigin.dimensions.height / 2
      });
    return center;
  }

  damage(source) {
    this.state.currentHealth -= source.effect.damage;
    if (!this.state.dead && this.state.currentHealth <= 0) {
      this.kill(source);
    }
  }

  kill(source) {
    this.state.dead = true;
    this.dimensions.zheight = 0;
    this.physics.surfaceType = SURFACE_TYPE.NONE;
    this.updatePosition();
  }

  startAction(action, elapsedTime) {
    this.latestAction = action;
    if (!this.currentAction) {
      this.actionStack.unshift(action);
    }
  }

  stopAllActions() {
    let topAction = this.actionStack.shift();
    while (topAction) {
      this.stopAction(topAction);
      topAction = this.actionStack.shift();
    }
  }

  stopAction(action, elapsedTime) {
    // Release charged attack
    if (action.charge && this.canDoAction(action)) {
      this.updateAction(action, elapsedTime);
      if (!action.actionDuration || action.currentTime >= action.actionDuration) {
        let modifiers = {};
        _.each(action.charge, (mod, type) => {
          modifiers[type] = Math.min(mod.maxMult, 1 + (mod.maxMult - 1) * ((action.currentTime - action.actionDuration) / mod.maxTime));
        });
        this.completeAction(action, modifiers);
      }
    }
    _.pull(this.actionStack, action);
    this.nextAction(elapsedTime);
  }

  canDoAction(action) {
    let manaCost = action.manaCost || 0;
    let healthCost = action.healthCost || 0;
    // TODO: add elapsedTime to cooldown here?
    let cooldown = _.find(this.cooldowns, { actionName: action.name });
    return this.canQueueAction(action) && this.state.currentMana >= manaCost && this.state.currentHealth >= healthCost && !cooldown;
  }

  canQueueAction(action) {
    let top = this.currentAction;
    if (top !== action && top && (top.actionType === "exclusive" && action.actionType === "exclusive" || top.actionType === "blocking")) {
      return false;
    }
    return true;
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
  doAction(type, stopAction, action, elapsedTime, cb, stopCb) {
    let top = this.currentAction;
    elapsedTime = elapsedTime || 0;
    if (stopAction) {
      let actionToStop = _.find(this.actionStack, { name: action.name });
      // TODO: change "blocking" to "charging"?
      if (actionToStop && actionToStop.actionType !== "blocking") {
        this.stopAction(actionToStop, elapsedTime);
      }
    } else {
      if (this.canQueueAction(action)) {
        let newAction = {
          type: type,
          name: action.name,
          actionId: actionId++,
          currentTime: elapsedTime || 0,
          actionDuration: action.actionDuration || 0,
          actionType: action.actionType,
          actionRate: action.actionRate,
          automatic: action.automatic,
          charge: action.charge,
          action: action,
          new: true,
          stopCb: stopCb,
          cb: cb
        };
        this.actionStack.unshift(newAction);

        // Pause previous action
        if (top) {
          top.currentTime = 0;
          top.finalTime = 0;
        }
        this.startAction(newAction, elapsedTime);
      }
    }
  }

  completeAction(action, modifiers) {
    let actionTimeDiff = action.finishedTime - action.actionDuration;
    if (action.action) {
      let manaCost = action.action.manaCost || 0;
      let healthCost = action.action.healthCost || 0;
      if (this.state.currentMana >= manaCost && this.state.currentHealth >= healthCost) {
        this.state.currentHealth -= action.action.healthCost || 0;
        this.state.currentMana -= action.action.manaCost || 0;
        if (action.cb) action.cb(actionTimeDiff, modifiers, action);
      }
    }

    let cooldown;
    if (action.actionRate) {
      cooldown = {
        actionName: action.name,
        currentTime: actionTimeDiff - (1000 / action.actionRate),
        cooldownTime: 1000 / action.actionRate
      };
      this.cooldowns.push(cooldown);
    }

    if (action.automatic) {
      //action.currentTime = -actionTimeDiff;
      action.currentTime = 0;
      action.finishedTime = 0;
      this.updateAction(action, 0);
      //this.nextAction(-actionTimeDiff);
    } else if (action.actionType === "channeling") {
      action.channeling = true;
    } else {
      this.actionStack.shift();
      this.nextAction(-actionTimeDiff);
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

  updateAction(action, elapsedTime) {
    if (action && !action.channeling) {
      if (action.new) {
        if (!this.canDoAction(action)) return;
        elapsedTime = 0;
        action.new = false;
      }
      let cooldownTimeDiff = 0;
      let cooldown = _.find(this.cooldowns, { actionName: action.name });
      if (cooldown) {
        cooldownTimeDiff = cooldown.currentTime - cooldown.cooldownTime;
      }

      if (cooldownTimeDiff >= 0) {
        _.pull(this.cooldowns, cooldown);
        action.currentTime += (elapsedTime + cooldownTimeDiff);
        if (!action.actionDuration || action.currentTime >= action.actionDuration) {
          if (!action.finishedTime) action.finishedTime = action.currentTime;
          if (!action.charge) {
            this.completeAction(action);
          }
        }
      }
    }
  }

  get currentAction() {
    return _.head(this.actionStack);
  }

  update(elapsedTime) {
    // if (this.moveToPosition) {
    //   this.moving = true;
    //   this.currentInterpolateTime += elapsedTime;
    //   let time = Math.min(1.0, this.currentInterpolateTime / this.interpolateTime);
    //   this.position = this.startPosition
    //     .plus(this.moveToPosition.minus(this.startPosition).times(time));
    //   if (time >= 1.0) {
    //     this.moveToPosition = null;
    //     this.moving = false;
    //   }
    // }

    this.renderer.update(elapsedTime + this.elapsedTime, this);
    for (const cooldown of this.cooldowns) {
      cooldown.currentTime += elapsedTime + this.elapsedTime;
    }
    this.updateAction(this.currentAction, elapsedTime + this.elapsedTime);
    _.remove(this.cooldowns, (cooldown) => {
      return cooldown.currentTime >= cooldown.cooldownTime;
    });

    // if (this.targetPosition) {
    //   if (Math.abs(this.position.x - this.targetPosition.x) <= 15 && 
    //       Math.abs(this.position.y - this.targetPosition.y) <= 15) {
    //     this.targetPosition = null;
    //     this.direction = new Point();
    //   } else {
    //     this.moveTo(this.targetPosition);
    //   }
    // }
  }

  updateState(state, interpolateTime) {
    _.merge(this, _.omit(state, "position", "direction"));
    //_.merge(this, state);
    if (state.latestAction && (!this.currentAction || state.latestAction.actionId !== this.currentAction.actionId)) {
      // Pause previous action
      // if (this.currentAction) {
      //   this.currentAction.currentTime = 0;
      // }
      this.actionStack.unshift(state.latestAction);
      this.startAction(state.latestAction);
    } else if (!state.latestAction) {
      this.actionStack.length = 0;
    }
    // TODO: interpolate target location
    if (state.target) {
      this.setTarget(state.target);
    }
    if (state.direction) {
      this.setDirection(state.direction);
    }
    if (state.position && !this.position.equals(state.position)) {
      // if (this.moveToPosition) {
      //   this.position = this.moveToPosition;
      // }
      let dist = this.position.distanceTo(state.position);
      if (interpolateTime > 0 && dist >= 1) {
        this.startPosition = new Point(this.position);
        this.moveToPosition = new Point(state.position);
        this.currentInterpolateTime = 0;
        this.interpolateTime = interpolateTime;
        this.direction = this.moveToPosition.minus(this.startPosition).normalize();
        this.speed = dist * (1000 / interpolateTime);
        //this.targetDirection = state.direction;
      } else {
        // this.position = new Point(state.position);
        // this.lastPosition = new Point(this.position);
        this.speed = state.speed || this.baseSpeed;
        this.direction = new Point(state.direction) || new Point();
      }
    }
  }

  getUpdateState() {
    let latestAction = this.currentAction || this.latestAction;
    if (latestAction) {
      latestAction = _.pick(latestAction, [
        "type",
        "name",
        "currentTime",
        "finishedTime",
        "actionDuration",
        "actionRate",
        "new",
        "actionId",
        "actionType"
      ]);
    }
    this.latestAction = null;
    // let actionStack = [];
    // if (this.actionStack.length > 0) {
    //   actionStack.push(_.pick(this.actionStack[0], [
    //     "type", "name", "currentTime", "actionDuration", "actionRate"
    //   ]));
    // }
    return Object.assign(super.getUpdateState(), _.pick(this, [
      "state",
      "body",
      "gender",
      "isPlayer",
      // TODO: make this part of character type, or just part of weapon
      "damagedEffect"
    ]), {
      //currentAction: this.currentAction,
      latestAction: latestAction
    });
  }
}
