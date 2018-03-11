import Game from "../../modules/Engine/Game.mjs"
import GameObject from "../../modules/Engine/GameObject/GameObject.mjs"
import Bounds from "../../modules/Engine/GameObject/Bounds.mjs"
import { MOVEMENT_TYPE } from "../../modules/Engine/Physics/PhysicsConstants.mjs"

import Character from "../../modules/BattleRoyale/Objects/Character.mjs"
import Projectile from "../../modules/BattleRoyale/Objects/Projectile.mjs"
import objects from "../../modules/BattleRoyale/Objects/objects.mjs"
import equipment from "../../modules/BattleRoyale/Objects/equipment.mjs"
import Building from "../../modules/BattleRoyale/Buildings/Building.mjs";
import Magic from "../../modules/BattleRoyale/Magic/Magic.mjs";
import GenericObject from "../../modules/BattleRoyale/Objects/GenericObject.mjs";
import AnimationEffect from "../../modules/BattleRoyale/Effects.js/AnimationEffect.mjs";
import effects from "../../modules/BattleRoyale/Effects.js/effects.mjs";

function initGame(players, maps) {
  let objects = [
    new Character({
      body: "darkelf",
      gender: "female",
      simulation: true,
      damagedEffect: effects.blood,
      loadout: {
        weapon: equipment.spear,
        torso: equipment.leatherChestMale,
        legs: equipment.tealPantsMale,
        head: equipment.clothHoodMale,
        feet: equipment.brownShoesMale,
        hands: equipment.leatherBracersMale
      },
      characterDirection: "right",
      fireReady: true,
      position: {
        x: 400,
        y: 255,
        z: 0
      }
    }),
    new Character({
      body: "darkelf",
      gender: "female",
      simulation: true,
      damagedEffect: effects.blood,
      loadout: {
        weapon: equipment.spear,
        torso: equipment.leatherChestMale,
        legs: equipment.tealPantsMale,
        head: equipment.clothHoodMale,
        feet: equipment.brownShoesMale,
        hands: equipment.leatherBracersMale
      },
      isOtherPlayer: true,
      fireReady: true,
      position: {
        x: 550,
        y: 550,
        z: 0
      }
    }),
    new Building({
      buildingType: "house",
      simulation: true,
      position: {
        x: 500,
        y: 500,
        z: 0
      }
    })
  ];

  let pos = 255;
  for (const player of players) {
    objects.push(
      new Character({
        body: "tanned",
        gender: "male",
        isPlayer: true,
        playerId: player.playerId,
        simulation: true,
        damagedEffect: effects.blood,
        loadout: {
          weapon: equipment.spear,
          torso: equipment.leatherChestMale,
          legs: equipment.tealPantsMale,
          head: equipment.clothHoodMale,
          feet: equipment.brownShoesMale,
          hands: equipment.leatherBracersMale
        },
        fireReady: true,
        position: {
          x: pos,
          y: pos,
          z: 0
        }
      })
    );
    pos += 100;
  }
  
  // for (let i = 0; i < 10; i++) {
  //   //let type = _.sample(_.filter(objects, { biome: "plain" }));
  //   //let type = _.sample(objects);
  //   let type = objects.plainTree;
  //   this.gameState.staticObjects.push(new GenericObject({
  //     position: {
  //       x: _.random(0, this.canvas.width),
  //       y: _.random(0, this.canvas.height)
  //     }
  //   }, type));
  // }

  // let x = 250;
  // let y = 250;
  // for (let i = 0; i < 10; i++) {
  //   for (let j = 0; j < 5; j++) {
  //     let type = _.sample(_.filter(objects, { group: "corn" }));
  //     this.gameState.staticObjects.push(new GenericObject({
  //       position: {
  //         x: x + i * (objects.corn1.imageDimensions.width * 3/4) + y,
  //         y: y + j * (objects.corn1.imageDimensions.height / 3)
  //       }
  //     }, type));
  //   }
  // }

  // this.gameState.staticObjects.push(new GenericObject({
  //   position: {
  //     x: 100,
  //     y: 350
  //   }
  // }, objects.caveEntrance));
  // this.gameState.staticObjects.push(new GenericObject({
  //   position: {
  //     x: 100,
  //     y: 450,
  //     z: -1
  //   }
  // }, objects.caveExit));

  return objects;
}

export { initGame }
