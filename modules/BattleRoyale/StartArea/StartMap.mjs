import GameObject from "../../Engine/GameObject/GameObject.mjs"
import StartMapRenderer from "./StartMapRenderer.mjs";

export default class StartMap extends GameObject {
  constructor(params, map) {
    super(params);
    this.type = "StartMap";
    this.map = map;
    this.elapsedTime = 0;
    this.portalDuration = params.portalDuration;
    this.portalCreationDuration = params.portalCreationDuration;


    if (!params.simulation) {
      this.renderer = new StartMapRenderer(map, params.mapDimensions);
    }
  }

  getUpdateState() {
    return Object.assign(super.getUpdateState(), {
      mapLevel: this.mapLevel,
      mapDimensions: this.mapDimensions
    });
  }

  update(elapsedTime) {
    
  }
}
