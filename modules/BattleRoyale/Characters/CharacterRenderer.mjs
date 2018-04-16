import { drawShadow } from "../../Engine/Rendering/renderUtils.mjs";
import Dimensions from "../../Engine/GameObject/Dimensions.mjs"
import Vec3 from "../../Engine/GameObject/Vec3.mjs"
import ImageCache from "../../Engine/Rendering/ImageCache.mjs";
import characters from "./characters.mjs"
import teams from "../Teams.mjs"
import equipment from "../Objects/equipment.mjs"

export const STATE = {
  IDLE: "idle",
  MOVING: "moving",
  ATTACKING: "attacking",
  DEAD: "dead"
};

const MARKER_COLORS = {
  [teams.SOLO]: "white",
  [teams.SHADOW]: "black"
};

const LOADOUT_ORDER = [
  "back",
  "body",
  "legs",
  "feet",
  "belt",
  "shoulders",
  "torso",
  "head",
  "hands",
  "weapon",
  "offhand"
];

function getOffset(offset, frame, dimensions) {
  return {
    x: offset.x + frame * dimensions.width,
    y: offset.y
  };
}

const CHARACTER_TYPE = {
  HUMANOID: 0,
  BAT: 1
}

export default class CharacterRenderer {
  constructor(characterInfo) {
    this.characterInfo = characterInfo;

    let typeInfo = characters[characterInfo.type];
    this.rendering = typeInfo.rendering;
    
    this.loadout = {};
    this.cosmetics = {};
    this.animationQueue = [];
    this.frame = 0;
    this.currentTime = 0;
    this.currentAnimationTime = 0;
 
    if (this.rendering.shadowImage) {
      this.shadowImage = ImageCache.get(this.rendering.shadowImage);
    }

    if (this.characterInfo.type === "humanoid") {
      this.initBody(characterInfo);
    } else {
      this.body = ImageCache.get(this.rendering.body);
    }
  }

  hasLoadout() {
    return this.characterInfo.type === "humanoid" && this.loadout;
  }

  initBody(characterInfo) {
    this.body = ImageCache.get("/Assets/character/body/" + characterInfo.gender + "/" + characterInfo.body + ".png");
  }

  updateLoadout(character) {
    // TODO: don't clone every time. Just update pieces that have changed.
    this.loadout = character.state.loadout;
    this.cosmetics = {};
    _.each(this.loadout, (piece) => {
      let item = equipment[piece];
      if (item.cosmetics) {
        for (const cosmetic of item.cosmetics) {
          this.cosmetics[equipment[cosmetic].type] = cosmetic;
        }
      }
    });
  }

  static drawStatusBars(context, object, statusBarOffset) {
    let barHeight = 4;
    let barWidth = 40;

    let offset = new Vec3({
      x: object.position.x + object.width / 2 - barWidth / 2,
      y: object.position.y - object.position.z - barHeight
    }).plus(statusBarOffset);

    if (object.state.hasMana) {
      context.fillStyle = "blue";
      context.strokeStyle = "black";
      context.fillRect(offset.x, offset.y,
        Math.max(0, barWidth * (object.state.currentMana / object.state.maxMana)), barHeight);
      context.strokeRect(offset.x, offset.y, barWidth, barHeight);
      offset.y -= (barHeight + 4);
    }

    if (object.state.hasHealth) {
      context.fillStyle = "red";
      context.strokeStyle = "black";
      context.fillRect(offset.x, offset.y,
        Math.max(0, barWidth * (object.state.currentHealth / object.state.maxHealth)), barHeight);
      context.strokeRect(offset.x, offset.y, barWidth, barHeight);
    }
  }

