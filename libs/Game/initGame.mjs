import Game from "../../modules/Engine/Game.mjs"
import GameObject from "../../modules/Engine/GameObject/GameObject.mjs"
import Bounds from "../../modules/Engine/GameObject/Bounds.mjs"
import { MOVEMENT_TYPE } from "../../modules/Engine/Physics/PhysicsConstants.mjs"

import Character from "../../modules/BattleRoyale/Objects/Character.mjs"
import Projectile from "../../modules/BattleRoyale/Objects/Projectile.mjs"
import objects from "../../modules/BattleRoyale/Objects/objects.mjs"
import equipment from "../../modules/BattleRoyale/Objects/equipment.mjs"
import Building from "../../modules/BattleRoyale/Buildings/Building.mjs"
import Magic from "../../modules/BattleRoyale/Magic/Magic.mjs"
import StaticObject from "../../modules/BattleRoyale/Objects/StaticObject.mjs"
import AnimationEffect from "../../modules/BattleRoyale/Effects/AnimationEffect.mjs"
import effects from "../../modules/BattleRoyale/Effects/effects.mjs"
import Item from "../../modules/BattleRoyale/Objects/Item.mjs"
import scenes from "../../modules/BattleRoyale/Objects/Scenes.mjs"
import Map from "../../modules/Map.mjs"

function addScenes(maps) {
  let objects = [];
  let sceneTiles = {};
  _.each(Map.BIOMES, (biome) => {
    sceneTiles[biome] = [];
     let biomeScenes = _.filter(scenes, (scene) => {
      return scene.biomes.includes(biome) || scene.biomes.includes("all");
    });
    for (const scene of biomeScenes) {
      let weight = scene.weight || 1;
      for (let i = 0; i < weight; i++) {
        sceneTiles[biome].push(scene);
      }
    }
  });

  // TODO: need to create different set of objects for each map
  _.each(maps, (map) => {
    let tiles = map.map;
    let width = tiles.length;
    for (let x = 0; x < width; x++) {
      let height = tiles[x].length;
      for (let y = 0; y < height; y++) {
        let tile = tiles[x][y];
        if (Math.random() <= Map.BIOME_PARAMS[tile.type].sceneDensity) {
          let scene = _.sample(sceneTiles[tile.type]);
          if (scene) {
            objects = objects.concat(scene.getObjects({
              x: tile.position.x * map.tileSize + _.random(map.tileSize),
              y: tile.position.y * map.tileSize + _.random(map.tileSize)
            }));
          }
          //objects = objects.concat
        }
      }
    }
  });

  return objects;
}

