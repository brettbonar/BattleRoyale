import buildings from "../Objects/buildings.js"
import buildingObjects from "../Objects/buildingObjects.js"

export default class BuildingRenderer {
  constructor(building) {
    this.building = building;
    this.buildingImage = {
      image: new Image(),
      imageDimensions: building.imageDimensions
    };
    this.buildingImage.image.src = building.imageSource;
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

    if (this.buildingImage.image.complete) {
      context.drawImage(this.buildingImage.image, this.buildingImage.imageDimensions.x, this.buildingImage.imageDimensions.y, this.buildingImage.imageDimensions.width, this.buildingImage.imageDimensions.height,
        position.x, position.y,
        this.buildingImage.imageDimensions.width, this.buildingImage.imageDimensions.height);
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
