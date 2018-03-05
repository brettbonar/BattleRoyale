import buildings from "../Objects/buildings.js"
import buildingObjects from "../Objects/buildingObjects.js"

export default class BuildingRenderer {
  constructor(params) {
    Object.assign(this, params);

    let building = buildings[params];
    this.outside = _.map(building.outside, (object) => {
      let obj = buildingObjects[object.name];
      let image = new Image();
      image.src = obj.imageSource;
      return {
        image: image,
        name: object.name,
        offset: object.offset,
        imageDimensions: obj.imageDimensions
      };
    });
  }

  render(context, object, elapsedTime, center) {
    // let offset = {
    //   x: (this.imageDimensions.width) / 2,
    //   y: this.imageDimensions.height
    // };
    // if (this.imageDimensions.offset) {
    //   Object.assign(offset, this.imageDimensions.offset);
    // }
    // let position = {
    //   x: object.position.x - offset.x,
    //   y: object.position.y - offset.y
    // };
    let position = object.position;

    for (const piece of this.outside) {
      context.drawImage(piece.image, piece.imageDimensions.x, piece.imageDimensions.y, piece.imageDimensions.width, piece.imageDimensions.height,
        position.x + piece.offset.x, position.y + piece.offset.y,
        piece.imageDimensions.width, piece.imageDimensions.height);
    }

    // DEBUG
    // let box = object.boundingBox.box;
    // context.strokeStyle = "magenta";
    // context.strokeRect(box.ul.x, box.ul.y, object.width, object.height);
      
    // let terrainBox = object.terrainBoundingBox.box;
    // context.strokeStyle = "aqua";
    // context.strokeRect(terrainBox.ul.x, terrainBox.ul.y,
    //   object.terrainDimensions.width, object.terrainDimensions.height);
  }
}
