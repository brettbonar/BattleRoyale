import GameObject from "../../Engine/GameObject/GameObject.mjs"
import SpawnMapRenderer from "./SpawnMapRenderer.mjs";

export default class SpawnMap extends GameObject {
  constructor(params, map) {
    super(params);
    this.type = "SpawnMap";
    this.map = map;
    this.elapsedTime = 0;
    this.portalDuration = params.portalDuration;
    this.portalCreationDuration = params.portalCreationDuration;


    if (!params.simulation) {
      this.renderer = new SpawnMapRenderer(map, params.mapDimensions);
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
