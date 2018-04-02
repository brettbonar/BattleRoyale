import Bounds from "../../Engine/GameObject/Bounds.mjs";

export default {
  healthPotion: {
    type: "item",
    itemType: "healthPotion",
    name: "Health Potion",
    biome: "any",
    imageSource: "../../Assets/items/items.png",
    imageDimensions: {
      x: 39,
      y: 98,
      width: 19,
      height: 29
    },
    physics: {
      surfaceType: "none",
    },
    dimensions: {
      width: 19,
      height: 29
    },
    interactionDimensions: [
      {
        offset: {
          x: 0,
          y: -10
        },
        dimensions: {
          radius: 15
        },
        boundsType: Bounds.TYPE.CIRCLE
      }
    ],
    // image icon
    effect: {
      restoreHealth: 25
    }
  },
  fireStaff: {
    type: "item",
    itemType: "fireStaff",
    equipmentType: "fireStaff",
    name: "Fire Orb",
    biome: "any",
    imageSource: "../../Assets/items/fireOrb.png",
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
      height: 32
    },
    interactionDimensions: [
      {
        dimensions: {
          radius: 10
        },
        boundsType: Bounds.TYPE.CIRCLE
      }
    ]
  }
}
