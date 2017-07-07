import {DotVO} from '../../VO/DotVO';
import Texture = PIXI.Texture;
import {PowerZoneManager} from "./PowerZoneManager";
import Point = PIXI.Point;
import { ParticleEmitter } from './ParticleEmitter';
import Victor from 'victor';
import Sprite = PIXI.Sprite;
import AnimatedSprite = PIXI.extras.AnimatedSprite;
import {randomFromTo} from "../../utils/MathUtils";
import {DotsContainer} from "./DotsContainer";

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
  private normalDot: Sprite;
  private overloadDot: AnimatedSprite;
  private outDot: AnimatedSprite;
  private rippleDot: AnimatedSprite;
  private wrongDot: AnimatedSprite;
  private implodeDot: AnimatedSprite;
  private wiggleDot: AnimatedSprite;
  private shouldPlayOverload: boolean = false;

  constructor(dotTexture: Texture,
              overloadTextures: Texture[],
              dripTexture: Texture[],
              wrongTexture: Texture[],
              implodeTexture: Texture[],
              outTexture: Texture[],
              wiggleTexture: Texture[],
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

    this.wrongDot = new AnimatedSprite(wrongTexture);
    this.wrongDot.anchor.set(0.5);
    this.wrongDot.animationSpeed = 0.3;
    this.wrongDot.loop = false;

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

    this.addChild(this.normalDot);
  }

  public playOverload(): void {
    if (this.getChildAt(0) !== this.rippleDot) {
      while (this.children.length > 0) {
        this.removeChildAt(0);
      }
      this.overloadDot.gotoAndPlay(randomFromTo(0, this.overloadDot.totalFrames - 1));
      this.addChild(this.overloadDot);
      this.shouldPlayOverload = false;
    }else {
      this.shouldPlayOverload = true;
    }
  }

  public playDrip(): void{
    while (this.children.length > 0) {
      this.removeChildAt(0);
    }
    this.addChild(this.rippleDot);
    this.rippleDot.onComplete = this.stopDrip.bind(this);
    this.rippleDot.play();
  }

  private stopDrip(): void{
    this.rippleDot.gotoAndStop(0);
    let doPlayOverload: boolean = this.shouldPlayOverload;
    this.returnToNormal(true);
    if (doPlayOverload) {
      this.playOverload();
    }
  }

  public playWrong(callback:(DotSprite, DotContainer) => void, container:DotsContainer):void{
    while(this.children.length > 0){
      this.removeChildAt(0);
    }
    this.addChild(this.wrongDot);
    this.wrongDot.onComplete = () => {
      callback.call(this, this, container)
    };
    this.wrongDot.play();
  }

  public stopWrong():void{
    this.wrongDot.gotoAndStop(0);
    this.returnToNormal();
  }

  public playMoving():void{
    /*while(this.children.length > 0){
      this.removeChildAt(0);
    }
    this.addChild(this.movingDot);
    this.movingDot.play();*/
  }

  public stopMoving():void{
    /*this.movingDot.gotoAndStop(0);
    this.returnToNormal();*/
  }

  public returnToNormal(force?:boolean):void{
    if(this.getChildAt(0) !== this.rippleDot || force) {
      while (this.children.length > 0) {
        if (this.getChildAt(0))
          if ((<AnimatedSprite>this.getChildAt(0)).gotoAndStop) {
            (this.getChildAt(0) as AnimatedSprite).gotoAndStop(0);
          }
        this.removeChildAt(0);
      }
      this.addChild(this.normalDot);
      this.shouldPlayOverload = false;
    }
  }
}
