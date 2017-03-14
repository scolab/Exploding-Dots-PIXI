import {OPERATOR_MODE, BASE} from '../../Constants'
import {PowerZone} from  './Canvas.PIXI.PowerZone';

export class PowerZoneManager{
    constructor(){
        this.zoneCreated = 0;
        this.positiveValueText = [];
        this.negativeValueText = [];
        this.divisionValueText = [];
        this.divisionNegativeValueText = [];
        this.proximityManagerPositive = [];
        this.proximityManagerNegative = [];
    }

    createZone(position, textures, base, negativePresent, usage_mode, operator_mode, totalZoneCount){
        let powerZone = new PowerZone(position,
            textures,
            base,
            negativePresent,
            usage_mode,
            operator_mode,
            totalZoneCount,
            this.zoneCreated
        );
        this.positiveValueText.push(powerZone.dotsCounterText);
        this.proximityManagerPositive.push(powerZone.positiveProximityManager);
        if (operator_mode === OPERATOR_MODE.DIVIDE) {
            this.divisionValueText.push(powerZone.dividerValueText);
        }

        if(negativePresent) {
            this.negativeValueText.push(powerZone.negativeDotsCounterText);
            this.proximityManagerNegative.push(powerZone.negativeProximityManager);
            if (operator_mode === OPERATOR_MODE.DIVIDE && base[1] === BASE.BASE_X) {
                this.divisionNegativeValueText.push(powerZone.dividerNegativeValueText);
            }
        }

        this.zoneCreated++;
        return powerZone;
    }

}
