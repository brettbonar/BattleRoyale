import Bounds from "../../Engine/GameObject/Bounds.js";

export default {
  house: {
    dimensions: {
      width: 194,
      height: 194
    },
    bounds: [
      {
        offset: {
          x: 3,
          y: 12
        },
        dimensions: {
          width: 188,
          height: 14
        },
        boundsType: Bounds.TYPE.RECTANGLE_UL
      },
      {
        offset: {
          x: 3,
          y: 12
        },
        dimensions: {
          width: 7,
          height: 181
        },
        boundsType: Bounds.TYPE.RECTANGLE_UL
      },
      {
        offset: {
          x: 185,
          y: 12
        },
        dimensions: {
          width: 7,
          height: 181
        },
        boundsType: Bounds.TYPE.RECTANGLE_UL
      },
      {
        offset: {
          x: 3,
          y: 180
        },
        dimensions: {
          width: 70,
          height: 13
        },
        boundsType: Bounds.TYPE.RECTANGLE_UL
      },
      {
        offset: {
          x: 121,
          y: 180
        },
        dimensions: {
          width: 70,
          height: 13
        },
        boundsType: Bounds.TYPE.RECTANGLE_UL
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
      renderOffset: {
        x: 194 / 2,
        y: 0
      },
      bounds: [
        {
          offset: {
            x: 6,
            y: 15
          },
          dimensions: {
            width: 181,
            height: 176
          },
          boundsType: Bounds.TYPE.RECTANGLE_UL
        },
        {
          offset: {
            x: 72,
            y: 190
          },
          dimensions: {
            width: 50,
            height: 8
          },
          boundsType: Bounds.TYPE.RECTANGLE_UL
        }
      ]
    },
    exterior: {
      imageSource: "../../Assets/Buildings/house1.png",
      imageDimensions: {
        x: 0,
        y: 0,
        width: 194,
        height: 194
      },
      renderOffset: {
        x: 194 / 2,
        y: 194
      }
    }
  }
}
