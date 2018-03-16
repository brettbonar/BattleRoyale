function drawShadow(context, object) {
  let shadowPos = object.position.plus(object.modelDimensions.offset).plus({
    y: object.modelDimensions.dimensions.height - object.modelDimensions.dimensions.width / 2
  });
  let gradient = context.createRadialGradient(
    shadowPos.x + object.modelDimensions.dimensions.width / 2,
    shadowPos.y + object.modelDimensions.dimensions.width / 2,
    object.modelDimensions.dimensions.width / 2,
    shadowPos.x + object.modelDimensions.dimensions.width / 2,
    shadowPos.y + object.modelDimensions.dimensions.width / 2,
    0);
  gradient.addColorStop(0, "transparent");
  gradient.addColorStop(0.75, "black");
  context.fillStyle = gradient;
  context.fillRect(shadowPos.x, shadowPos.y,
    object.modelDimensions.dimensions.width, object.modelDimensions.dimensions.width);
}

export { drawShadow }
