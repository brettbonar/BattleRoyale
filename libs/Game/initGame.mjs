import Game from "../../modules/Engine/Game.mjs"
import GameObject from "../../modules/Engine/GameObject/GameObject.mjs"
import Bounds from "../../modules/Engine/GameObject/Bounds.mjs"
import Vec3 from "../../modules/Engine/GameObject/Vec3.mjs"
import { MOVEMENT_TYPE } from "../../modules/Engine/Physics/PhysicsConstants.mjs"

import Character from "../../modules/BattleRoyale/Objects/Character.mjs"
import Projectile from "../../modules/BattleRoyale/Objects/Projectile.mjs"
import objects from "../../modules/BattleRoyale/Objects/objects.mjs"
import equipment from "../../modules/BattleRoyale/Objects/equipment.mjs"
import Building from "../../modules/BattleRoyale/Buildings/Building.mjs"
import Magic from "../../modules/BattleRoyale/Magic/Magic.mjs"
import StaticObject from "../../modules/BattleRoyale/Objects/StaticObject.mjs"
import effects from "../../modules/BattleRoyale/Effects/effects.mjs"
import Item from "../../modules/BattleRoyale/Objects/Item.mjs"
import scenes from "../../modules/BattleRoyale/Objects/Scenes.mjs"
import Map from "../../modules/Map.mjs"

function canPlaceScene(scene, occupiedTiles) {
  if (!occupiedTiles || occupiedTiles.length === 0) {
    return false;
  }
  
  return occupiedTiles.every((tile) => {
    return (!tile.objects || tile.objects.length === 0) && scene.biomes.includes(tile.type);
  });
}

function getOccupiedTiles(bounds, tiles, tileSize) {
  let occupiedTiles = [];
  let width = tiles.length;
  let height = tiles[0].length;

  let xstart = Math.floor(bounds.ul.x / tileSize);
  let xend = Math.floor(bounds.lr.x / tileSize);
  let ystart = Math.floor(bounds.ul.y / tileSize);
  let yend = Math.floor(bounds.lr.y / tileSize);

  for (let x = xstart; x <= xend; x++) {
    if (x < 0 || x >= width) {
      return [];
    }
    for (let y = ystart; y <= yend; y++) {
      if (y < 0 || y >= height) {
        return [];
      }
      
      occupiedTiles.push(tiles[x][y]);
    }
  }

  return occupiedTiles;
}

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
      let sceneInstance = _.clone(scene);
      sceneInstance.count = 0;
      for (let i = 0; i < weight; i++) {
        sceneTiles[biome].push(scene);
      }
    }
  });

  // TODO: need to create different set of objects for each map
  _.each(maps, (map) => {
    let tiles = map.map;
    let width = tiles.length;
    let mapObjects = [];
    for (let x = 0; x < width; x++) {
      let height = tiles[x].length;
      for (let y = 0; y < height; y++) {
        let tile = tiles[x][y];
        if (Math.random() <= Map.BIOME_PARAMS[tile.type].sceneDensity) {
          let scene = _.sample(sceneTiles[tile.type]);
          if (scene) {
            let position = new Vec3({
              x: tile.position.x * map.tileSize + _.random(map.tileSize),
              y: tile.position.y * map.tileSize + _.random(map.tileSize)
            });
            let bounds = new Bounds({
              position: position,
              dimensions: scene.size
            });
            let occupiedTiles = getOccupiedTiles(bounds, tiles, map.tileSize);
            if (canPlaceScene(scene, occupiedTiles)) {
              let sceneObjects = scene.getObjects(position);
              mapObjects = mapObjects.concat(sceneObjects);
              for (const tile of occupiedTiles) {
                tile.objects = sceneObjects;
              }
            }
          }
        }
      }
    }

    // TODO: refine bounds, remove objects that break rules, ensure min/max counts are held
    map.objects = map.objects.concat(mapObjects);

    objects = objects.concat(map.objects);
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
    //     x: 500,
    //     y: 100,
    //     z: 0
    //   }
    // }),
  ];

  let pos = 255;
  //players.push({ playerId: 1, socket: { emit: _.noop } });
  for (const player of players) {
    let char = new Character({
      //level: "start",
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
      // position: {
      //   x: _.random(100, 6000),
      //   y: _.random(100, 6000),
      //   z: 0
      // },
      direction: {
        x: 0,
        y: 0,
        z: 0
      }
    });
    char.state.inventory.push("bow");
    char.state.inventory.push("lightStaffMale");
    char.state.inventory.push("fireStaffMale");
    char.state.inventory.push("staffMale");
    gameObjects.push(char);
    player.character = char;
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
  // gameObjects.push(new Item({
  //   position: {
  //     x: 265,
  //     y: 305
  //   },
  //   itemType: "fireStaffMale",
  //   simulation: true
  // }));
  // gameObjects.push(new Item({
  //   position: {
  //     x: 235,
  //     y: 305
  //   },
  //   itemType: "lightStaffMale",
  //   simulation: true
  // }));
  // gameObjects.push(new Item({
  //   position: {
  //     x: 295,
  //     y: 305
  //   },
  //   itemType: "bow",
  //   simulation: true
  // }));

  // gameObjects.push(new StaticObject({
  //   objectType: "plainTree",
  //   position: {
  //     x: 500,
  //     y: 250
  //   },
  //   simulation: true
  // }));

  // gameObjects.push(new StaticObject({
  //   objectType: "forestTree",
  //   position: {
  //     x: 600,
  //     y: 250
  //   },
  //   simulation: true
  // }));

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


  gameObjects = gameObjects.concat(scenes.house.getObjects(
    {
      x: 300,
      y: 300
    }
  ));

  addScenes(maps);
  //gameObjects = gameObjects.concat(addScenes(maps));

  return gameObjects;
}

export { initGame }
