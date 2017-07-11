import { TweenMax, Quint } from 'gsap';
import { EventEmitter } from 'eventemitter3';
import { DividerZone } from './DividerZone';
import Point = PIXI.Point;
import {TWEEN_TIME} from "../../Constants";
import InteractionEvent = PIXI.interaction.InteractionEvent;
import {DividerDotVO} from "../../VO/DividerDotVO";

export class DividerZoneManager extends PIXI.Container {

  public static START_DRAG = 'START_DRAG';
  public static MOVED = 'MOVED';
  public static END_DRAG = 'END_DRAG';

  public eventEmitter: EventEmitter;
  private allZones: DividerZone[];
  private allZonesValue: number[][];
  private totalZoneCount: number;
  private dragging: boolean;
  private tweening: boolean;
  private textures: PIXI.loaders.TextureDictionary;
  private origin: Point;
  private data: PIXI.interaction.InteractionData;

  constructor() {
    super();
    this.allZones = new Array<DividerZone>();
    this.allZonesValue = new Array<number[]>();
    this.totalZoneCount = 0;
    this.dragging = false;
    this.tweening = false;
    this.eventEmitter = new EventEmitter();
  }

  public init(textures) {
    this.textures = textures;
  }

  public createZones() {
    // console.log('DividerZoneManager createZones');
    for (let i = this.totalZoneCount; i > 0; i -= 1) {
      const dividerZone = new DividerZone();
      dividerZone.x = (i * 65) - 65;
      dividerZone.init(this.textures['divider.png'], this.textures['dot_divider.png'], this.textures['antidot_divider.png']); // tslint:disable-line max-line-length
      this.allZones.push(dividerZone);
      this.addChild(dividerZone);
      this.x -= 65;
    }
    this.origin = new Point(this.x, this.y);
  }

  public addDots(positiveDividerDots: Array<IDividerDotVOHash<DividerDotVO>>,
                 negativeDividerDots: Array<IDividerDotVOHash<DividerDotVO>>) {
    // console.log('DividerZoneManager addDot', positiveDividerDots, negativeDividerDots);
    if (this.totalZoneCount === 0) {
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
      this.totalZoneCount = Math.max(positiveZoneMaxPosition, negativeZoneMaxPosition);
      this.createZones();
      for (i = 0; i < this.totalZoneCount; i += 1) {
        this.allZones[i].addDots(positiveDividerDots[i], negativeDividerDots[i]);
        this.allZonesValue[i] = [this.allZones[i].positiveValue, this.allZones[i].negativeValue];
      }
    }
  }

  public removeDots(positiveDividerDots: Array<IDividerDotVOHash<DividerDotVO>>,
                    negativeDividerDots: Array<IDividerDotVOHash<DividerDotVO>>) {
    // console.log('DividerZoneManager removeDots', positiveDividerDots, negativeDividerDots);
    let newZoneCount = this.totalZoneCount;
    // const removedZones: DividerZone[] = new Array<DividerZone>();
    for (let i = 0; i < this.totalZoneCount; i += 1) {
      if (Object.keys(positiveDividerDots[i]).length === 0 &&
        Object.keys(negativeDividerDots[i]).length === 0) {
        newZoneCount -= 1;
      }
    }
    if (newZoneCount === 0) {
      for (let i = 0; i < this.totalZoneCount; i += 1) {
        this.removeChild(this.allZones[i]);
        this.allZones[i].destroy();
      }
      this.allZones = new Array<DividerZone>();
      this.allZonesValue = new Array<number[]>();
      this.totalZoneCount = 0;
    }
  }

  public start() {
    // console.log('DividerZoneManager start');
    this.interactive = true;
    this.buttonMode = true;
    this.origin = new PIXI.Point(this.x, this.y);
    this.on('pointerdown', this.onDragStart);
    this.on('pointerup', this.onDragEnd);
    this.on('pointerupoutside', this.onDragEnd);
    this.on('pointermove', this.onDragMove);
  }

  public stop() {
    // console.log('DividerZoneManager stop');
    this.off('pointerdown', this.onDragStart);
    this.off('pointerup', this.onDragEnd);
    this.off('pointerupoutside', this.onDragEnd);
    this.off('pointermove', this.onDragMove);
  }

  public reset() {
    // console.log('DividerZoneManager reset');
    this.tweening = false;
    this.dragging = false;
    if (this.origin) {
      this.x = this.origin.x;
      this.y = this.origin.y;
    }
  }

  private onDragStart(e: InteractionEvent) {
    // console.log('DividerZoneManager onDragStart');
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

  private onDragMove(e: InteractionEvent) {
    if (this.dragging) {
      // console.log('onDragMove');
      const newPosition = this.data.getLocalPosition(this.parent);
      this.position.x = newPosition.x - (this.width / 2);
      this.position.y = newPosition.y - (this.height / 2);
      this.eventEmitter.emit(DividerZoneManager.MOVED, e.data, this.allZonesValue.slice());
    }
  }

  private onDragEnd(e: InteractionEvent) {
    if (this.dragging) {
      // console.log('DividerZoneManager onDragEnd');
      this.dragging = false;
      this.tweening = true;
      TweenMax.to(
        this,
        TWEEN_TIME.DIVIDER_BOX_BACK_INTO_PLACE,
        {
          ease: Quint.easeOut,
          onComplete: this.backIntoPlaceDone.bind(this),
          x: this.origin.x,
          y: this.origin.y,
        },
      );
      this.eventEmitter.emit(DividerZoneManager.END_DRAG, e.data, this.allZonesValue.slice(), true);
    }
    e.stopPropagation();
  }

  private backIntoPlaceDone() {
    // console.log('backIntoPlaceDone');
    TweenMax.delayedCall(TWEEN_TIME.DIVIDER_BOX_REST_TIME, () => { this.tweening = false; });
  }

}
