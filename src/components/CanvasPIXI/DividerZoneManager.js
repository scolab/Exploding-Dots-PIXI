import {DividerZone} from './DividerZone';
import { TweenMax, Quint} from "gsap";
import {EventEmitter} from 'eventemitter3';

export class DividerZoneManager extends PIXI.Container{

    static MOVED = 'MOVED';

    constructor(container){
        super();
        this.allZones = [];
        this.allZonesValue = [];
        this.totalZoneCount = 0;
        this.dragging = false;
        this.tweening = false;
        this.eventEmitter = new EventEmitter();
    }

    init(textures){
        this.textures = textures;
    }

    createZones() {
        for(let i = this.totalZoneCount - 1; i >= 0; i--){
            let dividerZone = new DividerZone();
            dividerZone.x = i * 30;
            dividerZone.init(this.textures['divider.png'], this.textures['red_dot.png'], this.textures['blue_dot.png']);
            this.allZones.push(dividerZone);
            this.addChild(dividerZone);
        }
    }

    addDots(positiveDividerDots, negativeDividerDots){
        let i;
        let positiveZoneWithValue = 0;
        let negativeZoneWithValue = 0;
        positiveDividerDots.forEach(hash => {
            if(Object.keys(hash).length > 0){
                positiveZoneWithValue++;
            }
        });
        negativeDividerDots.forEach(hash => {
            if(Object.keys(hash).length > 0){
                negativeZoneWithValue++;
            }
        });
        this.totalZoneCount = Math.max(positiveZoneWithValue, negativeZoneWithValue);
        this.createZones();
        for(i = 0; i < this.totalZoneCount; i++){
            this.allZones[i].addDots(positiveDividerDots[i], negativeDividerDots[i]);
            this.allZonesValue[i] = [this.allZones[i].positiveValue, this.allZones[i].negativeValue]
        }

    }

    removeDots(positiveDividerDots, negativeDividerDots){
        let newZoneCount = this.totalZoneCount;
        let removedZones = [];
        for(let i = 0; i < this.totalZoneCount; i++){
            if(Object.keys(positiveDividerDots[i]).length === 0 && Object.keys(negativeDividerDots[i]).length === 0 ){
                this.removeChild(this.allZones[i]);
                this.allZones[i].destroy();
                removedZones.push(this.allZones[i]);
                newZoneCount--;
                this.allZonesValue[i] = null;
            }
        }
        removedZones.forEach(zone => {
            this.allZones.splice(this.allZones.indexOf(zone), 1);
        });
        for(let i = 0; i < this.allZonesValue.length; i++){
            if(this.allZonesValue[i] === null){
                this.allZonesValue = [];
                break;
            }
        }
        this.totalZoneCount = newZoneCount;
    }

    start(){
        this.interactive = true;
        this.buttonMode = true;
        this.origin = new PIXI.Point(this.x, this.y);
        this.on('pointerdown', this.onDragStart);
        this.on('pointerup', this.onDragEnd);
        this.on('pointerupoutside', this.onDragEnd);
        this.on('pointermove', this.onDragMove);
    }

    stop(){
        this.off('pointerdown', this.onDragStart);
        this.off('pointerup', this.onDragEnd);
        this.off('pointerupoutside', this.onDragEnd);
        this.off('pointermove', this.onDragMove);
    }

    onDragStart(e, canvas){
        if(this.dragging === false && this.tweening === false) {
            this.origin = new PIXI.Point(this.x, this.y);
            this.data = e.data;
            this.dragging = true;
            var newPosition = this.data.getLocalPosition(this.parent);
            this.position.x = newPosition.x - (this.width / 2);
            this.position.y = newPosition.y - (this.height / 2);
        }
    }

    onDragMove(e){
        if (this.dragging) {
            var newPosition = this.data.getLocalPosition(this.parent);
            this.position.x = newPosition.x - (this.width / 2);
            this.position.y = newPosition.y - (this.height / 2);
            this.eventEmitter.emit(DividerZoneManager.MOVED, e.data, this.allZonesValue.slice());
        }
    }

    onDragEnd(e){
        if(this.dragging) {
            this.data = null;
            this.dragging = false;
            this.tweening = true;
            TweenMax.to(this, 1, {x:this.origin.x, y:this.origin.y, ease:Quint.easeInOut, onComplete:this.backIntoPlaceDone.bind(this)});
        }
        e.stopPropagation();
    }

    backIntoPlaceDone(){
        this.tweening = false;
    }

}
