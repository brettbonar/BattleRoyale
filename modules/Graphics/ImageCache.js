Graphics.ImageCache = (function () {
  class ImageCache {
    constructor() {
      this.images = {};
    }

    put(key, src) {
      if (!this.images[key]) {
        let deferred = Q.defer();
        this.images[key] = new Image();
        this.images[key].src = src;
        this.images[key].onload = () => deferred.resolve();
        return deferred.promise;
      }
    }

    get(key) {
      return this.images[key];
    }
  }

  return new ImageCache();
})();
