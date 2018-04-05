import Bounds from "../../Engine/GameObject/Bounds.mjs";

// TODO: fix sprites that share edges
const caveEntranceDimensions = [
  {
    offset: {
      x: -32,
      y: -86,
    },
    dimensions: {
      width: 64,
      height: 5
    },
    boundsType: Bounds.TYPE.RECTANGLE_UL
  },
  {
    offset: {
      x: -32,
      y: -86,
    },
    dimensions: {
      width: 5,
      height: 86
    },
    boundsType: Bounds.TYPE.RECTANGLE_UL
  },
  {
    offset: {
      x: 27,
      y: -86,
    },
    dimensions: {
      width: 5,
      height: 86
    },
    boundsType: Bounds.TYPE.RECTANGLE_UL
  }
];

export default {
  // WHEAT
  wheat: {
    objectType: "wheat",
    biome: "plain",
    group: "wheat",
    imageSource: "/Assets/terrain_atlas.png",
    renderClipped: true,
    imageDimensions: {
      x: 0,
      y: 906,
      width: 98,
      height: 83
    },
    dimensions: {
      width: 98,
      height: 83,
      zheight: 18
    },
    physics: {
      surfaceType: "none"
    }
  },
  wheatUL: {
    objectType: "wheatUL",
    biome: "plain",
    group: "wheat",
    imageSource: "/Assets/terrain_atlas.png",
    imageDimensions: {
      x: 0,
      y: 896,
      width: 32,
      height: 32
    },
    dimensions: {
      width: 32,
      height: 32
    },
    physics: {
      surfaceType: "none"
    }
  },
  wheatTop: {
    objectType: "wheatTop",
    biome: "plain",
    group: "wheat",
    imageSource: "/Assets/terrain_atlas.png",
    imageDimensions: {
      x: 32,
      y: 896,
      width: 32,
      height: 32
    },
    dimensions: {
      width: 32,
      height: 32
    },
    physics: {
      surfaceType: "none"
    }
  },
  wheatUR: {
    objectType: "wheatUR",
    biome: "plain",
    group: "wheat",
    imageSource: "/Assets/terrain_atlas.png",
    imageDimensions: {
      x: 64,
      y: 896,
      width: 32,
      height: 32
    },
    dimensions: {
      width: 32,
      height: 32
    },
    physics: {
      surfaceType: "none"
    }
  },
  wheatLeft: {
    objectType: "wheatLeft",
    biome: "plain",
    group: "wheat",
    imageSource: "/Assets/terrain_atlas.png",
    imageDimensions: {
      x: 0,
      y: 928,
      width: 32,
      height: 32
    },
    dimensions: {
      width: 32,
      height: 32
    },
    physics: {
      surfaceType: "none"
    }
  },
  wheatMid: {
    objectType: "wheatMid",
    biome: "plain",
    group: "wheat",
    imageSource: "/Assets/terrain_atlas.png",
    imageDimensions: {
      x: 32,
      y: 928,
      width: 32,
      height: 32
    },
    dimensions: {
      width: 32,
      height: 32
    },
    physics: {
      surfaceType: "none"
    }
  },
  wheatRight: {
    objectType: "wheatRight",
    biome: "plain",
    group: "wheat",
    imageSource: "/Assets/terrain_atlas.png",
    imageDimensions: {
      x: 64,
      y: 928,
      width: 32,
      height: 32
    },
    dimensions: {
      width: 32,
      height: 32
    },
    physics: {
      surfaceType: "none"
    }
  },
  wheatLL: {
    objectType: "wheatLL",
    biome: "plain",
    group: "wheat",
    imageSource: "/Assets/terrain_atlas.png",
    imageDimensions: {
      x: 0,
      y: 960,
      width: 32,
      height: 32
    },
    dimensions: {
      width: 32,
      height: 32
    },
    physics: {
      surfaceType: "none"
    }
  },
  wheatBottom: {
    objectType: "wheatBottom",
    biome: "plain",
    group: "wheat",
    imageSource: "/Assets/terrain_atlas.png",
    imageDimensions: {
      x: 32,
      y: 960,
      width: 32,
      height: 32
    },
    dimensions: {
      width: 32,
      height: 32
    },
    physics: {
      surfaceType: "none"
    }
  },
  wheatRight: {
    objectType: "wheatRight",
    biome: "plain",
    group: "wheat",
    imageSource: "/Assets/terrain_atlas.png",
    imageDimensions: {
      x: 64,
      y: 960,
      width: 32,
      height: 32
    },
    dimensions: {
      width: 32,
      height: 32
    },
    physics: {
      surfaceType: "none"
    }
  },

  // CORN
  corn1: {
    objectType: "corn1",
    biome: "plain",
    group: "corn",
    imageSource: "../../Assets/terrain_atlas.png",
    imageDimensions: {
      x: 481,
      y: 960,
      width: 30,
      height: 64
    },
    // collisionDimensions: {
    //   offset: {
    //     x: 1,
    //     y: 47
    //   },
    //   dimensions: {
    //     width: 28,
    //     height: 12,
    //     zheight: 64
    //   },
    //   opacity: 0.35
    // },
    dimensions: {
      width: 30,
      height: 64,
      zheight: 64
    },
    physics: {
      surfaceType: "none"
    }
  },
  corn2: {
    objectType: "corn2",
    biome: "plain",
    group: "corn",
    imageSource: "../../Assets/terrain_atlas.png",
    imageDimensions: {
      x: 481,
      y: 896,
      width: 30,
      height: 64
    },
    // collisionDimensions: {
    //   offset: {
    //     x: 1,
    //     y: 47
    //   },
    //   dimensions: {
    //     width: 28,
    //     height: 12,
    //     zheight: 64
    //   },
    //   opacity: 0.35
    // },
    dimensions: {
      width: 30,
      height: 64,
      zheight: 64
    },
    physics: {
      surfaceType: "none"
    }
  },
  corn3: {
    objectType: "corn3",
    biome: "plain",
    group: "corn",
    imageSource: "../../Assets/terrain_atlas.png",
    imageDimensions: {
      x: 481,
      y: 832,
      width: 30,
      height: 64
    },
    // collisionDimensions: {
    //   offset: {
    //     x: 1,
    //     y: 47
    //   },
    //   dimensions: {
    //     width: 28,
    //     height: 12,
    //     zheight: 64
    //   },
    //   opacity: 0.35
    // },
    dimensions: {
      width: 30,
      height: 64,
      zheight: 64
    },
    physics: {
      surfaceType: "none"
    }
  },
  plainTree: {
    biome: "plain",
    images: [
      {
        // Tree top
        imageSource: "../../Assets/plants/plant repack-64.png",
        imageDimensions: {
          x: 165,
          y: 1034,
          width: 190,
          height: 178,
        },
        fadeEndOffset: {
          y: 64
        },
        offset: {
          z: 156,
          y: 156
        },
        losFade: true
      },
      {
        // Tree base
        imageSource: "../../Assets/plants/plant repack-64.png",
        imageDimensions: {
          x: 20,
          y: 1128,
          width: 104,
          height: 83
        },
        offset: {
          x: 41,
          y: 156
        }
      },
      {
        // Tree shadow
        imageSource: "../../Assets/plants/plant repack-64.png",
        imageDimensions: {
          x: 7,
          y: 1231,
          width: 130,
          height: 64
        },
        offset: {
          x: 28,
          y: 181
        }
      }
    ],
    physics: {
      surfaceType: "terrain"
    },
    // TODO: fix
    dimensions: {
      width: 103,
      height: 50,
      zheight: 128
    },
    collisionDimensions: [
      {
        offset: {
          x: 45,
          y: 188
        },
        dimensions: {
          width: 96,
          height: 44,
          zheight: 0
        }
      },
      {
        offset: {
          x: 71,
          y: 188,
          z: 0
        },
        dimensions: {
          width: 46,
          height: 32,
          zheight: 128
        },
        opacity: 1.0
      }
    ]
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
    losDimensions: {
      width: 35,
      height: 20
    }
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
    }
  },
  forestTree: {
    biome: "forest",
    images: [
      {
        // Tree top
        imageSource: "../../Assets/plants/plant repack-64.png",
        imageDimensions: {
          x: 370,
          y: 1030,
          width: 170,
          height: 184,
        },
        dimensions: {
          width: 170,
          height: 184,
          zheight: 184
        },
        fadeEndOffset: {
          y: 64
        },
        offset: {
          z: 164,
          y: 164
        },
        losFade: true
      },
      {
        // Tree base
        imageSource: "../../Assets/plants/plant repack-64.png",
        imageDimensions: {
          x: 552,
          y: 1090,
          width: 120,
          height: 128
        },
        perspectiveOffset: {
          y: 105
        },
        dimensions: {
          width: 120,
          height: 128,
          zheight: 128
        },
        offset: {
          x: 30,
          y: 164
        }
      },
      {
        // Tree shadow
        imageSource: "../../Assets/plants/plant repack-64.png",
        imageDimensions: {
          x: 685,
          y: 1158,
          width: 120,
          height: 60
        },
        perspectiveOffset: {
          y: 0
        },
        dimensions: {
          width: 120,
          height: 60,
          zheight: 0
        },
        offset: {
          x: 30,
          y: 232
        }
      }
    ],
    physics: {
      surfaceType: "terrain"
    },
    // 522, 924 -> 170x294
    // TODO: fix
    dimensions: {
      width: 170,
      height: 294,
      zheight: 273
    },
    collisionDimensions: [
      {
        offset: {
          x: 73,
          y: 256
        },
        dimensions: {
          width: 32,
          height: 12,
          zheight: 196
        },
        opacity: 1.0
      }
    ]
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
  },
  // TODO: automatically place exit at same location
  caveEntrance: {
    biome: "any",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 0,
      y: 320,
      width: 64,
      height: 86
    },
    perspectiveOffset: {
      x: 0,
      y: -86
    },
    physics: {
      surfaceType: "terrain",
    },
    dimensions: {
      width: 64,
      height: 86
    },
    terrainDimensions: caveEntranceDimensions,
    hitboxDimensions: caveEntranceDimensions,
    functions: [
      {
        offset: {
          x: -32,
          y: -43
        },
        dimensions: {
          width: 60,
          height: 16
        },
        cb: (object) => object.level = -1
      }
    ]
  },
  caveExit: {
    biome: "any",
    imageSource: "../../Assets/terrain_atlas-64.png",
    imageDimensions: {
      x: 0,
      y: 320,
      width: 64,
      height: 86
    },
    perspectiveOffset: {
      x: 0,
      y: -86
    },
    physics: {
      surfaceType: "terrain",
    },
    dimensions: {
      width: 64,
      height: 86
    },
    terrainDimensions: caveEntranceDimensions,
    hitboxDimensions: caveEntranceDimensions,
    functions: [
      {
        offset: {
          x: -32,
          y: -43
        },
        dimensions: {
          width: 60,
          height: 16
        },
        cb: (object) => object.position.z = 0
      }
    ]
  }
}
