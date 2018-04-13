import Map from "../../Map.mjs"
import SpawnMap from "./SpawnMap.mjs";
import ShadowField from "../Shadow/ShadowField.mjs";

function createStartMap(maps, players) {
  let size = 100;
  let mapDimensions = {
    width: 1024,
    height: 1024
  };

  let startMap = new Map({
    mapWidth: 50,
    mapHeight: 50
  });

  for (const column of startMap.map) {
    for (const tile of column) {
      startMap.initTile(tile, Map.BIOMES.STONE);
    }
  }

  startMap.objects.push(new SpawnMap({
    position: {
      x: 100,
      y: 100
    },
    level: "start",
    mapLevel: "0",
    mapDimensions: mapDimensions,
    simulation: true
  }, maps[0]));

  // startMap.objects.push(new ShadowField({
  //   position: {
  //     x: 0,
  //     y: 0,
  //     z: 0
  //   },
  //   level: "start",
  //   dimensions: {
  //     width: 500,
  //     height: 500,
  //     zheight: 32
  //   }
  // }));

  return startMap;
}

export default createStartMap;
