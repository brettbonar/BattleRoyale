import GameObject from "../../Engine/GameObject/GameObject.mjs"
import StartMapRenderer from "./StartMapRenderer.mjs";

export default class StartMap extends GameObject {
  constructor(params) {
    super(params);
    this.map = params.map;
    this.renderer = new StartMapRenderer(params.map);
    this.elapsedTime = 0;
    this.portalDuration = params.portalDuration;
    this.portalCreationDuration = params.portalCreationDuration;
  }

  update(elapsedTime) {
    
  }
}
