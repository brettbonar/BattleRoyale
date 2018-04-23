import ImageCache from "../Engine/Rendering/ImageCache.mjs"

const MINIMAP_MARGIN = 25;
const EVENTS_TIMEOUT = 5000;
const MAX_EVENTS = 5;

export default class BattleRoyaleInterface {
  constructor(params) {
    this.overlay = $("#game-overlay");
    this.eventsList = $("#events-list");
    this.events = [];

    this.players = params.players;
    this.ui = ImageCache.get("/Assets/UI/png/bars.png");
    this.mapBackground = ImageCache.get("/Assets/UI/png/map.png");
    this.mapCompass = ImageCache.get("/Assets/UI/png/compass.png");
    this.showFullMap = false;
    this.minimapSize = 100;
  }

  drawMinimap(context, player, maps) {
    context.save();

    context.beginPath();
    context.arc(context.canvas.width - (this.minimapSize + MINIMAP_MARGIN), this.minimapSize + MINIMAP_MARGIN, this.minimapSize + 5, 0, 2 * Math.PI);
    context.closePath();

    context.fillStyle = "grey";
    context.fill();
    context.strokeStyle = "grey";
    context.stroke();

    context.beginPath();
    context.arc(context.canvas.width - (this.minimapSize + MINIMAP_MARGIN), this.minimapSize + MINIMAP_MARGIN , this.minimapSize, 0, 2 * Math.PI);
    context.clip();

    let dimensions = {
      width: this.minimapSize * 2 * (context.canvas.width / context.canvas.height),
      height: this.minimapSize * 2
    };

    let location = {
      position: {
        x: context.canvas.width - (MINIMAP_MARGIN + this.minimapSize) - (dimensions.width / 2),
        y: MINIMAP_MARGIN
      },
      dimensions: dimensions
    };
    maps[player.level].renderMinimap(context, location, player.center, {
      width: context.canvas.width * 2,
      height: context.canvas.height * 2
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
    maps[player.level].renderMinimap(context, location);
    context.drawImage(this.mapCompass, position.x, position.y,
      this.mapCompass.width, this.mapCompass.height);
  }

  getPlayerName(playerId) {
    let player = _.find(this.players, { playerId: playerId });
    return player && player.playerName;
  }

  getEvent(event) {
    if (event.eventType === "kill") {
      let killedBy = this.getPlayerName(event.killedByPlayer);
      if (killedBy) {
        return killedBy + " killed " + this.getPlayerName(event.killed);
      } else {
        return this.getPlayerName(event.killed) + " died";
      }
    } else if (event.eventType === "playerAvatarChange") {
      return this.getPlayerName(event.playerId) + " changed into " + event.type;
    } else if (event.eventType === "disconnect") {
      return this.getPlayerName(event.playerId) + " disconnected";
    }
    return event.eventType;
  }

  addEvent(event) {
    clearTimeout(this.eventsTimeout);

    this.events.push(event);
    this.eventsList.show();
    this.eventsList.empty();
    let visibleEvents = _.takeRight(this.events, MAX_EVENTS);
    for (const event of visibleEvents) {
      let item = $("<li>" + this.getEvent(event) + "</li>").addClass(event.eventType);
      this.eventsList.append(item);
    }

    this.eventsTimeout = setTimeout(() => {
      this.eventsList.hide();
      this.events.length = 0;
    }, EVENTS_TIMEOUT);
  }

  render(context, player, maps) {
    this.drawMinimap(context, player, maps);
    if (this.showFullMap) {
      this.drawFullMap(context, player, maps);
    }
  }
}
