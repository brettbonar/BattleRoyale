import Character from "./Character.mjs"
import Vec3 from "../../Engine/GameObject/Vec3.mjs"
import Bounds from "../../Engine/GameObject/Bounds.mjs"
import Dimensions from "../../Engine/GameObject/Dimensions.mjs"
import CharacterRenderer, { STATE } from "../Renderers/CharacterRenderer.mjs"
import { SURFACE_TYPE } from "../../Engine/Physics/PhysicsConstants.mjs"
import GameSettings from "../../Engine/GameSettings.mjs"
import equipment from "./equipment.mjs"

export default class Humanoid extends Character {
  constructor(params) {
    super(params);
    this.characterType = "Humanoid";
  }
}