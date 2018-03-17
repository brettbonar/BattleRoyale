const SHADOW_START = { z: 0, value: 0.5 };
const SHADOW_END = { z: 160, value: 1 };
const SHADOW_INC = (SHADOW_END.value - SHADOW_START.value) / (SHADOW_END.z - SHADOW_START.z);

function drawShadow(context, object, modelDimensions) {
  if (!modelDimensions) {
    console.log("Need modelDimensions to render shadow");
    return;
  }

  let shadowPos = object.position.plus(modelDimensions.offset).plus({
    y: modelDimensions.dimensions.height - modelDimensions.dimensions.width / 2
  });
  let gradient = context.createRadialGradient(
    shadowPos.x + modelDimensions.dimensions.width / 2,
    shadowPos.y + modelDimensions.dimensions.width / 2,
    modelDimensions.dimensions.width / 2,
    shadowPos.x + modelDimensions.dimensions.width / 2,
    shadowPos.y + modelDimensions.dimensions.width / 2,
    0);
  gradient.addColorStop(0, "transparent");

  let z = object.position.z || 0;
  let shadow = Math.min(1, SHADOW_START.value + z * SHADOW_INC);
  gradient.addColorStop(shadow, "black");
  context.fillStyle = gradient;
  context.fillRect(shadowPos.x, shadowPos.y,
    modelDimensions.dimensions.width, modelDimensions.dimensions.width);
}

export { drawShadow }
