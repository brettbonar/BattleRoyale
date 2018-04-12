// TODO: fix sprites that share edges
import magicEffects from "../Magic/magicEffects.mjs"
import Bounds from "../../Engine/GameObject/Bounds.mjs"

let items = {
  bow: {
    type: "item",
    itemType: "bow",
    equipmentType: "bow",
    name: "Bow",
    biome: "any",
    imageSource: "/Assets/items/bow.png",
    imageDimensions: {
      x: 0,
      y: 0,
      width: 64,
      height: 64
    },
    physics: {
      surfaceType: "none",
    },
    dimensions: {
      width: 64,
      height: 64,
      zheight: 16
    },
    isInteractable: true,
    interactionDimensions: [
      {
        dimensions: {
          width: 64,
          height: 64
        }
      }
    ]
  },
  fireOrb: {
    type: "item",
    itemType: "fireStaff",
    equipmentType: "fireStaff",
    name: "Fire Orb",
    biome: "any",
    imageSource: "/Assets/items/fireOrb.png",
    imageDimensions: {
      x: 0,
      y: 0,
      width: 32,
      height: 32
    },
    physics: {
      surfaceType: "none",
    },
    dimensions: {
      width: 32,
      height: 32,
      zheight: 8
    },
    isInteractable: true,
    interactionDimensions: [
      {
        dimensions: {
          width: 32,
          height: 32
        }
      }
    ]
  },
  lightOrb: {
    type: "item",
    itemType: "lightStaff",
    equipmentType: "lightStaff",
    name: "Light Orb",
    biome: "any",
    imageSource: "/Assets/items/lightOrb.png",
    imageDimensions: {
      x: 0,
      y: 0,
      width: 32,
      height: 32
    },
    physics: {
      surfaceType: "none",
    },
    dimensions: {
      width: 32,
      height: 32,
      zheight: 8
    },
    isInteractable: true,
    interactionDimensions: [
      {
        dimensions: {
          width: 32,
          height: 32
        }
      }
    ]
  },
  waterOrb: {
    type: "item",
    itemType: "waterStaff",
    equipmentType: "waterStaff",
    name: "Water Orb",
    biome: "any",
    imageSource: "/Assets/items/waterOrb.png",
    imageDimensions: {
      x: 0,
      y: 0,
      width: 32,
      height: 32
    },
    physics: {
      surfaceType: "none",
    },
    dimensions: {
      width: 32,
      height: 32,
      zheight: 8
    },
    isInteractable: true,
    interactionDimensions: [
      {
        dimensions: {
          width: 32,
          height: 32
        }
      }
    ]
  }
};

export default {
  dragonspear: {
    imageSource: "/Assets/character/weapons/oversize/two hand/either/dragonspear.png",
    imageSize: 192,
    type: "weapon",
    attackType: "thrust",
    hands: 2,
    gender: "either"
  },
  trident: {
    imageSource: "/Assets/character/weapons/oversize/two hand/either/trident.png",
    imageSize: 192,
    type: "weapon",
    attackType: "thrust",
    hands: 2,
    gender: "either"
  },
  longspear: {
    imageSource: "/Assets/character/weapons/oversize/two hand/either/spear.png",
    imageSize: 192,
    type: "weapon",
    attackType: "thrust",
    hands: 2,
    gender: "either"
  },
  spearFemale: {
    imageSource: "/Assets/character/weapons/right hand/female/spear_female.png",
    imageSize: 64,
    type: "weapon",
    attackType: "thrust",
    hands: 1,
    gender: "female",
    attacks: {
      1: "plasmaBall",
      2: "lightningclaw"
    }
  },
  spearMale: {
    imageSource: "/Assets/character/weapons/right hand/male/spear_male.png",
    imageSize: 64,
    type: "weapon",
    attackType: "thrust",
    hands: 1,
    gender: "male",
    attacks: {
      1: "lightBeam",
      2: "lightMote"
    }
  },
  bow: {
    imageSource: "/Assets/character/weapons/right hand/either/bow.png",
    imageSize: 64,
    itemType: "bow",
    type: "weapon",
    attackType: "bow",
    hands: 1,
    gender: "either",
    attacks: {
      1: "arrow"
    },
    world: items.bow
  },
  staffMale: {
    imageSource: "/Assets/character/weapons/right hand/male/staff_male.png",
    imageSize: 64,
    itemType: "staffMale",
    type: "weapon",
    attackType: "thrust",
    hands: 1,
    gender: "male",
    attacks: {
      1: "plasmaBall",
      2: "boulder"
    }
  },
  fireStaffMale: {
    imageSource: "/Assets/character/weapons/right hand/male/fireStaff_male.png",
    imageSize: 64,
    itemType: "fireStaffMale",
    type: "weapon",
    attackType: "thrust",
    hands: 1,
    gender: "male",
    attacks: {
      1: "flamethrower",
      2: "lionFlare"
    },
    world: items.fireOrb
  },
  lightStaffMale: {
    imageSource: "/Assets/character/weapons/right hand/male/lightStaff.png",
    imageSize: 64,
    itemType: "lightStaffMale",
    type: "weapon",
    attackType: "thrust",
    hands: 1,
    gender: "male",
    attacks: {
      1: "lightBeam",
      2: "lightMote"
    },
    world: items.lightOrb
  },
  waterStaffMale: {
    imageSource: "/Assets/character/weapons/right hand/male/waterStaff_male.png",
    imageSize: 64,
    itemType: "waterStaffMale",
    type: "weapon",
    attackType: "thrust",
    hands: 1,
    gender: "male",
    attacks: {
      1: "waterJet",
      2: "torrentacle"
    },
    world: items.waterOrb
  },
  axe: {
    imageSource: "/Assets/character/weapons/right hand/either/axe.png",
    imageSize: 64,
    type: "weapon",
    attackType: "slash",
    hands: 1,
    gender: "either",
    attacks: {
      1: "plasmaBall",
      2: "lightningclaw"
    }
  },
  // spear: {
  //   imageSource: "/Assets/character/weapons/both hand/spear.png",
  //   imageSize: 64,
  //   type: "weapon",
  //   attackType: "thrust",
  //   hands: 2,
  //   gender: "either",
  //   attacks: {
  //     1: "plasmaBall",
  //     2: "lightningclaw"
  //   }
  // },
  leatherChestMale: {
    imageSource: "/Assets/character/torso/leather/chest_male.png",
    imageSize: 64,
    type: "torso",
    gender: "male"
  },
  tealPantsMale: {
    imageSource: "/Assets/character/legs/pants/male/teal_pants_male.png",
    imageSize: 64,
    type: "legs",
    gender: "male"
  },
  clothHoodMale: {
    imageSource: "/Assets/character/head/hoods/male/cloth_hood_male.png",
    imageSize: 64,
    type: "head",
    gender: "male"
  },
  brownShoesMale: {
    imageSource: "/Assets/character/feet/shoes/male/brown_shoes_male.png",
    imageSize: 64,
    type: "feet",
    gender: "male"
  },
  leatherBracersMale: {
    imageSource: "/Assets/character/hands/bracers/male/leather_bracers_male.png",
    imageSize: 64,
    type: "hands",
    gender: "male"
  }  
}
