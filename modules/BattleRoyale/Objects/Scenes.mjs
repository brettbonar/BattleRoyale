import objects from "./objects.mjs"
import StaticObject from "./StaticObject.mjs"
import Building from "../Buildings/Building.mjs"

const scenes = {};

scenes.plainTree = {
  biomes: ["plain"],
  size: {
    width: 96,
    height: 44
  },
  weight: 25,
  getObjects: function (position, dimensions) {
    let offset = {
      x: -45,
      y: -188
    };
    return [
      new StaticObject({
        objectType: "plainTree",
        position: {
          x: position.x + offset.x,
          y: position.y + offset.y
        },
        simulation: true
      })
    ];
  }
}

scenes.forestTree = {
  biomes: ["forest"],
  size: {
    width: 200,
    height: 400
  },
  weight: 1,
  getObjects: function (position, dimensions) {
    let offset = {
      x: -73,
      y: -256
    };
    return [
      new StaticObject({
        objectType: "forestTree",
        position: {
          x: position.x + offset.x,
          y: position.y + offset.y
        },
        simulation: true
      })
    ];
  }
}

scenes.house = {
  biomes: ["plain"],
  minCount: 1,
  maxCount: 2,
  size: {
    width: 200,
    height: 400
  },
  weight: 1,
  getObjects: function (position, dimensions) {
    return [
      new Building({
        buildingType: "house",
        simulation: true,
        position: position
      })
    ];
  }
}

scenes.corn = {
  biomes: ["plain"],
  minCount: 2,
  maxCount: 4,
  // 10x5
  minSize: {
    width: 220,
    height: 110
  },
  maxSize: {
    width: 440,
    height: 220
  },
  weight: 3,
  getObjects: function (position, dimensions) {
    let spacing = 22;
    let sceneObjects = [];
    dimensions = {
      width: 330,
      height: 160
    };
    for (let i = 0; i < dimensions.width / spacing; i++) {
      for (let j = 0; j < dimensions.height / spacing; j++) {
        let type = _.sample(_.filter(objects, { group: "corn" })).objectType;
        sceneObjects.push(new StaticObject({
          objectType: type,
          position: {
            x: position.x + i * spacing,
            y: position.y + j * spacing
          },
          simulation: true
        }));
      }
    }
    return sceneObjects;
  }
};

// scenes.wheat = {
//   // 10x5
//   minSize: {
//     width: 192,
//     height: 192
//   },
//   maxSize: {
//     width: 1920,
//     height: 1920
//   },
//   getObjects: function (position, dimensions) {
//     let spacing = 32;
//     let sceneObjects = [];
//     for (let i = 0; i < dimensions.width / spacing; i++) {
//       for (let j = 0; j < dimensions.height / spacing; j++) {
//         let type;
//         if (i === 0 && j === 0) {
//           type = "wheatUL";
//         } else if (i < dimensions.width - 1 && j === 0) {
//           type = "wheatTop";
//         } else if (i === dimensions.width - 1 && j === 0) {
//           type = "wheatUR";
//         } else if (i === 0 && j < dimensions.height - 1) {
//           type = "wheatLeft";
//         } else if (i < dimensions.width - 1 && j < dimensions.height - 1) {
//           type = "wheatMid";
//         } else if (i === dimensions.width - 1 && j < dimensions.height - 1) {
//           type = "wheatRight";
//         } else if (i === 0 && j === dimensions.height - 1) {
//           type = "wheatLL";
//         } else if (i < dimensions.width - 1 && j === dimensions.height - 1) {
//           type = "wheatBottom";
//         } else if (i === dimensions.width - 1 && j === dimensions.height - 1) {
//           type = "wheatLR";
//         }

//         sceneObjects.push(new StaticObject({
//           objectType: type,
//           position: {
//             x: position.x + i * spacing,
//             y: position.y + j * spacing
//           },
//           simulation: true
//         }));
//       }
//     }
//     return sceneObjects;
//   }
// };

export default scenes;
