import GameObject from "../../Engine/GameObject/GameObject.mjs"
import Vec3 from "../../Engine/GameObject/Vec3.mjs"
import Bounds from "../../Engine/GameObject/Bounds.mjs"
import Dimensions from "../../Engine/GameObject/Dimensions.mjs"
import CharacterRenderer, { STATE } from "./CharacterRenderer.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"
import GameSettings from "../../Engine/GameSettings.mjs"
import equipment from "../Objects/equipment.mjs"
import characters from "./characters.mjs"
import effects from "../Effects/effects.mjs"
import magicEffects from "../Magic/magicEffects.mjs";
import attacks from "../Magic/attacks.mjs"
import actions from "../Scripts/actions.mjs"


function getAction(name) {
  let action = attacks[name];
  if (!action) {
    action = magicEffects[name];
  }
  if (!action) {
    action = actions[name];
  }

  return action.action;
}

export default class Character extends GameObject {
  constructor(params) {
    super(params);

    this.actionIdIncrement = GameSettings.isServer ? 1 : -1;
    this.actionId = GameSettings.isServer ? 1 : -1;

    this.type = "Character";
    this.characterInfo = params.characterInfo;
    this.state = {};
    this.initFromCharacterType(params.characterInfo.type);
    _.merge(this.state, params.state);

    this.state.currentHealth = this.state.maxHealth;
    this.state.currentMana = this.state.maxMana;
    this.state.hasHealth = !!this.state.maxHealth;
    this.state.hasMana = !!this.state.maxMana;

    this.losHidden = true;
    this.cooldowns = [];
    this.actionStack = [];
    
    this.physics.surfaceType = "character";

    if (!params.simulation) {
      this.renderer = new CharacterRenderer(this.characterInfo);
    }

    if (this.state.dead) {
      this.kill();
    }
  }

  sameTeamAs(target) {
    return this === target || this.team && this.team === target.team;
  }

  updateDimensions() {
    let dimensions = _.cloneDeep(characters[this.characterInfo.type].dimensions[this.state.characterDirection]);

    this.modelDimensions = dimensions.modelDimensions;
    this.collisionDimensions = dimensions.collisionDimensions;
    this.visibleDimensions = dimensions.visibleDimensions || dimensions.collisionDimensions;
    this.dimensions = dimensions.dimensions;
    this.perspectiveOffset = dimensions.perspectiveOffset;

    if (dimensions.attackOrigin) {
      this.attackOrigin = dimensions.attackOrigin;
    } else if (this.collisionDimensions.length > 0) {
      this.attackOrigin = {
        offset: new Vec3(this.collisionDimensions[0].offset).plus({
          z: this.collisionDimensions[0].dimensions.zheight / 2
        }),
        dimensions: new Dimensions({
          width: this.collisionDimensions[0].dimensions.width,
          height: this.collisionDimensions[0].dimensions.height
        })
      };
    } else {
      this.attackOrigin = this.center;
    }

    this.updateBounds();
  }

  initFromCharacterType(type) {
    let typeInfo = _.cloneDeep(characters[type]);

    _.merge(this.state, typeInfo.stats);
    _.defaults(this.state, {
      target: this.position,
      inventory: [],
      loadout: {},
      cosmetics: {},
      characterDirection: "down",
      attacking: false,
      attackTime: 0
    });

    this.fov = typeInfo.fov;
    this.speed = typeInfo.stats.speed;
    this.baseSpeed = typeInfo.stats.speed;
    this.damagedEffect = typeInfo.rendering.damagedEffect;
    this.updateDimensions();
  }

  get fovDimensions() {
    return {
      center: this.attackCenter,
      target: this.state.target,
      range: this.fov.range,
      angle: this.fov.angle
    };
  }

  // TODO: should probably put somewhere else, but could be adjusted for each character
  // Also don't hard code the numbers
  get viewBounds() {
    // Get roughly 2x actual view bounds
    return new Bounds({
      position: this.center.minus({
        x: 1600,
        y: 1200
      }),
      dimensions: {
        width: 3200,
        height: 2400
      }
    });
  }

  isWeapon(item) {
    return equipment[item].type === "weapon";
  }

