import { drawShadow } from "../../Engine/Rendering/renderUtils.mjs";
import Dimensions from "../../Engine/GameObject/Dimensions.mjs"
import Vec3 from "../../Engine/GameObject/Vec3.mjs"
import ImageCache from "../../Engine/Rendering/ImageCache.mjs";
import characters from "./characters.mjs"
import teams from "../Teams.mjs"

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

function getOffset(animationSettings, frame) {
  return {
    x: animationSettings.offset.x + frame * animationSettings.dimensions.width,
    y: animationSettings.offset.y
  };
}

const CHARACTER_TYPE = {
  HUMANOID: 0,
  BAT: 1
}

export default class CharacterRenderer {
  constructor(characterInfo, loadout) {
    this.characterInfo = characterInfo;

    let typeInfo = characters[characterInfo.type];
    this.rendering = typeInfo.rendering;
    
    this.animation = this.rendering.ANIMATIONS.MOVE_DOWN;
    this.prevAnimation = this.rendering.ANIMATIONS.MOVE_DOWN;
    this.frame = 0;
    this.currentTime = 0;
    this.currentAnimationTime = 0;
    this.framesPerSec = 0;
 
    if (this.rendering.shadowImage) {
      this.shadowImage = ImageCache.get(this.rendering.shadowImage);
    }

    this.loadout = loadout;
    if (this.hasLoadout()) {
      this.initBody(characterInfo, loadout);
    } else {
      this.body = ImageCache.get(this.rendering.body);
    }
  }

  hasLoadout() {
    return this.characterInfo.type === "humanoid" && this.loadout;
  }

  initBody(characterInfo, loadout) {
    this.body = ImageCache.get("/Assets/character/body/" + characterInfo.gender + "/" + characterInfo.body + ".png");
    _.each(loadout, (piece) => {
      piece.image = ImageCache.get(piece.imageSource);
    });
  }

  updateLoadout(character) {
    // TODO: don't clone every time. Just update pieces that have changed.
    this.loadout = _.cloneDeep(character.state.loadout);
    _.each(this.loadout, (piece) => {
      piece.image = ImageCache.get(piece.imageSource);
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

  drawBody() {

  }

  drawLoadout(context, object, offset, animationSettings, position) {
    for (const piece of LOADOUT_ORDER) {
      let item = this.loadout[piece];
      if (!item && piece === "body") {
        this.drawBody(context, object);
      } else if (item) {
        if (item.image.complete) {
          let offset = getOffset(this.rendering.ANIMATION_SETTINGS[this.animation], this.frame, item.imageSize);
          context.drawImage(item.image, offset.x, offset.y, item.imageSize, item.imageSize,
            object.position.x, object.position.y - object.position.z, item.imageSize, item.imageSize);
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
    let animationSettings = this.rendering.ANIMATION_SETTINGS[this.animation];
    let offset = getOffset(animationSettings, this.frame);
    let position = object.position.plus(animationSettings.renderOffset);

    context.drawImage(this.body, offset.x, offset.y, animationSettings.dimensions.width, animationSettings.dimensions.height,
      position.x, position.y - position.z, animationSettings.dimensions.width, animationSettings.dimensions.height);
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

  setAnimation(elapsedTime, object) {
    this.currentAnimationTime += elapsedTime;
    let currentAction = object.currentAction || object.latestAction;
    // We may start and finish an action within a frame, make sure we still animate it
    if (currentAction && !currentAction.new) {
      this.currentAction = currentAction;
      this.currentAnimationTime = 0;
      // if (currentAction.name !== (this.currentAction && this.currentAction.name)) {
      //   this.currentAction = currentAction;
      //   this.currentAnimationTime = 0;
      // }
    }

    this.prevAnimation = this.animation;
    this.prevState = this.state;

    if (object.state.dead) {
      this.state = STATE.DEAD;
      this.animation = this.rendering.DEATH_ANIMATIONS[object.state.characterDirection];
    } else if (this.currentAction && this.currentAction.type === "attack") {
      this.state = STATE.ATTACKING;
      if (this.rendering.WEAPON_ANIMATIONS) {
        this.animation = this.rendering.WEAPON_ANIMATIONS[object.state.loadout.weapon.attackType][object.state.characterDirection];
        this.animationDuration = Math.max(this.currentAction.actionDuration, 250);
      } else if (this.rendering.ATTACK_ANIMATIONS) {
        this.animation = this.rendering.ATTACK_ANIMATIONS[object.state.characterDirection];
      }
    } else if (object.direction.x || object.direction.y || object.moving) {
      this.state = STATE.MOVING;
      this.animation = this.rendering.MOVE_ANIMATIONS[object.state.characterDirection];
    } else {
      this.state = STATE.IDLE;
      this.animation = this.rendering.IDLE_ANIMATIONS[object.state.characterDirection];
    }

    if (this.state !== this.prevState) {
      this.frame = this.state === STATE.MOVING ? 1 : 0;
      this.currentTime = 0;
      if (this.animationDuration) {
        this.framesPerSec = this.rendering.ANIMATION_SETTINGS[this.animation].frames / (this.animationDuration / 1000);
      } else {
        this.framesPerSec = this.rendering.ANIMATION_SETTINGS[this.animation].framesPerSec;
      }
    }

    if (this.currentAction && this.currentAnimationTime >= this.animationDuration) {
      this.currentAction = null;
      this.animationDuration = 0;
    }
  }

  update(elapsedTime, object) {
    this.updateLoadout(object);
    this.setAnimation(elapsedTime, object);
    let animationSettings = this.rendering.ANIMATION_SETTINGS[this.animation];
    this.currentTime += elapsedTime;
    if (animationSettings.frames > 1) {
      while (this.currentTime >= 1000 / this.framesPerSec) {
        this.currentTime -= 1000 / this.framesPerSec;
        this.frame++;
        if (this.frame >= animationSettings.frames) {
          if (animationSettings.repeat) {
            this.frame = animationSettings.cycleStart || 0;
          } else {
            this.frame = animationSettings.frames - 1;
            if (this.currentAction) {
              this.currentAction = null;
              this.animationDuration = 0;
            }
          }
        }
      }
    }
  }
}
