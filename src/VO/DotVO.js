// @flow

import { PowerZone } from '../components/CanvasPIXI/PowerZone';

export default class DotVO {
  id: string;
  x: number;
  y: number;
  zoneId: number;
  isPositive: boolean;
  color: string;
  sprite: window.PIXI.AnimatedSprite;
  powerZone: number;
}