  drawLoadout(context, object) {
    for (const piece of LOADOUT_ORDER) {
      let itemType = this.loadout[piece] || this.cosmetics[piece];
      if (!itemType && piece === "body") {
        this.drawBody(context, object);
      } else if (itemType) {
        let item = equipment[itemType];
        let imageSource, renderOffset, dimensions, animationOffset;
        if (item.rendering) {
          imageSource = item.rendering.imageSource;
          renderOffset = item.rendering.renderOffset;
          dimensions = item.rendering.dimensions;
          let diff = {
            x: dimensions.width / this.currentAnimationSettings.dimensions.width,
            y: dimensions.height / this.currentAnimationSettings.dimensions.height
          };
          animationOffset = {
            x: this.currentAnimationSettings.offset.x * diff.x,
            y: this.currentAnimationSettings.offset.y * diff.y
          };
        } else {
          animationOffset = this.currentAnimationSettings.offset;
          imageSource = item.imageSource;
          dimensions = {
            width: item.imageSize,
            height: item.imageSize
          };
        }
        let image = ImageCache.get(imageSource);

        if (image && image.complete) {
          let offset = getOffset(animationOffset, this.frame, dimensions);
          let position = object.position.plus(renderOffset);
          context.drawImage(image, offset.x, offset.y, dimensions.width, dimensions.height,
            position.x, position.y - position.z, dimensions.width, dimensions.height);
        }
      }
    }
  }

  getDirectionMarkerImage(object) {
    let path = "/Assets/direction_markers/";
    let fov = object.fov.angle;
    let color = MARKER_COLORS[object.team];
    return ImageCache.get(path + fov + "_" + color + ".png");
  }

  drawDirectionMarker(context, object) {
    let image = this.getDirectionMarkerImage(object);
    if (image && image.complete) {
      context.save();

      let position = {
        x: object.attackCenter.x - image.width / 2,
        y: object.attackCenter.y - image.height / 2
      };
      let center = {
        x: position.x + image.width / 2,
        y: position.y + image.height / 2
      };
      if (object.targetRotation) {
        context.translate(center.x, center.y);
        context.rotate((object.targetRotation * Math.PI) / 180);
        context.translate(-center.x, -center.y);    
      }
      
      context.drawImage(image, position.x, position.y);

      context.restore();
    }
  }

  drawBody(context, object) {
    let animationSettings = this.currentAnimationSettings;
    let dimensions = this.rendering.bodyDimensions || animationSettings.dimensions;
    let offset = getOffset(animationSettings.offset, this.frame, dimensions);
    let position = object.position.plus(animationSettings.renderOffset);

    context.drawImage(this.body, offset.x, offset.y, dimensions.width, dimensions.height,
      position.x, position.y - position.z, dimensions.width, dimensions.height);
  }

  render(context, object, elapsedTime, center) {
    if (!this.body.complete) return;

    if (!object.state.dead) {
      this.drawDirectionMarker(context, object);
    }

    if (this.shadowImage) {
      context.drawImage(this.shadowImage,
        object.position.x + object.width / 2 - this.shadowImage.width / 2,
        object.position.y + object.height - this.shadowImage.height / 2 - 5);
    }

    if (this.hasLoadout()) {
      this.drawLoadout(context, object);
    } else {
      this.drawBody(context, object);
    }

    if (this.state !== STATE.DEAD && !object.isOtherPlayer) {
      CharacterRenderer.drawStatusBars(context, object, this.rendering.statusBarOffset);
    }

    // DEBUG
    // let box = object.boundingBox.box;
    // context.strokeStyle = "magenta";
    // context.strokeRect(box.ul.x, box.ul.y, object.width, object.height);

    // let terrainBox = object.terrainBoundingBox.box;
    // context.strokeStyle = "aqua";
    // context.strokeRect(terrainBox.ul.x, terrainBox.ul.y,
    //   object.terrainDimensions.width, object.terrainDimensions.height);
  }

  get currentAnimationFramesPerSec() {
    if (this.currentAnimationDuration) {
      return this.currentAnimationSettings.frames / (this.currentAnimationDuration / 1000);
    } else {
      return this.currentAnimationSettings.framesPerSec;
    }
  }

  get currentAnimationSettings() {
    return this.rendering.ANIMATION_SETTINGS[this.currentAnimation];
  }

  get currentAnimationDone() {
    return this.animationQueue.length > 0 && this.animationQueue[0].done;
  }

