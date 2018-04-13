import Vec3 from "../../Engine/GameObject/Vec3.mjs"

export default class ShadowFieldRenderer {
  constructor(params) {
    this.centerPosition = params.centerPosition;
    this.fieldRadius = params.fieldRadius;
  }

  render(context, object, elapsedTime, clipping) {
    context.fillStyle = "rgba(0, 0, 0, 0.5)";

    if (clipping) {
      let position = object.position.plus(clipping.offset);
      context.fillRect(position.x, position.y - object.position.z, clipping.dimensions.width, clipping.dimensions.height);
    } else {
      context.fillRect(object.position.x, object.position.y, object.dimensions.width, object.dimensions.height);
    }
  }
}
