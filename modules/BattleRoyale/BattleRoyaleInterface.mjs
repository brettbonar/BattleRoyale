import ImageCache from "../Engine/Rendering/ImageCache.mjs"

const MINIMAP_MARGIN = 25;

export default class BattleRoyaleInterface {
  constructor() {
    this.ui = ImageCache.get("/Assets/UI/png/bars.png");
    this.mapBackground = ImageCache.get("/Assets/UI/png/map.png");
    this.mapCompass = ImageCache.get("/Assets/UI/png/compass.png");
    this.showFullMap = false;
    this.minimapSize = 100;
  }

  drawMinimap(context, player, maps) {
    context.save();

    context.beginPath();
    context.arc(context.canvas.width - (this.minimapSize + MINIMAP_MARGIN), this.minimapSize + MINIMAP_MARGIN, this.minimapSize, 0, 2 * Math.PI);
    context.closePath();

    context.fillStyle = "grey";
    context.fill();
    context.strokeStyle = "grey";
    context.stroke();

    context.clip();

    let location = {
      position: {
        x: context.canvas.width - (this.minimapSize * 2 + MINIMAP_MARGIN),
        y: MINIMAP_MARGIN
      },
      dimensions: {
        width: this.minimapSize * 2,
        height: this.minimapSize * 2
      }
    };
    maps[player.level].renderMinimap(context, player.center, location, {
      width: context.canvas.width * 3,
      height: context.canvas.width * 3
    });
    
    context.beginPath();
    context.arc(context.canvas.width - (this.minimapSize + MINIMAP_MARGIN), this.minimapSize + MINIMAP_MARGIN, 5, 0, 2 * Math.PI);
    context.closePath();
    context.fillStyle = "red";
    context.fill();
    context.strokeStyle = "red";
    context.stroke();

    context.restore();
  }

  drawFullMap(context, player, maps) {
    let position = {
      x: context.canvas.width / 2 - this.mapBackground.width / 2,
      y: context.canvas.height / 2 - this.mapBackground.height / 2
    };
    let location = {
      position: {
        x: position.x + 219,
        y: position.y + 148
      },
      dimensions: {
        width: 1189,
        height: 868
      }
    };
    
    context.drawImage(this.mapBackground, position.x, position.y,
      this.mapBackground.width, this.mapBackground.height);
    maps[player.level].renderMinimap(context, { x: 0, y: 0 }, location);
    context.drawImage(this.mapCompass, position.x, position.y,
      this.mapCompass.width, this.mapCompass.height);
  }

  render(context, player, maps) {
    this.drawMinimap(context, player, maps);
    if (this.showFullMap) {
      this.drawFullMap(context, player, maps);
    }
  }
}
