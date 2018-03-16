export default class Point {
  constructor(params) {
    Object.assign(this, params);
    _.defaults(this, {
      x: 0,
      y: 0,
      z: 0
    });
  }

  static normalize(point) {
    if (point) {
      let norm = Math.sqrt(point.x * point.x + point.y * point.y);
      if (norm !== 0) {
        return {
          x: point.x / norm,
          y: point.y / norm,
          // Don't normalize Z for now
          z: point.z
        }
      }
    }
    return point;
  }

  normalize() {
    return Object.assign(this, Point.normalize(this));
  }

  copy() {
    return new Point({
      x: this.x,
      y: this.y,
      z: this.z
    });
  }

  add(point) {
    this.x += (point && point.x || 0);
    this.y += (point && point.y || 0);
    this.z += (point && point.z || 0);
  }
  
  subtract(point) {
    this.x -= (point && point.x || 0);
    this.y -= (point && point.y || 0);
    this.z -= (point && point.z || 0);
  }
  
  plus(point) {
    return new Point({
      x: this.x + (point && point.x || 0),
      y: this.y + (point && point.y || 0),
      z: this.z + (point && point.z || 0)
    });
  }
  
  minus(point) {
    return new Point({
      x: this.x - (point && point.x || 0),
      y: this.y - (point && point.y || 0),
      z: this.z - (point && point.z || 0)
    });
  }
}
