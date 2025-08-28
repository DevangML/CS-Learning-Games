// Simple Lab Engine (DOM + RAF based)
;(function () {
  class LabEngine {
    constructor() {
      this.root = null;
      this.scene = null;
      this.last = 0;
      this.rafId = null;
    }

    mount(root) {
      this.root = root;
    }

    async loadScene(scene) {
      if (this.scene && typeof this.scene.destroy === 'function') {
        this.scene.destroy();
      }
      this.scene = scene;
      if (this.root) {
        this.root.innerHTML = '';
      }
      await scene.init(this.root);
      this.start();
    }

    start() {
      this.last = performance.now();
      const tick = (t) => {
        const dt = Math.min(0.05, (t - this.last) / 1000);
        this.last = t;
        if (this.scene && typeof this.scene.update === 'function') {
          this.scene.update(dt);
        }
        this.rafId = requestAnimationFrame(tick);
      };
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = requestAnimationFrame(tick);
    }

    stop() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  window.LabEngine = new LabEngine();
})();

