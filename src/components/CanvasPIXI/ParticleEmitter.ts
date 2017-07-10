import { Emitter } from 'pixi-particles';

export class ParticleEmitter {

  private params: object;
  private emitter: Emitter;
  private elapsed: number;
  private ticker: PIXI.ticker.Ticker;
  private bindUpdateFunction: (deltaTime: number) => void;

  constructor(container, texture, params) {
    // console.log(container, texture, params, this.emitter);
    this.params = params;
    this.emitter = new Emitter(
            container,
            texture,
            params,
        );
    this.emitter.addAtBack = true;
    this.ticker = new PIXI.ticker.Ticker();
    this.ticker.stop();
    this.bindUpdateFunction = this.update.bind(this);
  }

  public start() {
    this.elapsed = Date.now();
    // Start emitting
    this.emitter.emit = true;
    // Start the update
    this.ticker.add(this.bindUpdateFunction);
    this.ticker.start();
  }

  public stop() {
    this.emitter.emit = false;
    this.emitter.cleanup();
    this.ticker.remove(this.bindUpdateFunction);
  }

  public updateOwnerPos(x, y) {
    this.emitter.updateOwnerPos(x, y);
  }

  public resetPositionTracking(): void {
    this.emitter.resetPositionTracking();
  }

  public destroy() {
    this.emitter.emit = false;
    this.emitter.destroy();
  }

  private update(deltaTime: number) {
    // Update the next frame
    if (this.emitter && this.emitter.emit) {
      // The emitter requires the elapsed
      // number of seconds since the last update
      this.emitter.update(deltaTime * 0.015);
    }else {
      this.ticker.stop();
    }
  }

}
