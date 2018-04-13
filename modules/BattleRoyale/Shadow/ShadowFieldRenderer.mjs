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
    this.image = ImageCache.get("/Assets/shadow_fog.png");
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

  renderToTempCanvas(context, object, elapsedTime, clipping, ul) {
    this.canvas.canvas.width = context.canvas.width;
    this.canvas.canvas.height = context.canvas.height;

    this.canvas.context.save();

    // context.save();
    // context.beginPath();
    // //context.rect(object.position.x + object.dimensions.width, object.position.y, -object.dimensions.width, object.dimensions.height);
    // var radGrd = context.createRadialGradient(500, 500, 250, 500, 500, 500);
    // radGrd.addColorStop(0, "rgba( 0, 0, 0,  0 )");
    // radGrd.addColorStop(1, "rgba( 0, 0, 0,  1 )");
    // context.strokeStyle = radGrd;
    // //context.arc(500, 500, 500, 0, 2 * Math.PI);
    // //context.fill();
    // //context.fillRect(250, 250, 500, 500);
    // //context.stroke();
    // context.clip();

    let imageOffset1 = {
      x: (this.renderOffset.x + ul.x) % object.dimensions.width,
      y: (this.renderOffset.y + ul.y) % object.dimensions.height,
    }
    let imageOffset2 = {
      x: (this.renderOffset2.x + ul.x) % object.dimensions.width,
      y: (this.renderOffset2.y + ul.y) % object.dimensions.height,
    }

    if (imageOffset1.x > 0) {
      let width = this.image.width - imageOffset1.x;
      let width2 = this.image2.width - imageOffset2.x;
      this.canvas.context.drawImage(this.image, imageOffset1.x, imageOffset1.y, width, object.dimensions.height,
        0, 0, width, object.dimensions.height);
      this.canvas.context.drawImage(this.image, 0, imageOffset1.y, object.dimensions.width - width, object.dimensions.height,
        width, 0, object.dimensions.width - width, object.dimensions.height);

      this.canvas.context.drawImage(this.image2, imageOffset2.x, imageOffset2.y, width2, object.dimensions.height,
        0, 0, width2, object.dimensions.height - 1);
      this.canvas.context.drawImage(this.image2, 0, imageOffset2.y, object.dimensions.width - width2, object.dimensions.height,
        width2, 0, object.dimensions.width - width2, object.dimensions.height);
    } else {
      this.canvas.context.drawImage(this.image, imageOffset1.x, imageOffset1.y, object.dimensions.width, object.dimensions.height,
        0, 0, object.dimensions.width, object.dimensions.height);

      this.canvas.context.drawImage(this.image2, imageOffset1.x, imageOffset1.y, object.dimensions.width, object.dimensions.height,
        0, 0, object.dimensions.width, object.dimensions.height);
    }

    // TODO: could avoid making gradient if it's not in view
    var radGrd = this.canvas.context.createRadialGradient(object.shadowCenter.x - ul.x, object.shadowCenter.y - ul.y,
      Math.max(0, object.shadowRadius - 250), object.shadowCenter.x - ul.x, object.shadowCenter.y - ul.y, object.shadowRadius);
    radGrd.addColorStop(  0, "rgba( 0, 0, 0,  1 )" );
    radGrd.addColorStop( .8, "rgba( 0, 0, 0, .1 )" );
    radGrd.addColorStop(  1, "rgba( 0, 0, 0,  0 )" );

    this.canvas.context.globalCompositeOperation = "destination-out";
    this.canvas.context.fillStyle = radGrd;
    this.canvas.context.fillRect(object.shadowCenter.x - ul.x - object.shadowRadius,
      object.shadowCenter.y - ul.y - object.shadowRadius,
      object.shadowRadius * 2, object.shadowRadius * 2);

    // var radGrd = context.createRadialGradient(500, 500, 250, 500, 500, 500);
    // radGrd.addColorStop(0, "rgba( 0, 0, 0,  0 )");
    // radGrd.addColorStop(1, "rgba( 0, 0, 0,  1 )");


    this.canvas.context.restore();
  }

  // Since the shadow covers the whole map, get just the part that covers the current field of view
  render(context, object, elapsedTime, clipping, center) {
    if (!this.image.complete) return;

    let ul = {
      x: Math.max(object.position.x, center.x - context.canvas.width / 2),
      y: Math.max(object.position.y, center.y - context.canvas.height / 2)
    };
    if (clipping.offset.y === 0) {
      this.renderToTempCanvas(context, object, elapsedTime, clipping, ul);
    }
    clipping.offset.y -= (ul.y - object.position.y);

    // TRICKY: subtract 1 since clipping adds 1 to height by default to avoid artifacts on most other images
    context.drawImage(this.canvas.canvas, clipping.offset.x, clipping.offset.y, clipping.dimensions.width, clipping.dimensions.height - 1,
      ul.x + clipping.offset.x, ul.y + clipping.offset.y, clipping.dimensions.width, clipping.dimensions.height - 1);
  }
}
