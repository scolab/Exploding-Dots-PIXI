import { Emitter } from 'pixi-particles';

export class ParticleEmitter {

  private params: object;
  private emitter: Emitter;
  private elapsed: number;

  constructor(container, texture, params) {
    // console.log(container, texture, params, this.emitter);
    this.params = params;
    this.emitter = new Emitter(
            container,
            texture,
            params,
        );
    this.emitter.addAtBack = true;
  }

  public start() {
    this.elapsed = Date.now();
        // Start emitting
    this.emitter.emit = true;
        // Start the update
    this.update();
  }

  public stop() {
    this.emitter.emit = false;
    this.emitter.cleanup();
  }

  public updateOwnerPos(x, y) {
    this.emitter.updateOwnerPos(x, y);
  }

  public destroy() {
    this.emitter.emit = false;
    this.emitter.destroy();
  }

  private update() {
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
}
