import { Howl, Howler } from 'howler';
import { TweenMax } from 'gsap';
// eslint-disable-next-line import/prefer-default-export
export class SoundManager {

  public static DOT_EXPLODE_1: string = 'DOT_EXPLODE_1';
  public static DOT_EXPLODE_2: string = 'DOT_EXPLODE_2';
  public static DOT_EXPLODE_3: string = 'DOT_EXPLODE_3';
  public static DOT_EXPLODE_4: string = 'DOT_EXPLODE_4';
  public static DOT_EXPLODE_5: string = 'DOT_EXPLODE_5';
  public static DOT_EXPLODE_MORE: string = 'DOT_EXPLODE_MORE';

  public static ADD_DOT: string = 'ADD_DOT';

  public static DOT_IMPLODE: string = 'DOT_IMPLODE';
  public static DOT_IMPLODE_MORE: string = 'DOT_IMPLODE_MORE';

  public static BACK_INTO_PLACE: string = 'BACK_INTO_PLACE';
  public static DOT_VANISH: string = 'DOT_VANISH';
  public static DOT_ANNIHILATION: string = 'DOT_ANNIHILATION';
  public static ADD_DOT_ANTIDOT: string = 'ADD_DOT_ANTIDOT';
  public static SUCCESS: string = 'SUCCESS';
  public static RESET: string = 'RESET';
  public static GO: string = 'GO';

  public static GO_INVALID: string = 'GO_INVALID';
  public static DIVISION_SUCCESS: string = 'DIVISION_SUCCESS';
  public static DIVISION_IMPOSSIBLE: string = 'DIVISION_IMPOSSIBLE';
  public static DIVISION_BACKINTOPLACE: string = 'DIVISION_BACKINTOPLACE';
  public static DIVISION_OVERLOAD: string = 'DIVISION_OVERLOAD';
  public static BOX_OVERLOAD: string = 'BOX_OVERLOAD';

  public static get instance(): SoundManager {
    // Do you need arguments? Make it a regular method instead.
    return this._instance || (this._instance = new SoundManager());
  }

  private static _instance: SoundManager;

  public muted: boolean;

  private baseURL: string;
  private allSounds: Howl[];

  private DOT_EXPLODE_1: Howl;
  private DOT_EXPLODE_2: Howl;
  private DOT_EXPLODE_3: Howl;
  private DOT_EXPLODE_4: Howl;
  private DOT_EXPLODE_5: Howl;
  private DOT_EXPLODE_MORE: Howl;

  private ADD_DOT_1: Howl;
  private ADD_DOT_2: Howl;
  private ADD_DOT_3: Howl;
  private ADD_DOT_4: Howl;
  private ADD_DOT_5: Howl;

  private DOT_IMPLODE: Howl;
  private DOT_IMPLODE_MORE: Howl;

  private BACK_INTO_PLACE: Howl;
  private DOT_VANISH: Howl;
  private DOT_ANNIHILATION: Howl;

  private ADD_DOT_ANTIDOT_1: Howl;
  private ADD_DOT_ANTIDOT_2: Howl;
  private ADD_DOT_ANTIDOT_3: Howl;
  private ADD_DOT_ANTIDOT_4: Howl;
  private ADD_DOT_ANTIDOT_5: Howl;

  private SUCCESS: Howl;
  private RESET: Howl;
  private GO: Howl;

  /* private GO_INVALID: Howl;
  private DIVISION_SUCCESS: Howl;
  private DIVISION_IMPOSSIBLE: Howl;
  private DIVISION_BACKINTOPLACE: Howl;
  private DIVISION_OVERLOAD: Howl;*/

  private constructor() {
    this.allSounds = new Array<Howl>();
  }

