// TODO: fix sprites that share edges

export default {
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
      x: 1734 / 2,
      y: 1862 / 2,
      width: 120 / 2,
      height: 180 / 2,
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
      x: 782 / 2,
      y: 790 / 2,
      width: 10 / 20,
      height: 8 / 22
    },
    physics: {
      surfaceType: "ground"
    },
    dimensions: {
      width: 100 / 2,
      height: 58 / 2
    },
    losObstacle: false
  },
  forestTree: {
    biome: "forest",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1922 / 2,
      y: 10 / 2,
      width: 1 / 226,
      height: 293 / 2,
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
      x: 1732 / 2,
      y: 1506 / 2,
      width: 122 / 2,
      height: 9 / 20
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 122 / 2,
      height: 45 / 2
    },
    losObstacle: false
  },
  darkRock2: {
    biome: "darkRock",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1732 / 2,
      y: 1704 / 2,
      width: 116 / 2,
      height: 8 / 22
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 116 / 2,
      height: 48 / 2
    },
    losObstacle: false
  },
  darkRock3: {
    biome: "darkRock",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1860 / 2,
      y: 1692 / 2,
      width: 58 / 2,
      height: 9 / 26
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 58 / 2,
      height: 48 / 2
    },
    losObstacle: false
  },
  lightRock1: {
    biome: "lightRock",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1668 / 2,
      y: 1378 / 2,
      width: 122 / 2,
      height: 9 / 20
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 122 / 2,
      height: 45 / 2
    },
    losObstacle: false
  },
  lightRock2: {
    biome: "lightRock",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1796 / 2,
      y: 1384 / 2,
      width: 116 / 2,
      height: 8 / 22
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 116 / 2,
      height: 48 / 2
    },
    losObstacle: false
  },
  lightRock3: {
    biome: "lightRock",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1924 / 2,
      y: 1372 / 2,
      width: 58 / 2,
      height: 9 / 26
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 58 / 2,
      height: 48 / 2
    },
    losObstacle: false
  },
  pillar1: {
    // clean
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 895 / 2,
      y: 769 / 2,
      width: 64 / 2,
      height: 19 / 22
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 64 / 2,
      height: 64 / 2
    },
    losObstacle: false
  },
  pillar2: {
    // ivy, cracked
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1285 / 2,
      y: 769 / 2,
      width: 64 / 2,
      height: 18 / 26
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 64 / 2,
      height: 64 / 2
    },
    losObstacle: false
  },
  pillar3: {
    // cracked
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1211 / 2,
      y: 970 / 2,
      width: 64 / 2,
      height: 18 / 22
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 64 / 2,
      height: 64 / 2
    },
    losObstacle: false
  },
  pillar4: {
    // cracked, upside down
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1279 / 2,
      y: 965 / 2,
      width: 64 / 2,
      height: 18 / 24
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 44 / 2,
      height: 48 / 2
    },
    losObstacle: false
  },
  fountain: {
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1088 / 2,
      y: 788 / 2,
      width: 64 / 2,
      height: 10 / 28
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 64 / 2,
      height: 56 / 2
    },
    losObstacle: false
  },
  head: {
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 968 / 2,
      y: 776 / 2,
      width: 10 / 28,
      height: 18 / 22
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 104 / 2,
      height: 58 / 2
    },
    losObstacle: false
  },
  brokenHead: {
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1156 / 2,
      y: 784 / 2,
      width: 11 / 22,
      height: 11 / 20
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 112 / 2,
      height: 55 / 2
    },
    losObstacle: false
  },
  pillarBase1: {
    // cracked, ivy
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1152 / 2,
      y: 896 / 2,
      width: 64 / 2,
      height: 6 / 24
    },
    physics: {
      surfaceType: "ground"
    },
    dimensions: {
      width: 64 / 2,
      height: 48 / 2
    },
    losObstacle: false
  },
  pillarBase2: {
    // cracked
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 895 / 2,
      y: 962 / 2,
      width: 64 / 2,
      height: 6 / 24
    },
    physics: {
      surfaceType: "ground"
    },
    dimensions: {
      width: 64 / 2,
      height: 48 / 2
    },
    losObstacle: false
  },
  pillarBase3: {
    // smooth
    biome: "ruins",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 1217 / 2,
      y: 896 / 2,
      width: 64 / 2,
      height: 6 / 24
    },
    physics: {
      surfaceType: "ground"
    },
    dimensions: {
      width: 64 / 2,
      height: 48 / 2
    },
    losObstacle: false
  },
  whiteRock: {
    biome: "ruins", // Other biomes?
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 960 / 2,
      y: 960 / 2,
      width: 64 / 2,
      height: 6 / 24
    },
    physics: {
      surfaceType: "terrain"
    },
    dimensions: {
      width: 64 / 2,
      height: 48 / 2
    },
    losObstacle: false
  },
  cactusBall: {
    biome: "desert", // Other biomes?
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 578 / 2,
      y: 896 / 2,
      width: 62 / 2,
      height: 6 / 20
    },
    physics: {
      surfaceType: "ground"
    },
    dimensions: {
      width: 62 / 2,
      height: 48 / 2
    },
    losObstacle: false
  },
  cactus: {
    biome: "desert", // Other biomes?
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 710 / 2,
      y: 898 / 2,
      width: 94 / 2,
      height: 116 / 2,
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
  }
}
