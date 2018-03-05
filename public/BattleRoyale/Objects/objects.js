// TODO: fix sprites that share edges

export default {
  corn1: {
    biome: "plain",
    group: "corn",
    imageSource: "../../Assets/terrain_atlas.png",
    imageDimensions: {
      x: 481,
      y: 960,
      width: 30,
      height: 64
    },
    physics: {
      surfaceType: "none"
    },
    losObstacle: false
  },
  corn2: {
    biome: "plain",
    group: "corn",
    imageSource: "../../Assets/terrain_atlas.png",
    imageDimensions: {
      x: 481,
      y: 896,
      width: 30,
      height: 64
    },
    physics: {
      surfaceType: "none"
    },
    losObstacle: false
  },
  corn3: {
    biome: "plain",
    group: "corn",
    imageSource: "../../Assets/terrain_atlas.png",
    imageDimensions: {
      x: 481,
      y: 832,
      width: 30,
      height: 64
    },
    physics: {
      surfaceType: "none"
    },
    losObstacle: false
  },
  plainTree: {
    biome: "plain",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 928 * 2,
      y: 897 * 2,
      width: 192,
      height: 128 * 2 - 10,
      offset: {
        x: 93
      }
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 103,
      height: 56
    },
    losObstacle: true
  },
  smallPlainTree: {
    biome: "plain",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1734,
      y: 1862,
      width: 120,
      height: 180,
      offset: {
        x: 56
      }
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 35,
      height: 20
    },
    losObstacle: true
  },
  stump: {
    biome: "plain",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 782,
      y: 790,
      width: 100,
      height: 82
    },
    physics: {
      surfaceType: "ground"
    },
    dimensions: {
      width: 100,
      height: 58
    },
    losObstacle: false
  },
  forestTree: {
    biome: "forest",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1922,
      y: 10,
      width: 126,
      height: 293,
      offset: {
        x: 65
      }
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 66,
      height: 34
    },
    losObstacle: true
  },
  darkRock1: {
    biome: "darkRock",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1732,
      y: 1506,
      width: 122,
      height: 90
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 122,
      height: 45
    },
    losObstacle: false
  },
  darkRock2: {
    biome: "darkRock",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1732,
      y: 1704,
      width: 116,
      height: 82
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 116,
      height: 48
    },
    losObstacle: false
  },
  darkRock3: {
    biome: "darkRock",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1860,
      y: 1692,
      width: 58,
      height: 96
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 58,
      height: 48
    },
    losObstacle: false
  },
  lightRock1: {
    biome: "lightRock",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1668,
      y: 1378,
      width: 122,
      height: 90
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 122,
      height: 45
    },
    losObstacle: false
  },
  lightRock2: {
    biome: "lightRock",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1796,
      y: 1384,
      width: 116,
      height: 82
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 116,
      height: 48
    },
    losObstacle: false
  },
  lightRock3: {
    biome: "lightRock",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1924,
      y: 1372,
      width: 58,
      height: 96
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 58,
      height: 48
    },
    losObstacle: false
  },
  pillar1: {
    // clean
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 895,
      y: 769,
      width: 64,
      height: 192
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 64,
      height: 64
    },
    losObstacle: false
  },
  pillar1Small: {
    // clean
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas.png",
    imageDimensions: {
      x: 448,
      y: 384,
      width: 32,
      height: 96
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 32,
      height: 32
    },
    losObstacle: false
  },
  pillar2: {
    // ivy, cracked
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1285,
      y: 769,
      width: 64,
      height: 186
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 64,
      height: 64
    },
    losObstacle: false
  },
  pillar3: {
    // cracked
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1211,
      y: 970,
      width: 64,
      height: 182
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 64,
      height: 64
    },
    losObstacle: false
  },
  pillar4: {
    // cracked, upside down
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1279,
      y: 965,
      width: 64,
      height: 184
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 44,
      height: 48
    },
    losObstacle: false
  },
  fountain: {
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1088,
      y: 788,
      width: 64,
      height: 108
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 64,
      height: 56
    },
    losObstacle: false
  },
  head: {
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 968,
      y: 776,
      width: 108,
      height: 182
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 104,
      height: 58
    },
    losObstacle: false
  },
  brokenHead: {
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1156,
      y: 784,
      width: 112,
      height: 110
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 112,
      height: 55
    },
    losObstacle: false
  },
  pillarBase1: {
    // cracked, ivy
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1152,
      y: 896,
      width: 64,
      height: 64
    },
    physics: {
      surfaceType: "ground"
    },
    dimensions: {
      width: 64,
      height: 48
    },
    losObstacle: false
  },
  pillarBase2: {
    // cracked
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 895,
      y: 962,
      width: 64,
      height: 64
    },
    physics: {
      surfaceType: "ground"
    },
    dimensions: {
      width: 64,
      height: 48
    },
    losObstacle: false
  },
  pillarBase3: {
    // smooth
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1217,
      y: 896,
      width: 64,
      height: 64
    },
    physics: {
      surfaceType: "ground"
    },
    dimensions: {
      width: 64,
      height: 48
    },
    losObstacle: false
  },
  whiteRock: {
    biome: "ruins", // Other biomes?
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 960,
      y: 960,
      width: 64,
      height: 64
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 64,
      height: 48
    },
    losObstacle: false
  },
  cactusBall: {
    biome: "desert",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 578,
      y: 896,
      width: 62,
      height: 60
    },
    physics: {
      surfaceType: "ground"
    },
    dimensions: {
      width: 62,
      height: 48
    },
    losObstacle: false
  },
  cactus: {
    biome: "desert",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 710,
      y: 898,
      width: 94,
      height: 116,
      offset: {
        x: 50
      }
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 74,
      height: 24
    },
    losObstacle: false
  },
  brokenHeadstone: {
    biome: "death",
    group: "headstone",
    imageSource: "../../Assets/terrain_atlas.png",
    imageDimensions: {
      x: 449,
      y: 678,
      width: 30,
      height: 46
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 30,
      height: 16
    },
    losObstacle: false
  },
  headstone1: {
    biome: "death",
    group: "headstone",
    imageSource: "../../Assets/obj_misk_atlas.png",
    imageDimensions: {
      x: 713,
      y: 851,
      width: 49,
      height: 45
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 45,
      height: 16
    },
    losObstacle: false
  },
  headstone2: {
    biome: "death",
    group: "headstone",
    imageSource: "../../Assets/obj_misk_atlas.png",
    imageDimensions: {
      x: 704,
      y: 801,
      width: 34,
      height: 34
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 31,
      height: 16
    },
    losObstacle: false
  },
  headstone3: {
    biome: "death",
    group: "headstone",
    imageSource: "../../Assets/obj_misk_atlas.png",
    imageDimensions: {
      x: 738,
      y: 803,
      width: 30,
      height: 29
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 28,
      height: 16
    },
    losObstacle: false
  },
  // TODO: split into ground box and terrain box
  grave: {
    biome: "death",
    group: "headstone",
    imageSource: "../../Assets/obj_misk_atlas.png",
    imageDimensions: {
      x: 641,
      y: 801,
      width: 63,
      height: 95
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 61,
      height: 63
    },
    losObstacle: false
  },
  cross1: {
    biome: "death",
    group: "cross",
    imageSource: "../../Assets/terrain_atlas.png",
    imageDimensions: {
      x: 481,
      y: 679,
      width: 30,
      height: 44
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 30,
      height: 16
    },
    losObstacle: false
  },
  cross2: {
    biome: "death",
    group: "cross",
    imageSource: "../../Assets/obj_misk_atlas.png",
    imageDimensions: {
      x: 741,
      y: 897,
      width: 20,
      height: 30
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 18,
      height: 8
    },
    losObstacle: false
  },
  cross3: {
    biome: "death",
    group: "cross",
    imageSource: "../../Assets/obj_misk_atlas.png",
    imageDimensions: {
      x: 739,
      y: 927,
      width: 26,
      height: 33
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 24,
      height: 8
    },
    losObstacle: false
  },
  cross4: {
    biome: "death",
    group: "cross",
    imageSource: "../../Assets/obj_misk_atlas.png",
    imageDimensions: {
      x: 734,
      y: 960,
      width: 33,
      height: 64
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 31,
      height: 15
    },
    losObstacle: false
  },
  darkFountain: {
    biome: "death",
    imageSource: "../../Assets/terrain_atlas.png",
    imageDimensions: {
      x: 515,
      y: 674,
      width: 26,
      height: 49
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 26,
      height: 17
    },
    losObstacle: false
  },
  deadTree: {
    biome: "death",
    imageSource: "../../Assets/obj_misk_atlas-64.png",
    imageDimensions: {
      x: 1043,
      y: 3,
      width: 154,
      height: 186,
      offset: {
        x: 70,
        y: 166
      }
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 64,
      height: 36
    },
    losObstacle: false
  }
}
