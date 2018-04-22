class _AudioCache {
  constructor() {
    this.audio = {};
  }

  put(source) {
    if (!this.audio[source]) {
      this.audio[source] = new Audio(source);
    }
  }

  get(source) {
    if (this.audio[source]) {
      return this.audio[source];
    }
    let audio = new Audio(source);
    this.audio[source] = audio;
    return audio;
  }
  
  play(source) {
    if (this.audio[source]) {
      return this.audio[source].play();
    }
    let audio = new Audio(source);
    this.audio[source] = audio;
    return audio.play();
  }
}

const AudioCache = new _AudioCache();

export default AudioCache;
