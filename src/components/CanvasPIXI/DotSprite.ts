import {DotVO} from '../../VO/DotVO';
import Texture = PIXI.Texture;
import {PowerZoneManager} from "./PowerZoneManager";
import Point = PIXI.Point;
import { ParticleEmitter } from './ParticleEmitter';

export class DotSprite extends PIXI.extras.AnimatedSprite{
  public dot: DotVO;
  public world: PowerZoneManager;
  public origin: Point;
  public data: PIXI.interaction. InteractionData;
  public dragging: boolean;
  public particleEmitter: ParticleEmitter;
  public originInMovingContainer: Point;

  constructor(textures: Texture[]) {
    super(textures);
  }
}
