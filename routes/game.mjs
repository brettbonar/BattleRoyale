import express from "express";
//const Map = require("../libs/Map");
import Map from "../modules/Map.mjs";
import { initGame } from "../libs/Game/initGame.mjs";
import _ from "lodash";
global._ = _;

const router = express.Router();

let maps = {
  "-1": new Map({
    seeds: {
      death: 5,
      water: 5
    }
  }),
  "0": new Map()
};

router.get("/maps", (req, res) => {
  let mapsJson = {};
  _.each(maps, (map, level) => {
    mapsJson[level] = map.toJSON();
  });
  res.json(mapsJson);
});

router.get("/objects", (req, res) => {
  res.json(initGame(maps));
});

//module.exports = router;
export default router;
