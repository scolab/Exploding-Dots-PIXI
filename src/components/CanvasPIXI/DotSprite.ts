import {DotVO} from '../../VO/DotVO';
import Texture = PIXI.Texture;
import {PowerZoneManager} from './PowerZoneManager';
import Point = PIXI.Point;
import { ParticleEmitter } from './ParticleEmitter';
import Victor from 'victor';
import Sprite = PIXI.Sprite;
import AnimatedSprite = PIXI.extras.AnimatedSprite;
import {randomFromTo} from '../../utils/MathUtils';

export class DotSprite extends PIXI.Container {

  public world: PowerZoneManager;
  public origin: Point;
  public data: PIXI.interaction.InteractionData;
  public dragging: boolean;
  public particleEmitter: ParticleEmitter;
  public originInMovingContainer: Point;
  public vPosition: Victor;
  public velocity: Victor;
  public acceleration: Victor;
  public dot: DotVO;
  public ghost: DotSprite | null;
  public shakingDotForAnnihilation: DotSprite | null = null;

  private normalDot: Sprite;
  private overloadDot: AnimatedSprite;
  private outDot: AnimatedSprite;
  private rippleDot: AnimatedSprite;
  // private wrongDot: AnimatedSprite;
  private implodeDot: AnimatedSprite;
  private wiggleDot: AnimatedSprite;
  private wiggleDotUnstable: AnimatedSprite;
  private shouldPlayOverload: boolean = false;

  constructor(dotTexture: Texture,
              overloadTextures: Texture[],
              dripTexture: Texture[],
              implodeTexture: Texture[],
              outTexture: Texture[],
              wiggleTexture: Texture[],
              wiggleUnstableTexture: Texture[],
  ) {
    super();
    this.normalDot = new Sprite(dotTexture);
    this.normalDot.anchor.set(0.5);

    this.overloadDot = new AnimatedSprite(overloadTextures);
    this.overloadDot.anchor.set(0.5);
    this.overloadDot.animationSpeed = 0.4;

    this.rippleDot = new AnimatedSprite(dripTexture);
    this.rippleDot.anchor.set(0.5);
    this.rippleDot.animationSpeed = 0.4;
    this.rippleDot.loop = false;

    /*this.wrongDot = new AnimatedSprite(wrongTexture);
    this.wrongDot.anchor.set(0.5);
    this.wrongDot.animationSpeed = 0.3;
    this.wrongDot.loop = false;*/

    this.outDot = new AnimatedSprite(outTexture);
    this.outDot.anchor.set(0.5);
    this.outDot.animationSpeed = 0.5;
    this.outDot.loop = false;

    this.implodeDot = new AnimatedSprite(implodeTexture);
    this.implodeDot.anchor.set(0.5);
    this.implodeDot.animationSpeed = 0.5;
    this.implodeDot.loop = false;

    this.wiggleDot = new AnimatedSprite(wiggleTexture);
    this.wiggleDot.anchor.set(0.5);
    this.wiggleDot.animationSpeed = 0.5;
    this.wiggleDot.loop = true;

    this.wiggleDotUnstable = new AnimatedSprite(wiggleUnstableTexture);
    this.wiggleDotUnstable.anchor.set(0.5);
    this.wiggleDotUnstable.animationSpeed = 0.5;
    this.wiggleDotUnstable.loop = true;

    this.addChild(this.normalDot);
  }

  public playOverload(): void {
    const wasAlreadyOverload: boolean = this.getChildAt(0) === this.overloadDot;
    if (this.getChildAt(0) !== this.rippleDot && wasAlreadyOverload === false) {
      while (this.children.length > 0) {
        this.removeChildAt(0);
      }
      if (wasAlreadyOverload === false) {
        this.overloadDot.gotoAndPlay(randomFromTo(0, this.overloadDot.totalFrames - 1));
        this.addChild(this.overloadDot);
        this.shouldPlayOverload = false;
      }
    }else if (this.getChildAt(0) === this.rippleDot) {
      this.shouldPlayOverload = true;
    }
  }

