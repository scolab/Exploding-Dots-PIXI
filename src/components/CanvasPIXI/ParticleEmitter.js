import particles from 'pixi-particles';

export class ParticleEmitter {
  constructor(container, texture, params) {
        // console.log(container, texture, params, this.emitter);
    this.texture = texture;
    this.params = params;
    this.emitter = new PIXI.particles.Emitter(
            container,
            texture,
            params
        );
    this.emitter.addAtBack = true;
  }

  start() {
    this.elapsed = Date.now();
        // Start emitting
    this.emitter.emit = true;
        // Start the update
    this.update();
  }

  update() {
        // Update the next frame
    if (this.emitter && this.emitter.emit) {
      requestAnimationFrame(this.update.bind(this));
      const now = Date.now();
            // The emitter requires the elapsed
            // number of seconds since the last update
      this.emitter.update((now - this.elapsed) * 0.001);
      this.elapsed = now;
    }
  }

  stop() {
    this.emitter.emit = false;
    this.emitter.cleanup();
  }

  updateOwnerPos(x, y) {
    this.emitter.updateOwnerPos(x, y);
  }

  destroy() {
    this.emitter.emit = false;
    this.emitter.destroy();
    this.emitter = null;
        // emitter.plugins.sprite.sprites.length = 0;
  }

}
