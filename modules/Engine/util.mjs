
import Vec3 from "./GameObject/Vec3.mjs"

function getDistance(a, b) {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};
    
function normalize(point) {
  if (point) {
    let norm = Math.sqrt(point.x * point.x + point.y * point.y);
    if (norm !== 0) {
      return {
        x: point.x / norm,
        y: point.y / norm,
        z: point.z
      }
    }
  }
  return point;
}

// https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect/1968345#1968345
function getLineIntersection(line1, line2) {
  // let minZ1 = Math.min(line1[0].z, line1[0].z);
  // let maxZ1 = Math.max(line1[1].z, line1[1].z);
  // let minZ2 = Math.min(line2[0].z, line2[0].z);
  // let maxZ2 = Math.max(line2[1].z, line2[1].z);

  // if (minZ1 > maxZ2 || minZ2 > maxZ1) {
  //   return false;
  // }

  let s1_x, s1_y, s2_x, s2_y;
  s1_x = line1[1].x - line1[0].x;     s1_y = line1[1].y - line1[0].y;
  s2_x = line2[1].x - line2[0].x;     s2_y = line2[1].y - line2[0].y;

  let s, t;
  s = (-s1_y * (line1[0].x - line2[0].x) + s1_x * (line1[0].y - line2[0].y)) / (-s2_x * s1_y + s1_x * s2_y);
  t = ( s2_x * (line1[0].y - line2[0].y) - s2_y * (line1[0].x - line2[0].x)) / (-s2_x * s1_y + s1_x * s2_y);

  if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
  {
    // Collision detected
    return new Vec3({
      x: line1[0].x + (t * s1_x),
      y: line1[0].y + (t * s1_y)
    });
  }

  return false;
}

export { getDistance, normalize, getLineIntersection }
