import Map from "../../Map.mjs"
import SpawnMap from "./SpawnMap.mjs";
import ShadowField from "../Shadow/ShadowField.mjs";
import EntryPortals from "../Scripts/EntryPortals.mjs"

function createStartMap(maps, players) {
  let size = 100;
  let mapDimensions = {
    width: 1024,
    height: 1024
  };

  let startMap = new Map({
    mapWidth: 50,
    mapHeight: 50
  }, "start");

  for (const column of startMap.map) {
    for (const tile of column) {
      startMap.initTile(tile, Map.BIOMES.STONE);
    }
  }

  let spawnMap = new SpawnMap({
    position: {
      x: 100,
      y: 100
    },
    level: "start",
    mapLevel: "0",
    dimensions: mapDimensions,
    simulation: true
  }, maps[0]);

  startMap.objects.push(spawnMap);

  return {
    map: startMap,
    spawnMap: spawnMap
  };
}

export default createStartMap;
