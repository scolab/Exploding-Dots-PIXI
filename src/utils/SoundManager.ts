import { Howl, Howler } from 'howler';
import { TweenMax } from 'gsap';
// eslint-disable-next-line import/prefer-default-export
export class SoundManager {

  public static GO_SUCCESS: string = 'GO_SUCCESS';
  public static GO_INVALID: string = 'GO_INVALID';
  public static ADD_DOT: string = 'ADD_DOT';
  public static ADD_DIVISION_DOT: string = 'ADD_DIVISION_DOT';
  public static DOT_VANISH: string = 'DOT_VANISH';
  public static BACK_INTO_PLACE: string = 'BACK_INTO_PLACE';
  public static DOT_EXPLODE: string = 'DOT_EXPLODE';
  public static DOT_IMPLODE: string = 'DOT_IMPLODE';
  public static INVALID_MOVE: string = 'INVALID_MOVE';
  public static NOT_ENOUGH_DOTS: string = 'NOT_ENOUGH_DOTS';
  public static DOT_ANNIHILATION: string = 'DOT_ANNIHILATION';
  public static DIVISION_SUCCESS: string = 'DIVISION_SUCCESS';
  public static DIVISION_IMPOSSIBLE: string = 'DIVISION_IMPOSSIBLE';
  public static DIVISION_BACKINTOPLACE: string = 'DIVISION_BACKINTOPLACE';
  public static DIVISION_OVERLOAD: string = 'DIVISION_OVERLOAD';
  public static BOX_OVERLOAD: string = 'BOX_OVERLOAD';
  public static BOX_POSITIVE_NEGATIVE: string = 'BOX_POSITIVE_NEGATIVE';

  public muted: boolean;

  private baseURL: string;
  private allSounds: Howl[];
  private allLoop: Array<(string) => void>; // tslint:disable-line variable-name

  private GO_SUCCESS: Howl;
  private GO_INVALID: Howl;
  private ADD_DOT_1: Howl;
  private ADD_DOT_2: Howl;
  private ADD_DOT_3: Howl;
  private ADD_DOT_4: Howl;
  private ADD_DOT_5: Howl;
  private ADD_DIVISION_DOT: Howl;
  private DOT_VANISH: Howl;
  private BACK_INTO_PLACE: Howl;
  private DOT_EXPLODE: Howl;
  private DOT_IMPLODE: Howl;
  private INVALID_MOVE: Howl;
  private NOT_ENOUGH_DOTS: Howl;
  private DOT_ANNIHILATION: Howl;
  private DIVISION_SUCCESS: Howl;
  private DIVISION_IMPOSSIBLE: Howl;
  private DIVISION_BACKINTOPLACE: Howl;
  private DIVISION_OVERLOAD: Howl;
  private BOX_OVERLOAD: Howl;
  private BOX_POSITIVE_NEGATIVE: Howl;