  /*public playWrong(callback: (DotSprite: DotSprite, DotContainer: DotsContainer) => void,
                   container: DotsContainer): void {
    while (this.children.length > 0) {
      this.removeChildAt(0);
    }
    this.addChild(this.wrongDot);
    this.wrongDot.onComplete = () => {
      callback.call(this, this, container);
    };
    this.wrongDot.play();
  }

  public stopWrong(): void {
    this.wrongDot.gotoAndStop(0);
    this.returnToNormal();
  }*/

  /*public playOut(
    callback: (removeOutDotAfterAnim: number, DotSprite: DotSprite) => any,
    removeOutDotAfterAnim: number): void {
    while (this.children.length > 0) {
     this.removeChildAt(0);
    }
    this.addChild(this.outDot);
    this.outDot.onComplete =  () => {
      callback.call(this, removeOutDotAfterAnim, this);
    };
    this.outDot.play();
  }*/

  public playOut(callback?: (...args) => any,
                 removeOutDotAfterAnim?: number,
                 removedDot?: DotVO[]): void {
    while (this.children.length > 0) {
      this.removeChildAt(0);
    }
    this.addChild(this.outDot);
    if (callback) {
      if (removedDot) {
        this.outDot.onComplete = () => {
          callback.call(this, removeOutDotAfterAnim, removedDot, this);
        };
      }else {
        this.outDot.onComplete = () => {
          callback.call(this, removeOutDotAfterAnim, this);
        };
      }
    }
    this.outDot.play();
  }

  public stopOut(): void {
    this.outDot.gotoAndStop(0);
    this.returnToNormal();
  }

  public playImplode(): void {
    while (this.children.length > 0) {
      this.removeChildAt(0);
    }
    this.addChild(this.implodeDot);
    this.implodeDot.onComplete = this.stopImplode.bind(this);
    this.implodeDot.play();
  }

  public playDrip(): void {
    while (this.children.length > 0) {
      this.removeChildAt(0);
    }
    this.addChild(this.rippleDot);
    this.rippleDot.onComplete = this.stopDrip.bind(this);
    this.rippleDot.play();
  }

  public playWiggle(): void {
    while (this.children.length > 0) {
      this.removeChildAt(0);
    }
    this.addChild(this.wiggleDot);
    this.wiggleDot.onComplete = this.stopDrip.bind(this);
    this.wiggleDot.play();
  }

  public stopWiggle(): void {
    this.wiggleDot.gotoAndStop(0);
    this.returnToNormal();
  }

  public playWiggleInstability(): void {
    const wasAlreadyWiggleUnstable: boolean = this.getChildAt(0) === this.wiggleDotUnstable;
    while (this.children.length > 0) {
      if (wasAlreadyWiggleUnstable === false) {
        this.removeChildAt(0);
      }
    }
    if (wasAlreadyWiggleUnstable === false) {
      this.addChild(this.wiggleDotUnstable);
      this.wiggleDotUnstable.gotoAndPlay(randomFromTo(0, this.wiggleDotUnstable.totalFrames - 1));
    }
  }

  public returnToNormal(force?: boolean): void {
    if (this.getChildAt(0) !== this.rippleDot || force) {
      while (this.children.length > 0) {
        if (this.getChildAt(0)) {
          if ((<AnimatedSprite> this.getChildAt(0)).gotoAndStop) { // tslint:disable-line no-angle-bracket-type-assertion max-line-length
            (this.getChildAt(0) as AnimatedSprite).gotoAndStop(0);
          }
        }
        this.removeChildAt(0);
      }
      this.addChild(this.normalDot);
      this.shouldPlayOverload = false;
    }
  }

  private stopDrip(): void {
    this.rippleDot.gotoAndStop(0);
    const doPlayOverload: boolean = this.shouldPlayOverload;
    this.returnToNormal(true);
    if (doPlayOverload) {
      this.playOverload();
    }
  }

  private stopImplode(): void {
    this.implodeDot.gotoAndStop(0);
    this.returnToNormal();
  }
}
