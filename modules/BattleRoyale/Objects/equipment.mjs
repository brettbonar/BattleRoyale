// TODO: fix sprites that share edges
import magicEffects from "../Magic/magicEffects.mjs"

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
      1: "plasmaBall",
      2: "flare"
    }
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
