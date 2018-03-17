export default class Dimensions {
  constructor(params) {
    Object.assign(this, params);
    _.defaults(this, {
      width: 0,
      height: 0,
      zheight: 0
    });
  }

  copy() {
    return new Dimensions({
      width: this.width,
      height: this.height,
      zheight: this.zheight
    });
  }
}
