import {DotVO} from '../../VO/DotVO';
import Texture = PIXI.Texture;
import {PowerZoneManager} from "./PowerZoneManager";
import Point = PIXI.Point;
import { ParticleEmitter } from './ParticleEmitter';
import Victor from 'victor';
import Sprite = PIXI.Sprite;
import AnimatedSprite = PIXI.extras.AnimatedSprite;
import {randomFromTo} from "../../utils/MathUtils";

export class DotSprite extends PIXI.Container{
  public dot: DotVO;
  public normalDot:Sprite;
  public overloadDot:AnimatedSprite;
  public movingDot:AnimatedSprite;
  public world: PowerZoneManager;
  public origin: Point;
  public data: PIXI.interaction. InteractionData;
  public dragging: boolean;
  public particleEmitter: ParticleEmitter;
  public originInMovingContainer: Point;
  public vPosition: Victor;
  public velocity: Victor;
  public acceleration: Victor;

  constructor(dotTexture: Texture, overloadtextures: Texture[], movingTexture?: Texture[]) {
    super();
    this.normalDot = new Sprite(dotTexture);
    this.normalDot.anchor.set(0.5);
    this.overloadDot = new AnimatedSprite(overloadtextures);
    this.overloadDot.anchor.set(0.5);
    this.overloadDot.animationSpeed = 0.4;
    /*this.movingDot = new AnimatedSprite(movingTexture);
    this.movingDot.anchor.set(0.5);
    this.movingDot.animationSpeed = 0.4;*/
    this.addChild(this.normalDot);
  }

  public playOverload():void{
    this.overloadDot.gotoAndPlay(randomFromTo(0, this.overloadDot.totalFrames - 1));
    this.addChild(this.overloadDot);
    this.removeChild(this.normalDot);
  }

  public returnToNormal():void{
    this.addChild(this.normalDot);
    this.removeChild(this.overloadDot);
    this.overloadDot.stop();
    this.removeChild(this.movingDot);
    //this.movingDot.stop();
  }
}
