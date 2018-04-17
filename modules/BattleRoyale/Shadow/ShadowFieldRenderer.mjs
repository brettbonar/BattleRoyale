import Vec3 from "../../Engine/GameObject/Vec3.mjs"
import ImageCache from "../../Engine/Rendering/ImageCache.mjs"
import Canvas from "../../Engine/Rendering/Canvas.mjs";

const FRAME_TIME = 64;
const FRAME_OFFSET = 1;
const FRAME_OFFSET2 = 0.5;
const SHADOW_EDGE_START = 0;

export default class ShadowFieldRenderer {
  constructor(params) {
    this.centerPosition = params.centerPosition;
    this.image = ImageCache.get("/Assets/shadow_fog_s.png");
    this.image2 = ImageCache.get("/Assets/shadow_fog2.png");
    this.renderOffset = new Vec3();
    this.currentTime = 0;

    let tempCanvas = Canvas.create(params.dimensions);
    this.canvas = tempCanvas.canvas;
    this.context = tempCanvas.context;
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;
    if (this.currentTime >= FRAME_TIME) {
      this.currentTime -= FRAME_TIME;
      this.renderOffset.x -= FRAME_OFFSET;
      if (this.renderOffset.x < 0) {
        this.renderOffset.x = this.image.width + this.renderOffset.x;
      }
    }
  }

