import Vec3 from "./Vec3.mjs"

const TYPE = {
  RECTANGLE: "rectangle",
  RECTANGLE_UL: "rectangleUl",
  AABB: "aabb",
  CIRCLE: "circle",
  INVERSE_CIRCLE: "inverse_circle",
  POINT: "point",
  LINE: "line",
  TRIANGLE: "triangle",
  RAY: "ray"
}

export default class Bounds {
  constructor(params, zheight) {
    this.zheight = zheight || 0;
    this.opacity = params.opacity || 0;
    this.type = params.type || TYPE.AABB;
    if (!_.isUndefined(params.ul)) {
      this.constructFromBox(params);
    } else if (!_.isUndefined(params.dimensions.width) && !_.isUndefined(params.dimensions.height)) {
      this.constructFromRectangle(params);
    } else if (!_.isUndefined(params.dimensions.line)) {
      this.constructFromLine(params);
      this.type = TYPE.LINE;
    } else if (!_.isUndefined(params.dimensions.triangle)) {
      this.constructFromTriangle(params);
      this.type = TYPE.TRIANGLE;
    } else if (!_.isUndefined(params.dimensions.radius)) {
      this.constructFromCircle(params);
      this.type = params.boundsType || TYPE.CIRCLE;
    } else if (!_.isUndefined(params.position)) {
      this.position = new Vec3(params.position);
      this.type = TYPE.POINT;
    } else if (!_.isUndefined(params.ul)) {
      this.constructFromBox(params);
    } else {
      console.log("Bad Bounds constructor");
    }
  }

  static get TYPE() { return TYPE; }

