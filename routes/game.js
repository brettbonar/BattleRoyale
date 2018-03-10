const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Map = require("../libs/Map");

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

module.exports = router;