  previousWeapon() {
    let inventory = this.state.inventory.slice().reverse();
    let current = inventory.indexOf(this.state.loadout.weapon);
    let next = _.find(inventory, this.isWeapon, current + 1);
    if (!next) {
      next = _.find(inventory, this.isWeapon);
    }
    if (next) {
      this.stopAllActions();
      this.state.loadout.weapon = next;
    }
  }

  nextWeapon() {
    let current = this.state.inventory.indexOf(this.state.loadout.weapon);
    let next = _.find(this.state.inventory, this.isWeapon, current + 1);
    if (!next) {
      next = _.find(this.state.inventory, this.isWeapon);
    }
    if (next) {
      this.stopAllActions();
      this.state.loadout.weapon = next;
    }
  }

  setDirection(direction) {
    Object.assign(this.direction, direction);
    this.direction = this.direction.normalize();
    this.direction.z = Math.sign(this.direction.z);
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

  damage(source, amount) {
    this.state.currentHealth = Math.max(0, this.state.currentHealth - amount);
    if (!this.state.dead && this.state.currentHealth <= 0) {
      this.kill(source);
    }
  }

  kill(source) {
    this.state.dead = true;
    this.state.canInteract = false;
    this.losHidden = false;
    this.dimensions.zheight = 0;
    this.position.z = 0;
    this.physics.surfaceType = SURFACE_TYPE.GAS;
    //this.collisionDimensions = [];
    this.killedBy = source && source.ownerId;
    this.speed = 0;
    this.direction.x = 0;
    this.direction.y = 0;
    this.stopAllActions();
    this.updatePosition();
  }

  startAction(action, elapsedTime) {
    this.latestAction = action;
    if (!this.currentAction) {
      this.actionStack.unshift(action);
    }
  }

  stopAllActions() {
    this.actionStack.length = 0;
    // let topAction = this.actionStack.shift();
    // while (topAction) {
    //   this.stopAction(topAction);
    //   topAction = this.actionStack.shift();
    // }
  }

  stopAction(action, elapsedTime) {
    // Release charged attack
    if (action.action.charge && this.canDoAction(action)) {
      this.updateAction(action, elapsedTime);
      if (!action.action.actionDuration || action.currentTime >= action.action.actionDuration) {
        let modifiers = {};
        _.each(action.action.charge, (mod, type) => {
          modifiers[type] = Math.min(mod.maxMult, 1 + (mod.maxMult - 1) * ((action.currentTime - action.action.actionDuration) / mod.maxTime));
        });
        this.completeAction(action, modifiers);
      }
    }
    _.pull(this.actionStack, action);
    this.nextAction(elapsedTime);
  }

  canDoAction(action) {
    let manaCost = action.manaCost || 0;
    let hasEnoughMana = !manaCost || this.state.currentMana >= manaCost;
    let healthCost = action.healthCost || 0;
    let hasEnoughHealth = !healthCost || this.state.currentHealth >= healthCost;
    // TODO: add elapsedTime to cooldown here?
    let cooldown = _.find(this.cooldowns, { actionName: action.name });
    return this.canQueueAction(action) && hasEnoughHealth && hasEnoughMana && !cooldown;
  }

  addItem(itemType) {
    if (!this.state.inventory.includes(itemType)) {
      this.state.inventory.push(itemType);
    }
  }

  canQueueAction(action) {
    let top = this.currentAction;
    if (top !== action && top && (top.action.actionType === "exclusive" && action.action.actionType === "exclusive" || top.action.actionType === "blocking")) {
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
      if (actionToStop && actionToStop.action.actionType !== "blocking") {
        this.stopAction(actionToStop, elapsedTime);
      }
    } else {
      if (this.canQueueAction(action)) {
        let newAction = {
          type: type,
          name: action.name,
          actionId: this.actionId += this.actionIdIncrement,
          currentTime: elapsedTime || 0,
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
    action.finishedTime = action.finishedTime || 0;
    let actionTimeDiff = action.finishedTime - (action.action.actionDuration || 0);
    if (action.action) {
      let manaCost = action.action.manaCost || 0;
      let healthCost = action.action.healthCost || 0;
      if ((!manaCost || this.state.currentMana >= manaCost) &&
           (!healthCost || this.state.currentHealth >= healthCost)) {
        this.state.currentHealth -= action.action.healthCost || 0;
        this.state.currentMana -= action.action.manaCost || 0;
        if (action.cb) action.cb(actionTimeDiff, modifiers, action);
      }
    }

    let cooldown;
    if (action.action.actionRate) {
      cooldown = {
        actionName: action.name,
        currentTime: actionTimeDiff - (1000 / action.action.actionRate),
        cooldownTime: 1000 / action.action.actionRate
      };
      this.cooldowns.push(cooldown);
    }

    if (action.action.automatic) {
      //action.currentTime = -actionTimeDiff;
      action.currentTime = 0;
      action.finishedTime = 0;
      this.updateAction(action, 0);
      //this.nextAction(-actionTimeDiff);
    } else if (action.action.actionType === "channeling") {
      action.channeling = true;
    } else {
      this.actionStack.shift();
      this.nextAction(-actionTimeDiff);
    }
  }

  setTarget(target) {
    if (this.state.dead) return;

    this.state.target = new Vec3(target);
    let center = this.attackCenter;
    let direction = new Vec3(target).minus(center).normalize();

    // TODO: slow down character if target direction doesn't match movement direction
    if (target.x < center.x && Math.abs(direction.x) >= Math.abs(direction.y)) {
      this.state.characterDirection = "left";
    } else if (target.x > center.x && Math.abs(direction.x) >= Math.abs(direction.y)) {
      this.state.characterDirection = "right";
    } else if (target.y > center.y && Math.abs(direction.y) >= Math.abs(direction.x)) {
      this.state.characterDirection = "down";
    } else if (target.y < center.y && Math.abs(direction.y) >= Math.abs(direction.x)) {
      this.state.characterDirection = "up";
    }

    this.targetRotation = Math.atan2(direction.y, direction.x ) * 180 / Math.PI;
    this.updateDimensions();
  }

  updateAction(action, elapsedTime) {
    if (action && !action.channeling) {
      // TRICKY: make each action last for at least one frame even if it has 0 duration
      // Find a better way of dealing with this
      if (action.new) {
        if (this.canDoAction(action)) {
          elapsedTime = 0;
          action.new = false;
        }
        return;
      }
      let cooldownTimeDiff = 0;
      let cooldown = _.find(this.cooldowns, { actionName: action.name });
      if (cooldown) {
        cooldownTimeDiff = cooldown.currentTime - cooldown.cooldownTime;
      }

      if (cooldownTimeDiff >= 0) {
        _.pull(this.cooldowns, cooldown);
        action.currentTime += (elapsedTime + cooldownTimeDiff);
        if (!action.action.actionDuration || action.currentTime >= action.action.actionDuration) {
          if (!action.finishedTime) {
            action.finishedTime = action.currentTime || 0;
          }
          if (!action.action.charge) {
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
    this.latestAction = null;
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
    // TODO: handle overshooting movetoposition
    if (this.moveToPosition) {
      let direction = this.moveToPosition.minus(this.position);
      let dist = this.position.distanceTo(this.moveToPosition);
      if (dist <= 1 || !this.direction.sameAs(direction)) {
        this.position = this.moveToPosition;
        this.moveToPosition = null;
        this.direction = new Vec3();
      } else {
        //this.position.add(direction);
      }
    }

    if (this.pointToTarget) {
      this.currentInterpolateTime += elapsedTime;
      let time = Math.min(1.0, this.currentInterpolateTime / this.interpolateTime);
      let target = this.previousTarget
        .plus(this.pointToTarget.minus(this.previousTarget).times(time));
      this.setTarget(target);
      if (time >= 1.0) {
        this.pointToTarget = null;
      }
    }

    this.renderer.update(elapsedTime + this.elapsedTime, this);
    for (const cooldown of this.cooldowns) {
      cooldown.currentTime += elapsedTime + this.elapsedTime;
    }
    this.updateAction(this.currentAction, elapsedTime + this.elapsedTime);
    _.remove(this.cooldowns, (cooldown) => {
      return cooldown.currentTime >= cooldown.cooldownTime;
    });

    if (this.position.z > this.state.maxAltitude) {
      this.position.z = this.state.maxAltitude;
    }

    // if (this.targetPosition) {
    //   if (Math.abs(this.position.x - this.targetPosition.x) <= 15 && 
    //       Math.abs(this.position.y - this.targetPosition.y) <= 15) {
    //     this.targetPosition = null;
    //     this.direction = new Vec3();
    //   } else {
    //     this.moveTo(this.targetPosition);
    //   }
    // }
  }

  updateState(state, interpolateTime) {
    if (!this.state.dead && _.get(state, "state.dead")) {
      this.kill();
    }

    _.merge(this, _.omit(state, "position", "direction", "state", "latestAction"));
    _.merge(this.state, _.omit(state.state, "target", "characterDirection"));
    //_.merge(this, state);
    // TODO: interpolate target location
    // if (state.position) {
    //   this.moveToPosition = new Vec3(state.position);
    // }
    if (!this.isThisPlayer) {
      if (state.latestAction && (!this.currentAction || state.latestAction.actionId !== this.currentAction.actionId)) {
        // Pause previous action
        // if (this.currentAction) {
        //   this.currentAction.currentTime = 0;
        // }
  
        state.latestAction.action = getAction(state.latestAction.name);
        this.actionStack.unshift(state.latestAction);
        this.startAction(state.latestAction);
      } else if (!state.latestAction && !this.isThisPlayer) { // TODO: set a timeout for the current action in case the player really shouldn't be able to do it
        this.actionStack.length = 0;
      }
      // if (this.moveToPosition) {
      //   this.position = this.moveToPosition;
      // }
      // if (state.state.target) {
      //   this.setTarget(state.state.target);
      // }
      this.currentInterpolateTime = 0;
      this.interpolateTime = interpolateTime;
      if (state.direction) {
        this.setDirection(state.direction);
      }
      if (state.state.target) {
        this.pointToTarget = new Vec3(state.state.target);
        this.previousTarget = new Vec3(this.state.target);
      }

      if (state.position && !this.position.equals(state.position)) {
        if (state.level !== this.level || this.position.distanceTo(state.position) > this.speed / 2) {
          this.position = new Vec3(state.position);
          this.lastPosition = this.position.copy();
        } else {
          let dist = this.position.distanceTo(state.position);
          if (interpolateTime > 0 && dist >= 1) {
            this.startPosition = new Vec3(this.position);
            this.moveToPosition = new Vec3(state.position);
            this.setDirection(this.moveToPosition.minus(this.startPosition));
            //this.speed = dist * (1000 / interpolateTime);
            //this.targetDirection = state.direction;
          } else {
            // this.position = new Vec3(state.position);
            // this.lastPosition = new Vec3(this.position);
            this.speed = state.speed || this.baseSpeed;
            this.direction = new Vec3(state.direction) || new Vec3();
          }
        }
      }
    } else {
      // Updates just for this player
      if (state.position && (state.level !== this.level || this.position.distanceTo(state.position) > this.speed / 2)) {
        this.position = new Vec3(state.position);
        this.lastPosition = this.position.copy();
      }

      if (state.latestAction) {
        if (!this.currentAction || state.latestAction.name !== this.currentAction.name) {
          state.latestAction.action = getAction(state.latestAction.name);
          this.actionStack.unshift(state.latestAction);
          this.startAction(state.latestAction);
        } else if (state.latestAction.name === this.currentAction.name) {
          this.currentAction.actionId = state.latestAction.actionId;
        }
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
        "new",
        "actionId"
      ]);
    }
    // let actionStack = [];
    // if (this.actionStack.length > 0) {
    //   actionStack.push(_.pick(this.actionStack[0], [
    //     "type", "name", "currentTime", "actionDuration", "actionRate"
    //   ]));
    // }
    return Object.assign(
      super.getUpdateState(),
      _.pick(this, [
        "team",
        "state",
        "body",
        "gender",
        "isPlayer",
        "killedBy",
        "characterInfo"
      ]),
      // _.pick(_.pick(this, [
      //   "team",
      //   "state",
      //   "body",
      //   "gender",
      //   "isPlayer",
      //   "killedBy",
      //   "characterInfo"
      // ]), this._modifiedKeys),
      {
        latestAction: latestAction
      }
    );
  }
}
