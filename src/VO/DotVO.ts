import {DotSprite} from '../components/CanvasPIXI/DotSprite';
import Point = PIXI.Point;

export class DotVO {
  public id: string;
  public x: number;
  public y: number;
  public zoneId: number;
  public isPositive: boolean;
  public color: string;
  public sprite: DotSprite;
  public powerZone: number;
  public actionType: string;
  public dropPosition: Point;
}