function initGame(players, maps) {
  let gameObjects = [
    // new Character({
    //   body: "darkelf",
    //   gender: "female",
    //   simulation: true,
    //   damagedEffect: effects.blood,
    //   loadout: {
    //     weapon: equipment.axe,
    //     torso: equipment.leatherChestMale,
    //     legs: equipment.tealPantsMale,
    //     head: equipment.clothHoodMale,
    //     feet: equipment.brownShoesMale,
    //     hands: equipment.leatherBracersMale
    //   },
    //   characterDirection: "right",
    //   fireReady: true,
    //   position: {
    //     x: 600,
    //     y: 285,
    //     z: 0
    //   }
    // }),
    // new Character({
    //   body: "darkelf",
    //   gender: "female",
    //   simulation: true,
    //   damagedEffect: effects.blood,
    //   loadout: {
    //     weapon: equipment.axe,
    //     torso: equipment.leatherChestMale,
    //     legs: equipment.tealPantsMale,
    //     head: equipment.clothHoodMale,
    //     feet: equipment.brownShoesMale,
    //     hands: equipment.leatherBracersMale
    //   },
    //   fireReady: true,
    //   position: {
    //     x: 550,
    //     y: 550,
    //     z: 0
    //   }
    // }),
    new Character({
      body: "darkelf",
      gender: "female",
      simulation: true,
      damagedEffect: effects.blood,
      loadout: {
        weapon: equipment.axe,
        torso: equipment.leatherChestMale,
        legs: equipment.tealPantsMale,
        head: equipment.clothHoodMale,
        feet: equipment.brownShoesMale,
        hands: equipment.leatherBracersMale
      },
      fireReady: true,
      position: {
        x: 500,
        y: 100,
        z: 0
      }
    }),
    // new Building({
    //   buildingType: "house",
    //   simulation: true,
    //   position: {
    //     x: 500,
    //     y: 500,
    //     z: 0
    //   }
    // })
  ];

  let pos = 255;
  //players.push({ playerId: 1, socket: { emit: _.noop } });
  for (const player of players) {
    let char = new Character({
      body: "tanned",
      gender: "male",
      isPlayer: true,
      playerId: player.playerId,
      simulation: true,
      damagedEffect: effects.blood,
      loadout: {
        weapon: equipment.staffMale,
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
      },
      direction: {
        x: 0,
        y: 0,
        z: 0
      }
    });
    char.state.inventory.push("staffMale");
    gameObjects.push(char);
    pos += 100;
  }

  // gameObjects.push(new Item({
  //   position: {
  //     x: 255,
  //     y: 500
  //   },
  //   itemType: "healthPotion",
  //   simulation: true
  // }));
  // gameObjects.push(new Item({
  //   position: {
  //     x: 255,
  //     y: 510
  //   },
  //   itemType: "healthPotion",
  //   simulation: true
  // }));
  gameObjects.push(new Item({
    position: {
      x: 265,
      y: 305
    },
    itemType: "fireStaffMale",
    simulation: true
  }));
  gameObjects.push(new Item({
    position: {
      x: 235,
      y: 305
    },
    itemType: "lightStaffMale",
    simulation: true
  }));
  gameObjects.push(new Item({
    position: {
      x: 295,
      y: 305
    },
    itemType: "bow",
    simulation: true
  }));

  gameObjects.push(new StaticObject({
    objectType: "plainTree",
    position: {
      x: 350,
      y: 250
    },
    simulation: true
  }));

  gameObjects.push(new StaticObject({
    objectType: "forestTree",
    position: {
      x: 500,
      y: 250
    },
    simulation: true
  }));

  // for (let i = 0; i < 10; i++) {
  //   //let type = _.sample(_.filter(objects, { biome: "plain" }));
  //   //let type = _.sample(objects);
  //   //let type = objects.plainTree;
  //   gameObjects.push(new StaticObject({
  //     objectType: "plainTree",
  //     position: {
  //       x: _.random(0, 1000),
  //       y: _.random(0, 1000)
  //     },
  //     simulation: true
  //   }));
  // }

  // let x = 250;
  // let y = 250;
  // for (let i = 0; i < 10; i++) {
  //   for (let j = 0; j < 5; j++) {
  //     let type = _.sample(_.filter(objects, { group: "corn" })).objectType;
  //     gameObjects.push(new StaticObject({
  //       objectType: type,
  //       position: {
  //         x: x + i * (objects.corn1.imageDimensions.width * 3/4) + y,
  //         y: y + j * (objects.corn1.imageDimensions.height / 3)
  //       },
  //       simulation: true
  //     }));
  //   }
  // }

  // gameObjects.push(new StaticObject({
  //   position: {
  //     x: 100,
  //     y: 350
  //   }
  // }, objects.caveEntrance));
  // gameObjects.push(new StaticObject({
  //   position: {
  //     x: 100,
  //     y: 450,
  //     z: -1
  //   }
  // }, objects.caveExit));

  // gameObjects.push(new StaticObject({
  //   position: {
  //     x: 700,
  //     y: 700
  //   },
  //   objectType: "wheat",
  //   simulation: true
  // }));

  // gameObjects = gameObjects.concat(scenes.house.getObjects(
  //   {
  //     x: 500,
  //     y: 500
  //   }
  // ));

  // gameObjects = gameObjects.concat(scenes.corn.getObjects(
  //   {
  //     x: 250,
  //     y: 250
  //   },
  //   {
  //     width: 440,
  //     height: 220
  //   }
  // ));

  gameObjects = gameObjects.concat(addScenes(maps));

  return gameObjects;
}

export { initGame }