  public init(baseURL: string, muted: boolean): void {
    this.muted = muted;
    this.baseURL = baseURL;
    this.baseURL += '/sounds/';
    this.DOT_EXPLODE_1 = new Howl({
      src: [`${this.baseURL}S01_Explosion_1pt.mp3`],
    });

    this.DOT_EXPLODE_2 = new Howl({
      src: [`${this.baseURL}S01_Explosion_2pts.mp3`],
    });

    this.DOT_EXPLODE_3 = new Howl({
      src: [`${this.baseURL}S01_Explosion_3pts.mp3`],
    });

    this.DOT_EXPLODE_4 = new Howl({
      src: [`${this.baseURL}S01_Explosion_4pts.mp3`],
    });

    this.DOT_EXPLODE_5 = new Howl({
      src: [`${this.baseURL}S01_Explosion_5pts.mp3`],
    });

    this.DOT_EXPLODE_MORE = new Howl({
      src: [`${this.baseURL}S01_Explosion_plus_5ps.mp3`],
    });

    this.ADD_DOT_1 = new Howl({
      src: [`${this.baseURL}S02_Pop_01.mp3`],
    });
    this.allSounds.push(this.ADD_DOT_1);

    this.ADD_DOT_2 = new Howl({
      src: [`${this.baseURL}S02_Pop_02.mp3`],
    });
    this.allSounds.push(this.ADD_DOT_2);

    this.ADD_DOT_3 = new Howl({
      src: [`${this.baseURL}S02_Pop_03.mp3`],
    });
    this.allSounds.push(this.ADD_DOT_3);

    this.ADD_DOT_4 = new Howl({
      src: [`${this.baseURL}S02_Pop_04.mp3`],
    });
    this.allSounds.push(this.ADD_DOT_4);

    this.ADD_DOT_5 = new Howl({
      src: [`${this.baseURL}S02_Pop_05.mp3`],
    });
    this.allSounds.push(this.ADD_DOT_5);

    this.DOT_IMPLODE = new Howl({
      src: [`${this.baseURL}S04_Extension_1-3pts_01.mp3`],
    });
    this.allSounds.push(this.DOT_IMPLODE);

    this.DOT_IMPLODE_MORE = new Howl({
      src: [`${this.baseURL}S04_Extension_more_3pts_01.mp3`],
    });
    this.allSounds.push(this.DOT_IMPLODE_MORE);

    this.BACK_INTO_PLACE = new Howl({
      src: [`${this.baseURL}S05_Fast_Movement_Alt_04.mp3`],
    });
    this.allSounds.push(this.BACK_INTO_PLACE);

    this.DOT_VANISH = new Howl({
      src: [`${this.baseURL}S06_Movement_out_01.mp3`],
    });
    this.allSounds.push(this.DOT_VANISH);

    this.DOT_ANNIHILATION = new Howl({
      src: [`${this.baseURL}S07_Annihilation_01.mp3`],
    });
    this.allSounds.push(this.DOT_ANNIHILATION);

    this.ADD_DOT_ANTIDOT_1 = new Howl({
      src: [`${this.baseURL}S08_Pop_Reverse_01.mp3`],
    });
    this.allSounds.push(this.ADD_DOT_ANTIDOT_1);

    this.ADD_DOT_ANTIDOT_2 = new Howl({
      src: [`${this.baseURL}S08_Pop_Reverse_02.mp3`],
    });
    this.allSounds.push(this.ADD_DOT_ANTIDOT_1);

    this.ADD_DOT_ANTIDOT_3 = new Howl({
      src: [`${this.baseURL}S08_Pop_Reverse_03.mp3`],
    });
    this.allSounds.push(this.ADD_DOT_ANTIDOT_1);

    this.ADD_DOT_ANTIDOT_4 = new Howl({
      src: [`${this.baseURL}S08_Pop_Reverse_04.mp3`],
    });
    this.allSounds.push(this.ADD_DOT_ANTIDOT_1);

    this.ADD_DOT_ANTIDOT_5 = new Howl({
      src: [`${this.baseURL}S08_Pop_Reverse_05.mp3`],
    });
    this.allSounds.push(this.ADD_DOT_ANTIDOT_1);

    this.SUCCESS = new Howl({
      src: [`${this.baseURL}S09_Goodanswer.mp3`],
    });
    this.allSounds.push(this.SUCCESS);

    this.GO = new Howl({
      src: [`${this.baseURL}S10_Next.mp3`],
    });
    this.allSounds.push(this.GO);

    this.RESET = new Howl({
      src: [`${this.baseURL}S11_Reset.mp3`],
    });
    this.allSounds.push(this.RESET);

    /*
    this.GO_INVALID = new Howl({
      src: [`${this.baseURL}GO_INVALID.mp3`],
    });
    this.allSounds.push(this.GO_INVALID);

    this.DIVISION_SUCCESS = new Howl({
      src: [`${this.baseURL}DIVISION_SUCCESS.mp3`],
    });
    this.allSounds.push(this.DIVISION_SUCCESS);

    this.DIVISION_IMPOSSIBLE = new Howl({
      src: [`${this.baseURL}DIVISION_IMPOSSIBLE.mp3`],
    });
    this.allSounds.push(this.DIVISION_IMPOSSIBLE);
  */
  }

  public playSound(id: string): void {
    // console.log('play sound', id);
    if (!this.muted) {
      if (this[id]) {
        this[id].play();
      }
    }
  }

  /*public stopSound(id: string): void {
    /!*if (this[id]) {
      this[id].stop();
    }
    *!/
  }*/

  /*public stopAllSounds(): void {
    this.allSounds.forEach((sound) => {
      sound.stop();
    });
    this.allLoop.forEach((loop) => {
      TweenMax.killTweensOf(loop);
    });
  }*/

  public destroy(): void {
    this.allSounds.forEach((howl) => {
      howl.unload();
    });
    // Howler.unload();
  }
}
