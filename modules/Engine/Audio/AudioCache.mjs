class _AudioCache {
  constructor() {
    this.loops = [];
  }

  play(source) {
    let audio = new Audio(source);
    audio.play();
    return audio;
  }

  loop(source) {
    let audio = new Audio(source);
    audio.loop = true;
    audio.play();
    this.loops.push(audio);
    return audio;
  }

  clear() {
    for (const audio of this.loops) {
      audio.pause();
      audio.currentTime = 0;
    }
  }
}

const AudioCache = new _AudioCache();

export default AudioCache;
