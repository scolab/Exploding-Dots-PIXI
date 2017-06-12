// @flow
import { PowerZone } from '../components/CanvasPIXI/PowerZone';

export default class ZoneUnderCursorVO {
  actualZone: PowerZone | null;
  droppedOnPowerZone: PowerZone;
  droppedOnPowerZoneIndex: number;
}
