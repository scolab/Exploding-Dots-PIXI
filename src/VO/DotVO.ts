
import {DotSprite} from '../components/CanvasPIXI/DotSprite';
import {ISPRITE_COLOR} from "../Constants";
import {PowerZone} from "../components/CanvasPIXI/PowerZone";
export class DotVO {
  public id: string;
  public x: number;
  public y: number;
  public zoneId: number;
  public isPositive: boolean;
  public color: string;
  public sprite: DotSprite;
  public powerZone: number;
}