  static intersectsLine(first, second, check2D) {
    //if (_.isNumber(first.z) && _.isNumber(second.z) && Math.floor(first.z) !== Math.floor(second.z)) return;
    if (!check2D) {
      let firstZMin = Math.min(first[0].z, first[1].z);
      let firstZMax = Math.max(first[0].z, first[1].z);
      let secondZMin = Math.min(second[0].z, second[1].z);
      let secondZMax = Math.max(second[0].z, second[1].z);
      // Simple inaccurate check to see if Z axis of lines every intersect
      if (!Bounds.checkZ(firstZMin, firstZMax - firstZMin, secondZMin, secondZMax - secondZMin)) return;
    }
    // https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
    var det, gamma, lambda;
    det = (first[1].x - first[0].x) * (second[1].y - second[0].y) - (second[1].x - second[0].x) * (first[1].y - first[0].y);
    if (det === 0) {
      return false;
    } else {
      lambda = ((second[1].y - second[0].y) * (second[1].x - first[0].x) + (second[0].x - second[1].x) * (second[1].y - first[0].y)) / det;
      gamma = ((first[0].y - first[1].y) * (second[1].x - first[0].x) + (first[1].x - first[0].x) * (second[1].y - first[0].y)) / det;
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
  }

  static isPointInAABB(point, aabb) {
    return point.x <= aabb.right.x && point.x >= aabb.left.x &&
      point.y >= aabb.top.y && point.y <= aabb.bottom.y;
  }

  // https://stackoverflow.com/questions/13300904/determine-whether-point-lies-inside-triangle
  static isPointInTriangle(point, triangle) {
    let alpha = ((triangle.points[1].y - triangle.points[2].y)*(point.x - triangle.points[2].x) + (triangle.points[2].x - triangle.points[1].x)*(point.y - triangle.points[2].y)) /
      ((triangle.points[1].y - triangle.points[2].y)*(triangle.points[0].x - triangle.points[2].x) + (triangle.points[2].x - triangle.points[1].x)*(triangle.points[0].y - triangle.points[2].y));
    let beta = ((triangle.points[2].y - triangle.points[0].y)*(point.x - triangle.points[2].x) + (triangle.points[0].x - triangle.points[2].x)*(point.y - triangle.points[2].y)) /
      ((triangle.points[1].y - triangle.points[2].y)*(triangle.points[0].x - triangle.points[2].x) + (triangle.points[2].x - triangle.points[1].x)*(triangle.points[0].y - triangle.points[2].y));
    let gamma = 1.0 - alpha - beta;

    return alpha > 0 && beta > 0 && gamma > 0;
  }

  static intersectsAABB_Triangle(aabb, triangle) {
    let triangleInBox = triangle.points.some((point) => Bounds.isPointInAABB(point, aabb));
    if (triangleInBox) {
      return true;
    }

    let boxInTriangle = aabb.points.some((point) => Bounds.isPointInTriangle(point, triangle));
    if (boxInTriangle) {
      return true;
    }

    return aabb.lines.some((boxLine) => {
      return triangle.lines.some((triangleLine) => {
        return Bounds.intersectsLine(boxLine, triangleLine, true);
      });
    });
  }

  static checkZ(z1, zheight1, z2, zheight2) {
    return !_.isNumber(z1) || !_.isNumber(z2) ||
      (z1 <= z2 && z1 + zheight1 >= z2) || (z2 <= z1 && z2 + zheight2 >= z1);
  }

  // https://forums.tigsource.com/index.php?topic=26092.0
  // TODO: 3D version?
  static intersectsAABB_Circle(aabb, circle) {
    let point = new Vec3(circle.center);
    if(point.x > aabb.right.x) point.x = aabb.right.x;
    if(point.x < aabb.left.x) point.x = aabb.left.x;
    if(point.y > aabb.bottom.y) point.y = aabb.bottom.y;
    if(point.y < aabb.top.y) point.y = aabb.top.y;

    return point.distanceTo(circle.center) < circle.radius;
  }

  static intersectsAABB_InverseCircle(aabb, circle) {
    let point = new Vec3({
      x: circle.center.x + Math.max(Math.abs(circle.center.x - aabb.left.x), Math.abs(circle.center.x - aabb.right.x)),
      y: circle.center.y + Math.max(Math.abs(circle.center.y - aabb.top.y), Math.abs(circle.center.y - aabb.bottom.y))
    });

    return point.distanceTo(circle.center) > circle.radius;
  }

  static intersectsAABB_AABB(first, second) {
    return Bounds.checkZ(first.box.ul.z, first.zheight, second.box.ul.z, second.zheight) &&
      first.box.ul.x <= second.box.lr.x &&
      first.box.lr.x >= second.box.ul.x &&
      first.box.ul.y <= second.box.lr.y &&
      first.box.lr.y >= second.box.ul.y;
  }

  static intersectsAABB_AABB2D(first, second) {
    return first.box.ul.x <= second.box.lr.x &&
      first.box.lr.x >= second.box.ul.x &&
      first.box.ul.y <= second.box.lr.y &&
      first.box.lr.y >= second.box.ul.y;
  }

  constructFromTriangle(params) {
    this.points = params.dimensions.triangle;
    this.lines = [];
    for (let i = 0; i < this.points.length; i++) {
      let next = i < this.points.length - 1 ? i + 1 : 0;
      this.lines.push([
        this.points[i],
        this.points[next]
      ]);
    }

    // let minX = _.minBy(this.points, "x");
    // let maxX = _.maxBy(this.points, "x");
    // let minY = _.minBy(this.points, "y");
    // let maxY = _.maxBy(this.points, "y");
    // this.box = {
    //   ul: new Vec3({ x: minX, y: minY }),
    //   ur: new Vec3({ x: maxX, y: minY }),
    //   lr: new Vec3({ x: maxX, y: maxY }),
    //   ll: new Vec3({ x: minX, y: maxY })
    // };
  }
  
  constructFromBox(params) {
    this.box = params;
    this.zheight = params.zheight || 0;
    this.lines = [
      [this.box.ul, this.box.ur],
      [this.box.lr, this.box.ll],
      [this.box.ur, this.box.lr],
      [this.box.ll, this.box.ul]
    ];
    this.points = _.toArray(this.box);
    this.center = new Vec3({
      x: this.left.x + this.width / 2,
      y: this.top.y + this.height / 2,
      z: this.box.ul.z
    });
    this.radius = Math.sqrt(this.height * this.height + this.width * this.width) / 2;
  }

  plus(box) {
    let z = Math.min(this.box.ul.z, box.box.ul.z);
    let zheight = Math.max(this.box.ul.z + this.zheight, box.box.ul.z + box.zheight) - z;
    return new Bounds({
      ul: new Vec3({ x: Math.min(this.box.ul.x, box.box.ul.x), y: Math.min(this.box.ul.y, box.box.ul.y), z: z }),
      ur: new Vec3({ x: Math.max(this.box.ur.x, box.box.ur.x), y: Math.min(this.box.ur.y, box.box.ur.y), z: z }),
      lr: new Vec3({ x: Math.max(this.box.lr.x, box.box.lr.x), y: Math.max(this.box.lr.y, box.box.lr.y), z: z }),
      ll: new Vec3({ x: Math.min(this.box.ll.x, box.box.ll.x), y: Math.max(this.box.ll.y, box.box.ll.y), z: z })
    }, zheight);
  }

  extend(box) {
    // TODO: if box instanceof BoundingBox

    let z = Math.min(this.box.ul.z, box.box.ul.z);
    this.zheight = Math.max(this.box.ul.z + this.zheight, box.box.ul.z + box.zheight) - z;
    this.box = {
      ul: new Vec3({ x: Math.min(this.box.ul.x, box.box.ul.x), y: Math.min(this.box.ul.y, box.box.ul.y), z: z }),
      ur: new Vec3({ x: Math.max(this.box.ur.x, box.box.ur.x), y: Math.min(this.box.ur.y, box.box.ur.y), z: z }),
      lr: new Vec3({ x: Math.max(this.box.lr.x, box.box.lr.x), y: Math.max(this.box.lr.y, box.box.lr.y), z: z }),
      ll: new Vec3({ x: Math.min(this.box.ll.x, box.box.ll.x), y: Math.max(this.box.ll.y, box.box.ll.y), z: z })
    };

    this.lines = [
      [this.box.ul, this.box.ur],
      [this.box.lr, this.box.ll],
      [this.box.ur, this.box.lr],
      [this.box.ll, this.box.ul]
    ];

    return this;
  }

  constructFromLine(params) {
    this.lines = [params.dimensions.line];
    let A = params.dimensions.line[0];
    let B = params.dimensions.line[1];
    this.points = [A, B];
    let z = Math.min(params.dimensions.line[0].z, params.dimensions.line[1].z);
    this.zheight = z + Math.max(params.dimensions.line[0].z, params.dimensions.line[1].z);
    this.box = {
      ul: new Vec3({ x: Math.min(A.x, B.x), y: Math.min(A.y, B.y), z: z}),
      ur: new Vec3({ x: Math.max(A.x, B.x), y: Math.min(A.y, B.y), z: z}),
      lr: new Vec3({ x: Math.max(A.x, B.x), y: Math.max(A.y, B.y), z: z}),
      ll: new Vec3({ x: Math.min(A.x, B.x), y: Math.max(A.y, B.y), z: z})
    };
  }

  constructFromCircle(params) {
    this.radius = params.dimensions.radius;
    this.zheight = params.dimensions.zheight || 0;
    this.box = {
      ul: {
        x: params.position.x - params.dimensions.radius, 
        y: params.position.y - params.dimensions.radius 
      },
      ur: {
        x: params.position.x + params.dimensions.radius, 
        y:  params.position.y - params.dimensions.radius 
      },
      lr: {
        x: params.position.x + params.dimensions.radius,
        y: params.position.y + params.dimensions.radius 
      },
      ll: {
        x: params.position.x - params.dimensions.radius,
        y: params.position.y +  params.dimensions.radius
      }
    };

    this.lines = [
      [this.box.ul, this.box.ur],
      [this.box.ur, this.box.lr],
      [this.box.lr, this.box.ll],
      [this.box.ll, this.box.ul]
    ];

    this.center = params.position;
  }

  constructFromRectangle(params) {
    let position = new Vec3(params.position);
    this.box = {
      ul: position,
      ur: position.plus({ x: params.dimensions.width }),
      lr: position.plus({ x: params.dimensions.width, y: params.dimensions.height }),
      ll: position.plus({ y: params.dimensions.height })
    };
    this.zheight = params.dimensions.zheight;

    this.lines = [
      [this.box.ul, this.box.ur],
      [this.box.lr, this.box.ll],
      [this.box.ur, this.box.lr],
      [this.box.ll, this.box.ul]
    ];
    this.points = _.toArray(this.box);
    this.center = new Vec3({
      x: this.left.x + this.width / 2,
      y: this.top.y + this.height / 2,
      z: params.position.z
    });
    this.radius = Math.sqrt(params.dimensions.height * params.dimensions.height + params.dimensions.width * params.dimensions.width) / 2;
  }

  getIntersections(target) {
    if (target instanceof Bounds) {
      if (this.intersects(target)) {
        return target.lines.filter((line) => this.intersects(line));
      }
    } else if (_.isArray(target)) {
      return this.intersects(target) ? [target] : [];
    }
    return [];
  }

  intersectsAxis(target, axis) {
    return this.min[axis] < target.max[axis] && this.max[axis] > target.min[axis];
  }

  intersects2D(target) {
    if (target instanceof Bounds) {
      if (this.type === TYPE.AABB && target.type === TYPE.AABB) {
        let box = target.box;
        return this.box.ul.x < box.lr.x &&
          this.box.lr.x > box.ul.x &&
          this.box.ul.y < box.lr.y &&
          this.box.lr.y > box.ul.y;
      } else if (this.type === TYPE.AABB && target.type === TYPE.TRIANGLE) {
        return Bounds.intersectsAABB_Triangle(this, target);
      } else if (target.type === TYPE.AABB && this.type === TYPE.TRIANGLE) {
        return Bounds.intersectsAABB_Triangle(target, this);
      } else if (this.type === TYPE.AABB && target.type === TYPE.CIRCLE) {
        return Bounds.intersectsAABB_Circle(this, target);
      } else if (target.type === TYPE.AABB && this.type === TYPE.CIRCLE) {
        return Bounds.intersectsAABB_Circle(target, this);
      } else if (this.type === TYPE.AABB && target.type === TYPE.INVERSE_CIRCLE) {
        return Bounds.intersectsAABB_InverseCircle(this, target);
      } else if (target.type === TYPE.AABB && this.type === TYPE.INVERSE_CIRCLE) {
        return Bounds.intersectsAABB_InverseCircle(target, this);
      } else {
        // TODO: do better check
        return _.some(this.lines, (line) => _.some((target.lines), (targetLine) => Bounds.intersectsLine(line, targetLine, true)));
      }
    } else if (_.isArray(target)) { // Line [{ x, y }, { x, y }]
      return _.some(this.lines, (line) => Bounds.intersectsLine(line, target, true));
    } else if (!_.isUndefined(target.x) && !_.isUndefined(target.y)) { // Vec3 { x, y }
      return (!_.isNumber(this.box.ul.z) || !_.isNumber(target.z) || Math.floor(target.z) === Math.floor(this.box.ul.z)) &&
        target.x >= this.box.ul.x && target.x <= this.box.lr.x &&
        target.y >= this.box.ul.y && target.y <= this.box.lr.y;
    }

    return false;
  }

  intersects(target) {
    // TODO: add circle intersection tests
    if (target instanceof Bounds) {
      if (this.type === TYPE.AABB && target.type === TYPE.AABB) {
        return Bounds.intersectsAABB_AABB(this, target);
      } else if (this.type === TYPE.AABB && target.type === TYPE.TRIANGLE) {
        return Bounds.intersectsAABB_Triangle(this, target);
      } else if (target.type === TYPE.AABB && this.type === TYPE.TRIANGLE) {
        return Bounds.intersectsAABB_Triangle(target, this);
      } else if (this.type === TYPE.AABB && target.type === TYPE.CIRCLE) {
        return Bounds.intersectsAABB_Circle(this, target);
      } else if (target.type === TYPE.AABB && this.type === TYPE.CIRCLE) {
        return Bounds.intersectsAABB_Circle(target, this);
      } else if (this.type === TYPE.AABB && target.type === TYPE.INVERSE_CIRCLE) {
        return Bounds.intersectsAABB_InverseCircle(this, target);
      } else if (target.type === TYPE.AABB && this.type === TYPE.INVERSE_CIRCLE) {
        return Bounds.intersectsAABB_InverseCircle(target, this);
      } else {
        // TODO: do better check
        return _.some(this.lines, (line) => _.some((target.lines), (targetLine) => Bounds.intersectsLine(line, targetLine)));
      }
    } else if (_.isArray(target)) { // Line [{ x, y }, { x, y }]
      return _.some(this.lines, (line) => Bounds.intersectsLine(line, target));
    } else if (!_.isUndefined(target.x) && !_.isUndefined(target.y)) { // Vec3 { x, y }
      return (!_.isNumber(this.box.ul.z) || !_.isNumber(target.z) || Math.floor(target.z) === Math.floor(this.box.ul.z)) &&
        target.x >= this.box.ul.x && target.x <= this.box.lr.x &&
        target.y >= this.box.ul.y && target.y <= this.box.lr.y;
    }

    return false;
  }

  get ul() {
    return this.box.ul;
  }
  get ur() {
    return this.box.ur;
  }
  get lr() {
    return this.box.lr;
  }
  get ll() {
    return this.box.ll;
  }

  get top() {
    return this.box.ul.plus({ z: this.zheight });;
  }
  get bottom() {
    return this.box.lr;
  }
  get left() {
    return this.box.ul;
  }
  get right() {
    return this.box.lr;
  }

  get x() { return this.box.ul.x; }
  get y() { return this.box.ul.y; }

  get width() {
    return this.box.ur.x - this.box.ul.x;
  }
  get height() {
    return this.box.ll.y - this.box.ul.y;
  }

  get bounds() {
    return this.bounds;
  }
  get boundingBox() {
    return this.box;
  }

  get max() {
    return new Vec3({
      x: this.box.lr.x,
      y: this.box.lr.y,
      z: this.box.lr.z + this.zheight
    });
  }

  get min() {
    return new Vec3({
      x: this.box.ul.x,
      y: this.box.ul.y,
      z: this.box.ul.z
    });
  }
}
