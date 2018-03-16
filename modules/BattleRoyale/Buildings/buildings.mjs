import Bounds from "../../Engine/GameObject/Bounds.mjs";

export default {
  house: {
    dimensions: {
      width: 194,
      height: 194
    },
    doors: [
      {
        exterior: {
          imageSource: "../../Assets/Buildings/house1.png",
          imageDimensions: {
            x: 0,
            y: 194,
            width: 34,
            height: 50
          },
          renderOffset: {
            x: 80,
            y: 144
          },
          perspectiveOffset: {
            x: 194 / 2,
            y: 194
          }
        },
        closed: {
          losDimensions: [
            {
              offset: {
                x: 96,
                y: 192
              },
              dimensions: {
                width: 34,
                height: 16
              }
            }
          ],
          terrainDimensions: [
            {
              offset: {
                x: 96,
                y: 192
              },
              dimensions: {
                width: 34,
                height: 16
              }
            }
          ],
          hitboxDimensions: [
            {
              offset: {
                x: 96,
                y: 192
              },
              dimensions: {
                width: 34,
                height: 16
              }
            }
          ]
        }
      }
    ],
    renderHeight: 3,
    collisionDimensions: [
      {
        offset: {
          x: 3,
          y: 64
        },
        dimensions: {
          width: 188,
          height: 14
        },
        opaque: true
      },
      {
        offset: {
          x: 3,
          y: 64,
          z: [1,2,3]
        },
        dimensions: {
          width: 188,
          height: 32
        },
        opaque: true
      },
      {
        offset: {
          x: 3,
          y: 64,
          z: [0,1,2,3]
        },
        dimensions: {
          width: 7,
          height: 129
        },
        opaque: true
      },
      {
        offset: {
          x: 185,
          y: 64,
          z: [0,1,2,3]
        },
        dimensions: {
          width: 7,
          height: 129
        },
        opaque: true
      },
      {
        offset: {
          x: 3,
          y: 180,
          z: [0,1,2,3]
        },
        dimensions: {
          width: 70,
          height: 13
        },
        opaque: true
      },
      {
        offset: {
          x: 121,
          y: 180,
          z: [0,1,2,3]
        },
        dimensions: {
          width: 70,
          height: 13
        },
        opaque: true
      }
    ],
    interior: {
      imageSource: "../../Assets/Buildings/house1.png",
      imageDimensions: {
        x: 196,
        y: 0,
        width: 194,
        height: 194
      },
      bounds: [
        {
          offset: {
            x: 6,
            y: 15,
            z: -1
          },
          dimensions: {
            width: 181,
            height: 176
          }
        }
        // {
        //   offset: {
        //     x: 72,
        //     y: 190
        //   },
        //   dimensions: {
        //     width: 50,
        //     height: 8
        //   },
        //   boundsType: Bounds.TYPE.RECTANGLE_UL
        // }
      ]
    },
    exterior: {
      imageSource: "../../Assets/Buildings/house1.png",
      imageDimensions: {
        x: 0,
        y: 0,
        width: 194,
        height: 194
      }
    }
  }
}
