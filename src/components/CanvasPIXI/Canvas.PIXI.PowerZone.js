import {BASE, OPERATOR_MODE, USAGE_MODE, BOX_INFO} from '../../Constants'
import {ProximityManager} from '../../utils/ProximityManager';
import {EventEmitter} from 'eventemitter3';

export class PowerZone extends PIXI.Container{

    static divisionValueText = [];
    static divisionNegativeValueText = [];


    constructor(position, textures, base, negativePresent, usage_mode, operator_mode, totalZoneCount, zoneCreated) {
        super();
        //let container = new PIXI.Container();
        this.eventEmitter = new EventEmitter();
        this.dotsContainer = null;
        this.dotsContainerNegative = null;
        let boxYPos = 70;
        let gutterWidth = 23;
        let leftGutter = 66;
        let dotsCounter = new PIXI.Sprite(textures["dot_value.png"]);
        dotsCounter.anchor.x = 0.5;
        dotsCounter.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + (BOX_INFO.BOX_WIDTH / 2) + 3;
        dotsCounter.y = 0;
        this.addChild(dotsCounter);

        this.dotsCounterText = new PIXI.Text(position, {
            fontFamily: 'museo-slab',
            fontSize: 22,
            fill: 0x6D6D6D,
            align: 'center',
        });
        this.dotsCounterText.anchor.x = 0.5;
        this.dotsCounterText.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + (BOX_INFO.BOX_WIDTH / 2);
        this.dotsCounterText.y = 45;
        this.dotsCounterText.text = '';
        this.addChild(this.dotsCounterText);

        if (negativePresent) {
            let dotsCounterNegative = new PIXI.Sprite(textures["antidot_value.png"]);
            dotsCounterNegative.anchor.x = 0.5;
            dotsCounterNegative.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + (BOX_INFO.BOX_WIDTH / 2) + 5;
            dotsCounterNegative.y = BOX_INFO.BOX_HEIGHT + 20;
            this.addChild(dotsCounterNegative);

            this.negativeDotsCounterText = new PIXI.Text(position, {
                fontFamily: 'museo-slab',
                fontSize: 22,
                fill: 0xFFFFFF,
                align: 'center'
            });
            this.negativeDotsCounterText.anchor.x = 0.5;
            this.negativeDotsCounterText.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + (BOX_INFO.BOX_WIDTH / 2);
            this.negativeDotsCounterText.y = BOX_INFO.BOX_HEIGHT + 70;
            this.negativeDotsCounterText.text = '1';
            this.addChild(this.negativeDotsCounterText);
            //PowerZone.negativeValueText.push(this.negativeDotsCounterText);
        }

        let bgBox = new PIXI.Sprite(textures["box.png"]);
        bgBox.x = position * (BOX_INFO.BOX_WIDTH + gutterWidth);
        bgBox.y = boxYPos;
        this.addChild(bgBox);

        if (base[1] === 'x') {
            this.placeValueText = new PIXI.Text('X' + (zoneCreated), {
                fontFamily: 'museo-slab',
                fontSize: 40,
                fill: 0xBCBCBC,
                align: 'center'
            });
        } else {
            let text;
            if (base[0] === 1 || zoneCreated === 0) {
                text = String(Math.pow(base[1], zoneCreated));
            } else {
                text = '(' + String(Math.pow(base[1], zoneCreated) + '/' + Math.pow(base[0], zoneCreated)) + ')';
            }

            this.placeValueText = new PIXI.Text(text, {
                fontFamily: 'museo-slab',
                fontSize: 40,
                fill: 0xBCBCBC,
                align: 'center'
            });
            console.log('setValueText0', zoneCreated);
        }
        this.placeValueText.anchor.x = 0.5;
        this.placeValueText.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + (BOX_INFO.BOX_WIDTH / 2);
        this.placeValueText.y = boxYPos + (BOX_INFO.BOX_HEIGHT / 2) - 30;
        this.addChild(this.placeValueText);

        if (negativePresent) {
            let separator = new PIXI.Sprite(textures['separator.png']);
            separator.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + 5;
            separator.y = boxYPos + (BOX_INFO.BOX_HEIGHT / 2) - 5;
            this.addChild(separator);

            this.dotsContainer = new PIXI.Container();
            this.dotsContainer.x = position * (BOX_INFO.BOX_WIDTH + gutterWidth);
            this.dotsContainer.y = boxYPos;
            //CanvasPIXI.state.positivePowerZone.push(dotsContainerPositive);
            this.addChild(this.dotsContainer);
            this.dotsContainer.interactive = true;

            this.dotsContainer.hitArea = new PIXI.Rectangle(0, 0, BOX_INFO.BOX_WIDTH, BOX_INFO.BOX_HEIGHT);
            this.positiveProximityManager = new ProximityManager(100, this.dotsContainer.hitArea);
            this.dotsContainer.powerZone = totalZoneCount - position - 1;
            this.dotsContainer.isPositive = true;
            if (usage_mode === USAGE_MODE.FREEPLAY) {
                this.dotsContainer.buttonMode = true;
                //dotsContainer.on('pointerup', CanvasPIXI.createDot.bind(CanvasPIXI));
                this.dotsContainer.on('pointerup', (e) => {this.eventEmitter.emit('CreateDot', e)});
            }

            this.dotsContainerNegative = new PIXI.Container();
            this.dotsContainerNegative.x = position * (BOX_INFO.BOX_WIDTH + gutterWidth);
            this.dotsContainerNegative.y = boxYPos + BOX_INFO.BOX_HEIGHT;
            //CanvasPIXI.state.negativePowerZone.push(dotsContainerNegative);
            this.addChild(this.dotsContainerNegative);
            this.dotsContainerNegative.interactive = true;

            this.dotsContainerNegative.hitArea = new PIXI.Rectangle(-0, 0, BOX_INFO.BOX_WIDTH, BOX_INFO.BOX_HEIGHT);
            this.negativeProximityManager = new ProximityManager(100, this.dotsContainerNegative.hitArea);
            this.dotsContainerNegative.powerZone = totalZoneCount - position - 1;
            this.dotsContainerNegative.isPositive = false;
            if (usage_mode === USAGE_MODE.FREEPLAY) {
                this.dotsContainerNegative.buttonMode = true;
                //dotsContainerNegative.on('pointerup', CanvasPIXI.createDot.bind(CanvasPIXI));
                this.dotsContainerNegative.on('pointerup', (e) => {this.eventEmitter.emit('CreateDot', e)});
            }
        } else {
            this.dotsContainer = new PIXI.Container();
            this.dotsContainer.x = position * (BOX_INFO.BOX_WIDTH + gutterWidth);
            this.dotsContainer.y = boxYPos;
            //CanvasPIXI.state.positivePowerZone.push(dotsContainer);
            this.addChild(this.dotsContainer);
            this.dotsContainer.interactive = true;

            this.dotsContainer.hitArea = new PIXI.Rectangle(0, 0, BOX_INFO.BOX_WIDTH, BOX_INFO.BOX_HEIGHT);
            this.positiveProximityManager = new ProximityManager(100, this.dotsContainer.hitArea);
            //PowerZone.proximityManagerPositive.push(new ProximityManager(100, this.dotsContainer.hitArea));
            this.dotsContainer.powerZone = totalZoneCount - position - 1;
            this.dotsContainer.isPositive = true;
            if (usage_mode === USAGE_MODE.FREEPLAY) {
                this.dotsContainer.buttonMode = true;
                //eventEmitter.on('another-event', emitted, context);
                //dotsContainer.on('pointerup', CanvasPIXI.createDot.bind(CanvasPIXI));
                this.dotsContainer.on('pointerup', (e) => {this.eventEmitter.emit('CreateDot', e)});
            }
        }

        if (operator_mode === OPERATOR_MODE.DIVIDE) {
            let dividerCounter = new PIXI.Sprite(textures["dot_div_value.png"]);
            dividerCounter.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + BOX_INFO.BOX_WIDTH - dividerCounter.width;
            dividerCounter.y = boxYPos;
            this.addChild(dividerCounter);

            this.dividerValueText = new PIXI.Text('1', {
                fontFamily: 'museo-slab',
                fontSize: 16,
                fill: 0x565656,
                align: 'center'
            });
            this.dividerValueText.anchor.x = 0.5;
            this.dividerValueText.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + BOX_INFO.BOX_WIDTH - (dividerCounter.width / 2);
            this.dividerValueText.y = boxYPos + 3;
            this.addChild(this.dividerValueText);
            //PowerZone.divisionValueText.push(dividerValueText);

            if (operator_mode === OPERATOR_MODE.DIVIDE && base[1] === BASE.BASE_X) {
                let negativeDividerCounter = new PIXI.Sprite(textures["antidot_div_value.png"]);
                negativeDividerCounter.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth));
                negativeDividerCounter.y = BOX_INFO.BOX_HEIGHT + boxYPos - negativeDividerCounter.height - 10;
                this.addChild(negativeDividerCounter);

                this.dividerNegativeValueText = new PIXI.Text('1', {
                    fontFamily: 'museo-slab',
                    fontSize: 16,
                    fill: 0x565656,
                    align: 'center'
                });
                this.dividerNegativeValueText.anchor.x = 0.5;
                this.dividerNegativeValueText.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + 15;
                this.dividerNegativeValueText.y = negativeDividerCounter.y + 15;
                this.addChild(this.dividerNegativeValueText);
                //PowerZone.divisionNegativeValueText.push(dividerNegativeValueText);
            }
        }
        this.x += leftGutter;
    }

    setValueText(text){
        console.log('setValueText', text);
        this.placeValueText.text = text;
    }

    setValueTextAlpha(alpha){
        this.placeValueText.alpha = alpha;
    }
}
