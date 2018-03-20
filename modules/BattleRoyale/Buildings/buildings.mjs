import Bounds from "../../Engine/GameObject/Bounds.mjs";

export default {
  house: {
    dimensions: {
      width: 194,
      height: 290,
      zheight: 128
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
    collisionDimensions: [
      { // Left side
        offset: {
          x: 3,
          y: 128
        },
        dimensions: {
          width: 7,
          height: 161,
          zheight: 128
        },
        opacity: 1.0
      },
      { // Top
        offset: {
          x: 3,
          y: 128
        },
        dimensions: {
          width: 188,
          height: 14,
          zheight: 128
        },
        opacity: 1.0
      },
      { // Right side
        offset: {
          x: 184,
          y: 128
        },
        dimensions: {
          width: 7,
          height: 161,
          zheight: 128
        },
        opacity: 1.0
      },
      { // Front left
        offset: {
          x: 3,
          y: 276
        },
        dimensions: {
          width: 72,
          height: 13,
          zheight: 128
        },
        opacity: 1.0
      },
      { // Front right
        offset: {
          x: 119,
          y: 276
        },
        dimensions: {
          width: 72,
          height: 13,
          zheight: 128
        },
        opacity: 1.0
      },
      // { // Above door
      //   offset: {
      //     x: 76,
      //     y: 161
      //   },
      //   dimensions: {
      //     width: 42,
      //     height: 6,
      //     zheight: 80
      //   }
      // }
    ],
    interior: {
      dimensions: {
        width: 194,
        height: 290,
        zheight: 128
      },
      imageSource: "../../Assets/Buildings/house1.png",
      imageDimensions: {
        x: 196,
        y: 0,
        width: 194,
        height: 290
      },
      bounds: [
        {
          offset: {
            x: 7,
            y: 134,
            z: 0
          },
          dimensions: {
            width: 180,
            height: 153,
            zheight: 128
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
        height: 290
      },
      dimensions: {
        width: 194,
        height: 290,
        zheight: 128
      },
      fadeEndOffset: {
        y: 142
      },
      fadeDimensions: {
        dimensions: {
          width: 194,
          height: 135
        }
      },
      losFade: true,
      perspectiveDimensions: {
        zheight: 128
      }
    }
  }
}