  get currentAnimation() {
    return this.animationQueue.length > 0 && this.animationQueue[0].animation;
  }

  get currentAnimationDuration() {
    return this.currentAction && this.currentAction.actionDuration;
  }

  get state() {
    return this.animationQueue.length > 0 && this.animationQueue[0].state;
  }

  queueAnimation(animation, state) {
    if (this.currentAnimation !== animation) {
      let animationSettings = this.rendering.ANIMATION_SETTINGS[animation];
      if (animationSettings.forceAnimation) {
        if (this.currentAnimationDone && state !== this.state) {
          this.frame = 0;
        }
        // Clear the whole queue when forcing an animation
        this.animationQueue.length = 0;
      } else {
        if (this.currentAnimationDone && state !== this.state) {
          this.frame = 0;
        }
        _.remove(this.animationQueue, "done");
      }
      this.animationQueue.push({
        animation: animation,
        done: !animationSettings.forceAnimation,
        // TODO: make start part of animation settings
        state: state
      });
    }
  }

  setAnimation(elapsedTime, object) {
    this.currentAnimationTime += elapsedTime;
    let currentAction = object.currentAction || object.latestAction;
    this.prevState = this.state;

    // We may start and finish an action within a frame, make sure we still animate it
    if (currentAction && !currentAction.new) {
      this.currentAction = currentAction;
      this.currentAnimationTime = 0;
      // if (currentAction.name !== (this.currentAction && this.currentAction.name)) {
      //   this.currentAction = currentAction;
      //   this.currentAnimationTime = 0;
      // }
    }

    // TODO: add flag to animations marking whether or not they must be completed before moving on
    if (!currentAction) {
      if (this.currentAnimationDone && this.currentAnimationSettings.nextAnimation) {
        this.queueAnimation(this.currentAnimationSettings.nextAnimation);
        this.currentAction = { type: this.currentAnimationSettings.nextAnimation };
      } else if (!this.currentAnimation || this.currentAnimationDone) {
        if (object.state.dead) {
          this.queueAnimation(this.rendering.DEATH_ANIMATIONS[object.state.characterDirection], STATE.DEAD);
        } else if (object.direction.x || object.direction.y || object.moving) {
          this.queueAnimation(this.rendering.MOVE_ANIMATIONS[object.state.characterDirection], STATE.MOVING);
        } else {
          this.queueAnimation(this.rendering.IDLE_ANIMATIONS[object.state.characterDirection], STATE.IDLE);
        }
      }
    } else {
      if (this.currentAction && this.currentAction.type === "attack") {
        if (this.rendering.WEAPON_ANIMATIONS) {
          let weapon = equipment[object.state.loadout.weapon];
          this.queueAnimation(this.rendering.WEAPON_ANIMATIONS[weapon.attackType][object.state.characterDirection], STATE.ATTACKING);
        } else if (this.rendering.ATTACK_ANIMATIONS) {
          this.queueAnimation(this.rendering.ATTACK_ANIMATIONS[object.state.characterDirection], STATE.ATTACKING);
        }
      }
    }

    if (this.state !== this.prevState) {
      this.frame = 0;
      this.currentTime = 0;
    }

    if (this.currentAction && this.currentAnimationTime >= this.currentAnimationDuration) {
      this.currentAction = null;
    }
  }

  update(elapsedTime, object) {
    this.updateLoadout(object);
    this.setAnimation(elapsedTime, object);
    let animationSettings = this.currentAnimationSettings;
    this.currentTime += elapsedTime;
    if (animationSettings.frames > 1) {
      while (this.currentTime >= 1000 / this.currentAnimationFramesPerSec) {
        this.currentTime -= 1000 / this.currentAnimationFramesPerSec;
        this.frame++;
        if (this.frame >= animationSettings.frames) {
          this.animationQueue[0].done = true;
          if (animationSettings.repeat) {
            this.frame = animationSettings.cycleStart || 0;
          } else {
            this.frame = animationSettings.frames - 1;
          }
        }
      }
    }
  }
}
