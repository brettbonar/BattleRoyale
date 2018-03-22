function getDistance(a, b) {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  let dz = (a.z - b.z) || 0;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

function normalize(point) {
  if (point) {
    let norm = Math.sqrt(point.x * point.x + point.y * point.y);
    if (norm !== 0) {
      return {
        x: point.x / norm,
        y: point.y / norm
      }
    }
  }
  return point;
}

export { getDistance, normalize }