  addHole(context, object) {
    // TODO: could avoid making gradient if it's not in view
    if (object.shadowRadius === 0 && object.bufferRadius === 0) return;

    // context.beginPath();
    // context.arc(object.shadowCenter.x - this.ul.x, object.shadowCenter.y - this.ul.y, Math.max(0, object.shadowRadius), 0, 2 * Math.PI);
    // context.clip();
    // context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    var radGrd = context.createRadialGradient(
      object.shadowCenter.x - this.ul.x, object.shadowCenter.y - this.ul.y, Math.max(0, object.shadowRadius),
      object.shadowCenter.x - this.ul.x, object.shadowCenter.y - this.ul.y, object.shadowRadius + object.bufferRadius);
    radGrd.addColorStop(  0, "rgba( 0, 0, 0,  1 )" );
    //radGrd.addColorStop( .5, "rgba( 0, 0, 0, .5 )" );
    radGrd.addColorStop(  1, "rgba( 0, 0, 0,  0 )" );
    context.globalCompositeOperation = "destination-out";
    context.fillStyle = radGrd;
    context.fillRect(object.shadowCenter.x - this.ul.x - object.shadowRadius * 2 - object.bufferRadius,
      object.shadowCenter.y - this.ul.y - object.shadowRadius * 2 - object.bufferRadius,
      object.shadowRadius * 4 + object.bufferRadius * 2, object.shadowRadius * 4 + object.bufferRadius * 2);
    context.globalCompositeOperation = "source-over";
  }

  renderToOverlay(context, object, elapsedTime, clipping, center) {
    if (this.canvas.width !== context.canvas.width + 8 || this.canvas.height !== context.canvas.height + 8) {
      this.canvas.width = context.canvas.width + 8;
      this.canvas.height = context.canvas.height + 8;
    }

    this.ul = {
      x: Math.max(object.position.x, center.x - context.canvas.width / 2),
      y: Math.max(object.position.y, center.y - context.canvas.height / 2)
    };

    // Draw base fog
    // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // this.context.fillStyle = "rgba(0, 0, 0, 0.8)";
    // this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // this.addHole(this.context, object);
    // context.drawImage(this.canvas, this.ul.x, this.ul.y, context.canvas.width, context.canvas.height);

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.save();

    this.context.translate(-(center.x - this.context.canvas.width / 2),
      -(center.y - this.context.canvas.height / 2));

    let imageOffset = {
      x: (this.renderOffset.x + this.ul.x) % this.image.width,
      y: (this.renderOffset.y + this.ul.y) % this.image.height,
    }

    // TODO: could optimize this to avoid drawing too much out of bounds
    let drawnWidth = 0;
    while (drawnWidth < this.canvas.width) {
      let xoffset = (imageOffset.x + drawnWidth) % this.image.width;

      let width = this.image.width - xoffset;
      let height = this.image.height - imageOffset.y;
      this.context.drawImage(this.image, xoffset, imageOffset.y, width, height,
        drawnWidth + this.ul.x, this.ul.y, width, height);
      // this.context.drawImage(this.image, xoffset, imageOffset.y, width, height,
      //   drawnWidth, 0, width, height);

      let drawnHeight = height;
      while (drawnHeight < this.canvas.height) {
        let yoffset = (imageOffset.y + drawnHeight) % this.image.height;
        let nextHeight = this.image.height - yoffset;
        this.context.drawImage(this.image, xoffset, yoffset, width, nextHeight,
          drawnWidth + this.ul.x, drawnHeight + this.ul.y, width, nextHeight);
        // this.context.drawImage(this.image, xoffset, yoffset, width, nextHeight,
        //   drawnWidth, drawnHeight, width, nextHeight);

        drawnHeight += nextHeight;
      }

      drawnWidth += width;
    }

    this.addHole(this.context, object);

    this.context.restore();
  }

  renderToTempCanvas(context, object, elapsedTime, clipping, center) {
    if (this.canvas.width !== context.canvas.width + 8 || this.canvas.height !== context.canvas.height + 8) {
      this.canvas.width = context.canvas.width + 8;
      this.canvas.height = context.canvas.height + 8;
    }

    this.ul = {
      x: Math.max(object.position.x, center.x - context.canvas.width / 2),
      y: Math.max(object.position.y, center.y - context.canvas.height / 2)
    };

    // Draw base fog
    // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // this.context.fillStyle = "rgba(0, 0, 0, 0.8)";
    // this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // this.addHole(this.context, object);
    // context.drawImage(this.canvas, this.ul.x, this.ul.y, context.canvas.width, context.canvas.height);

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.save();

    let imageOffset = {
      x: (this.renderOffset.x + this.ul.x) % this.image.width,
      y: (this.renderOffset.y + this.ul.y) % this.image.height,
    }

    // TODO: could optimize this to avoid drawing too much out of bounds
    let drawnWidth = 0;
    while (drawnWidth < this.canvas.width) {
      let xoffset = (imageOffset.x + drawnWidth) % this.image.width;

      let width = this.image.width - xoffset;
      let height = this.image.height - imageOffset.y;
      this.context.drawImage(this.image, xoffset, imageOffset.y, width, height,
        drawnWidth, 0, width, height);

      let drawnHeight = height;
      while (drawnHeight < this.canvas.height) {
        let yoffset = (imageOffset.y + drawnHeight) % this.image.height;
        let nextHeight = this.image.height - yoffset;
        this.context.drawImage(this.image, xoffset, yoffset, width, nextHeight,
          drawnWidth, drawnHeight, width, nextHeight);

        drawnHeight += nextHeight;
      }

      drawnWidth += width;
    }

    this.addHole(this.context, object);

    this.context.restore();
  }

  // Since the shadow covers the whole map, get just the part that covers the current field of view
  render(context, object, elapsedTime, clipping, center) {
    if (!this.image.complete) return;

    // if (clipping.offset.y === 0) {
    //   this.renderToOverlay(context, object, elapsedTime, clipping, center);
    // }

    if (clipping) {
      if (clipping.offset.y === 0) {
        this.renderToTempCanvas(context, object, elapsedTime, clipping, center);
      }
      clipping.offset.y = clipping.offset.y - (this.ul.y - object.position.y);

      // TRICKY: subtract 1 since clipping adds 1 to height by default to avoid artifacts on most other images
      let height = Math.min(clipping.dimensions.height, this.canvas.height - clipping.offset.y) - 1;
      if (window.debug) {
        context.lineWidth = 1;
        context.strokeStyle = "red";
        context.strokeRect(this.ul.x + clipping.offset.x, this.ul.y + clipping.offset.y, this.canvas.width, height);
      }

      context.drawImage(this.canvas, clipping.offset.x, clipping.offset.y, this.canvas.width, height,
        this.ul.x + clipping.offset.x, this.ul.y + clipping.offset.y, this.canvas.width, height);
    } else {
      this.renderToTempCanvas(context, object, elapsedTime, clipping, center);
      context.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height,
        this.ul.x, this.ul.y, context.canvas.width, context.canvas.height);
    }
  }
}
