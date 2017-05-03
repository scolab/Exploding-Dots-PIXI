import { TweenMax, Quint } from 'gsap';
import { EventEmitter } from 'eventemitter3';
import { DividerZone } from './DividerZone';

// eslint-disable-next-line import/prefer-default-export
export class DividerZoneManager extends PIXI.Container {

  static START_DRAG = 'START_DRAG';
  static MOVED = 'MOVED';
  static END_DRAG = 'END_DRAG';

  constructor() {
    super();
    this.allZones = [];
    this.allZonesValue = [];
    this.totalZoneCount = 0;
    this.dragging = false;
    this.tweening = false;
    this.eventEmitter = new EventEmitter();
  }

  init(textures) {
    this.textures = textures;
  }

  createZones() {
        // console.log('DividerZoneManager createZones');
    for (let i = this.totalZoneCount; i > 0; i -= 1) {
      const dividerZone = new DividerZone();
      dividerZone.x = (i * 65) - 65;
      dividerZone.init(this.textures['divider.png'], this.textures['dot_divider.png'], this.textures['antidot_divider.png']);
      this.allZones.push(dividerZone);
      this.addChild(dividerZone);
      this.x -= 65;
    }
    this.origin = new PIXI.Point(this.x, this.y);
  }

  addDots(positiveDividerDots, negativeDividerDots) {
        // console.log('DividerZoneManager addDot', positiveDividerDots, negativeDividerDots);
    let i;
    let positiveZoneMaxPosition = 0;
    let negativeZoneMaxPosition = 0;
    for (i = 0; i < positiveDividerDots.length; i += 1) {
      if (Object.keys(positiveDividerDots[i]).length > 0) {
        positiveZoneMaxPosition = i + 1;
      }
    }
    for (i = 0; i < negativeDividerDots.length; i += 1) {
      if (Object.keys(negativeDividerDots[i]).length > 0) {
        negativeZoneMaxPosition = i + 1;
      }
    }
    if (this.totalZoneCount !== Math.max(positiveZoneMaxPosition, negativeZoneMaxPosition)) {
      this.totalZoneCount = Math.max(positiveZoneMaxPosition, negativeZoneMaxPosition);
      this.createZones();
      for (i = 0; i < this.totalZoneCount; i += 1) {
        this.allZones[i].addDots(positiveDividerDots[i], negativeDividerDots[i]);
        this.allZonesValue[i] = [this.allZones[i].positiveValue, this.allZones[i].negativeValue];
      }
    }
  }

  removeDots(positiveDividerDots, negativeDividerDots) {
        // console.log('DividerZoneManager removeDots', positiveDividerDots, negativeDividerDots);
    let newZoneCount = this.totalZoneCount;
    const removedZones = [];
    for (let i = 0; i < this.totalZoneCount; i += 1) {
      if (Object.keys(positiveDividerDots[i]).length === 0 &&
        Object.keys(negativeDividerDots[i]).length === 0) {
        this.removeChild(this.allZones[i]);
        this.allZones[i].destroy();
        removedZones.push(this.allZones[i]);
        newZoneCount -= 1;
        this.allZonesValue[i] = null;
      }
    }
    removedZones.forEach((zone) => {
      this.allZones.splice(this.allZones.indexOf(zone), 1);
    });
    for (let i = 0; i < this.allZonesValue.length; i += 1) {
      if (this.allZonesValue[i] === null) {
        this.allZonesValue = [];
        break;
      }
    }
    this.totalZoneCount = newZoneCount;
  }

  start() {
        // console.log('DividerZoneManager start');
    this.interactive = true;
    this.buttonMode = true;
    this.origin = new PIXI.Point(this.x, this.y);
    this.on('pointerdown', this.onDragStart);
    this.on('pointerup', this.onDragEnd);
    this.on('pointerupoutside', this.onDragEnd);
    this.on('pointermove', this.onDragMove);
  }

  stop() {
    this.off('pointerdown', this.onDragStart);
    this.off('pointerup', this.onDragEnd);
    this.off('pointerupoutside', this.onDragEnd);
    this.off('pointermove', this.onDragMove);
  }

  onDragStart(e) {
    if (this.dragging === false && this.tweening === false) {
      this.origin = new PIXI.Point(this.x, this.y);
      this.data = e.data;
      this.dragging = true;
      const newPosition = this.data.getLocalPosition(this.parent);
      this.position.x = newPosition.x - (this.width / 2);
      this.position.y = newPosition.y - (this.height / 2);
      this.eventEmitter.emit(DividerZoneManager.START_DRAG);
    }
  }

  onDragMove(e) {
    if (this.dragging) {
      const newPosition = this.data.getLocalPosition(this.parent);
      this.position.x = newPosition.x - (this.width / 2);
      this.position.y = newPosition.y - (this.height / 2);
      this.eventEmitter.emit(DividerZoneManager.MOVED, e.data, this.allZonesValue.slice());
    }
  }

  onDragEnd(e) {
    if (this.dragging) {
      this.data = null;
      this.dragging = false;
      this.tweening = true;
      TweenMax.to(this, 0.3, {
        x: this.origin.x,
        y: this.origin.y,
        ease: Quint.easeOut,
        onComplete: this.backIntoPlaceDone.bind(this),
      });
      this.eventEmitter.emit(DividerZoneManager.END_DRAG, e.data, this.allZonesValue.slice(), true);
    }
    e.stopPropagation();
  }

  backIntoPlaceDone() {
    TweenMax.delayedCall(0.2, () => { this.tweening = false; });
  }

  reset() {
    this.tweening = false;
    this.dragging = false;
    if (this.origin) {
      this.x = this.origin.x;
      this.y = this.origin.y;
    }
  }

}
