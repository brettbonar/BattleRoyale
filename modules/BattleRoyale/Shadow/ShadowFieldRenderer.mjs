import Vec3 from "../../Engine/GameObject/Vec3.mjs"
import ImageCache from "../../Engine/Rendering/ImageCache.mjs"
import Canvas from "../../Engine/Rendering/Canvas.mjs";

const FRAME_TIME = 64;
const FRAME_OFFSET = 1;
const FRAME_OFFSET2 = 0.5;

export default class ShadowFieldRenderer {
  constructor(params) {
    this.centerPosition = params.centerPosition;
    this.fieldRadius = params.fieldRadius;
    this.image = ImageCache.get("/Assets/shadow_fog_s.png");
    this.image2 = ImageCache.get("/Assets/shadow_fog2.png");
    this.renderOffset = new Vec3();
    this.renderOffset2 = new Vec3();
    this.currentTime = 0;

    this.canvas = new Canvas(params.dimensions);
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;
    if (this.currentTime >= FRAME_TIME) {
      this.currentTime -= FRAME_TIME;
      this.renderOffset.x -= FRAME_OFFSET;
      this.renderOffset2.x += FRAME_OFFSET2;
      if (this.renderOffset.x < 0) {
        this.renderOffset.x = this.image.width + this.renderOffset.x;
      }
      if (this.renderOffset2.x > this.image2.width) {
        this.renderOffset2.x = this.renderOffset2.x - this.image.width;
      }
    }
  }

  renderToTempCanvas(context, object, elapsedTime, clipping, center) {
    if (this.canvas.canvas.width !== context.canvas.width + 8 || this.canvas.canvas.height !== context.canvas.height + 8) {
      this.canvas.canvas.width = context.canvas.width + 8;
      this.canvas.canvas.height = context.canvas.height + 8;
    }

    this.ul = {
      x: Math.max(object.position.x, center.x - context.canvas.width / 2),
      y: Math.max(object.position.y, center.y - context.canvas.height / 2)
    };

    this.canvas.context.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);
    this.canvas.context.save();

    let imageOffset1 = {
      x: (this.renderOffset.x + this.ul.x) % this.image.width,
      y: (this.renderOffset.y + this.ul.y) % this.image.height,
    }
    let imageOffset2 = {
      x: (this.renderOffset2.x + this.ul.x) % this.image.width,
      y: (this.renderOffset2.y + this.ul.y) % this.image.height,
    }

    if (imageOffset1.x > 0) {
      let width = this.image.width - imageOffset1.x;
      let width2 = this.image2.width - imageOffset2.x;
      let height = this.image.height - imageOffset1.y;
      let height2 = this.image2.height - imageOffset2.y;
      // Draw width at full height
      this.canvas.context.drawImage(this.image, imageOffset1.x, imageOffset1.y, width, this.canvas.canvas.height,
        0, 0, width, this.canvas.canvas.height);
      this.canvas.context.drawImage(this.image, 0, imageOffset1.y, this.canvas.canvas.width - width, this.canvas.canvas.height,
        width, 0, this.canvas.canvas.width - width, this.canvas.canvas.height);

      if (height < this.canvas.canvas.height) {
        // Draw at full width
        let nextHeight = this.canvas.canvas.height - height;
        this.canvas.context.drawImage(this.image, imageOffset1.x, 0, width, nextHeight,
          0, height, width, nextHeight);
        this.canvas.context.drawImage(this.image, 0, 0, this.canvas.canvas.width - width, nextHeight,
          width, height, this.canvas.canvas.width - width, nextHeight);
      }


      // this.canvas.context.drawImage(this.image2, imageOffset2.x, imageOffset2.y, width2, this.canvas.canvas.height,
      //   0, 0, width2, this.canvas.canvas.height - 1);
      // this.canvas.context.drawImage(this.image2, 0, imageOffset2.y, this.canvas.canvas.width - width2, this.canvas.canvas.height,
      //   width2, 0, this.canvas.canvas.width - width2, this.canvas.canvas.height);
    } else {
      this.canvas.context.drawImage(this.image, imageOffset1.x, imageOffset1.y, this.canvas.canvas.width, this.canvas.canvas.height,
        0, 0, this.canvas.canvas.width, this.canvas.canvas.height);

      this.canvas.context.drawImage(this.image2, imageOffset1.x, imageOffset1.y, this.canvas.canvas.width, this.canvas.canvas.height,
        0, 0, this.canvas.canvas.width, this.canvas.canvas.height);
    }

    // TODO: could avoid making gradient if it's not in view
    var radGrd = this.canvas.context.createRadialGradient(object.shadowCenter.x - this.ul.x, object.shadowCenter.y - this.ul.y,
      Math.max(0, object.shadowRadius - 250), object.shadowCenter.x - this.ul.x, object.shadowCenter.y - this.ul.y, object.shadowRadius);
    radGrd.addColorStop(  0, "rgba( 0, 0, 0,  1 )" );
    //radGrd.addColorStop( .8, "rgba( 0, 0, 0, .1 )" );
    radGrd.addColorStop(  1, "rgba( 0, 0, 0,  0 )" );
    this.canvas.context.globalCompositeOperation = "destination-out";
    this.canvas.context.fillStyle = radGrd;
    this.canvas.context.fillRect(object.shadowCenter.x - this.ul.x - object.shadowRadius,
      object.shadowCenter.y - this.ul.y - object.shadowRadius,
      object.shadowRadius * 2, object.shadowRadius * 2);

    //this.canvas.context.globalCompositeOperation = "source-over";
    this.canvas.context.restore();
  }

  // Since the shadow covers the whole map, get just the part that covers the current field of view
  render(context, object, elapsedTime, clipping, center) {
    if (!this.image.complete) return;

    // let ul = {
    //   x: center.x - context.canvas.width / 2,
    //   y: center.y - context.canvas.height / 2
    // };
    if (clipping) {
      if (clipping.offset.y === 0) {
        this.renderToTempCanvas(context, object, elapsedTime, clipping, center);
      }
      clipping.offset.y = clipping.offset.y - (this.ul.y - object.position.y);

      // TRICKY: subtract 1 since clipping adds 1 to height by default to avoid artifacts on most other images
      let height = Math.min(clipping.dimensions.height, this.canvas.canvas.height - clipping.offset.y) - 1;
      context.drawImage(this.canvas.canvas, clipping.offset.x, clipping.offset.y, this.canvas.canvas.width, height,
        this.ul.x + clipping.offset.x, this.ul.y + clipping.offset.y, this.canvas.canvas.width, height);
    } else {
      this.renderToTempCanvas(context, object, elapsedTime, clipping, center);
      context.drawImage(this.canvas.canvas, 0, 0, this.canvas.canvas.width, this.canvas.canvas.height,
        this.ul.x, this.ul.y, context.canvas.width, context.canvas.height);
    }
  }
}