  constructor(baseURL, muted) {
    this.muted = muted;
    this.baseURL = baseURL;
    this.baseURL += '/sounds/';
    this.allSounds = new Array<Howl>();

    this.GO_SUCCESS = new Howl({
      src: [`${this.baseURL}GO_SUCCESS.mp3`],
    });
    this.allSounds.push(this.GO_SUCCESS);

    this.GO_INVALID = new Howl({
      src: [`${this.baseURL}GO_INVALID.mp3`],
    });
    this.allSounds.push(this.GO_INVALID);

    this.ADD_DOT_1 = new Howl({
      src: [`${this.baseURL}Pop_05.mp3`],
    });
    this.allSounds.push(this.ADD_DOT_1);

    this.ADD_DOT_2 = new Howl({
      src: [`${this.baseURL}Pop_04.mp3`],
    });
    this.allSounds.push(this.ADD_DOT_2);

    this.ADD_DOT_3 = new Howl({
      src: [`${this.baseURL}Pop_03.mp3`],
    });
    this.allSounds.push(this.ADD_DOT_3);

    this.ADD_DOT_4 = new Howl({
      src: [`${this.baseURL}Pop_02.mp3`],
    });
    this.allSounds.push(this.ADD_DOT_4);

    this.ADD_DOT_5 = new Howl({
      src: [`${this.baseURL}Pop_01.mp3`],
    });
    this.allSounds.push(this.ADD_DOT_5);

    this.ADD_DIVISION_DOT = new Howl({
      src: [`${this.baseURL}ADD_DIVISION_DOT.mp3`],
    });
    this.allSounds.push(this.ADD_DIVISION_DOT);

    this.DOT_VANISH = new Howl({
      src: [`${this.baseURL}Movement_01.mp3`],
    });
    this.allSounds.push(this.DOT_VANISH);

    this.BACK_INTO_PLACE = new Howl({
      src: [`${this.baseURL}BACK_INTO_PLACE.mp3`],
    });
    this.allSounds.push(this.BACK_INTO_PLACE);

    this.DOT_EXPLODE = new Howl({
      src: [`${this.baseURL}DOT_EXPLODE.mp3`],
    });
    this.allSounds.push(this.DOT_EXPLODE);

    this.DOT_IMPLODE = new Howl({
      src: [`${this.baseURL}Wrong_01.mp3`],
    });
    this.allSounds.push(this.DOT_IMPLODE);

    this.INVALID_MOVE = new Howl({
      src: [`${this.baseURL}INVALID_MOVE.mp3`],
    });
    this.allSounds.push(this.INVALID_MOVE);

    this.NOT_ENOUGH_DOTS = new Howl({
      src: [`${this.baseURL}NOT_ENOUGH_DOTS.mp3`],
    });
    this.allSounds.push(this.NOT_ENOUGH_DOTS);

    this.DOT_ANNIHILATION = new Howl({
      src: [`${this.baseURL}DOT_ANNIHILATION.mp3`],
    });
    this.allSounds.push(this.DOT_ANNIHILATION);

    this.DIVISION_SUCCESS = new Howl({
      src: [`${this.baseURL}DIVISION_SUCCESS.mp3`],
    });
    this.allSounds.push(this.DIVISION_SUCCESS);

    this.DIVISION_IMPOSSIBLE = new Howl({
      src: [`${this.baseURL}DIVISION_IMPOSSIBLE.mp3`],
    });
    this.allSounds.push(this.DIVISION_IMPOSSIBLE);

    this.DIVISION_BACKINTOPLACE = new Howl({
      src: [`${this.baseURL}DIVISION_BACKINTOPLACE.mp3`],
    });
    this.allSounds.push(this.DIVISION_BACKINTOPLACE);

    this.DIVISION_OVERLOAD = new Howl({
      src: [`${this.baseURL}DIVISION_OVERLOAD.mp3`],
    });
    this.allSounds.push(this.DIVISION_OVERLOAD);

    this.BOX_OVERLOAD = new Howl({
      src: [`${this.baseURL}BOX_OVERLOAD.mp3`],
    });
    this.allSounds.push(this.BOX_OVERLOAD);

    this.BOX_POSITIVE_NEGATIVE = new Howl({
      src: [`${this.baseURL}BOX_POSITIVE_NEGATIVE.mp3`],
    });
    this.allSounds.push(this.BOX_POSITIVE_NEGATIVE);
    this.allLoop = [this.playLoopOne, this.playLoopTwo];
  }

  public playSound(id: string): void {
    console.log('play sound', id);
    if (!this.muted) {
      if (id === SoundManager.BOX_OVERLOAD) {
        TweenMax.delayedCall(1, this.playLoopOne, [id], this);
      } else if (id === SoundManager.BOX_POSITIVE_NEGATIVE) {
        TweenMax.delayedCall(1, this.playLoopTwo, [id], this);
      } else if (this[id]) {
        this[id].play();
      }
    }
  }

  public stopSound(id: string): void {
    if (this[id]) {
      this[id].stop();
    }
    if (id === SoundManager.BOX_OVERLOAD) {
      TweenMax.killTweensOf(this.playLoopOne);
    } else if (id === SoundManager.BOX_POSITIVE_NEGATIVE) {
      TweenMax.killTweensOf(this.playLoopTwo);
    }
  }

  public stopAllSounds(): void {
    this.allSounds.forEach((sound) => {
      sound.stop();
    });
    this.allLoop.forEach((loop) => {
      TweenMax.killTweensOf(loop);
    });
  }

  public destroy(): void {
    this.allSounds.forEach((howl) => {
      howl.unload();
    });
    // Howler.unload();
  }

  private playLoopOne(id: string): void {
    if (this[id]) {
      this[id].play();
      TweenMax.delayedCall(5, this.playLoopOne, [id], this);
    }
  }

  private playLoopTwo(id: string): void {
    if (this[id]) {
      this[id].play();
      TweenMax.delayedCall(5, this.playLoopTwo, [id], this);
    }
  }
}
