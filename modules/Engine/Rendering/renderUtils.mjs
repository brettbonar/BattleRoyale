const SHADOW_START = { z: 0, value: 0.5 };
const SHADOW_END = { z: 160, value: 1 };
const SHADOW_INC = (SHADOW_END.value - SHADOW_START.value) / (SHADOW_END.z - SHADOW_START.z);

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

  let z = object.position.z || 0;
  let shadow = Math.min(1, SHADOW_START.value + z * SHADOW_INC);
  gradient.addColorStop(shadow, "black");
  context.fillStyle = gradient;
  context.fillRect(shadowPos.x, shadowPos.y,
    object.modelDimensions.dimensions.width, object.modelDimensions.dimensions.width);
}

export { drawShadow }
