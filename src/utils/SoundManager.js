import { Howl } from 'howler';
import { TweenMax } from 'gsap';

export class SoundManager {

  static GO_SUCCESS = 'GO_SUCCESS';
  static GO_INVALID = 'GO_INVALID';
  static ADD_DOT = 'ADD_DOT';
  static ADD_DIVISION_DOT = 'ADD_DIVISION_DOT';
  static DOT_VANISH = 'DOT_VANISH';
  static BACK_INTO_PLACE = 'BACK_INTO_PLACE';
  static DOT_EXPLODE = 'DOT_EXPLODE';
  static DOT_IMPLODE = 'DOT_IMPLODE';
  static INVALID_MOVE = 'INVALID_MOVE';
  static NOT_ENOUGH_DOTS = 'NOT_ENOUGH_DOTS';
  static DOT_ANNIHILATION = 'DOT_ANNIHILATION';
  static DIVISION_SUCCESS = 'DIVISION_SUCCESS';
  static DIVISION_IMPOSSIBLE = 'DIVISION_IMPOSSIBLE';
  static DIVISION_BACKINTOPLACE = 'DIVISION_BACKINTOPLACE';
  static DIVISION_OVERLOAD = 'DIVISION_OVERLOAD';
  static BOX_OVERLOAD = 'BOX_OVERLOAD';
  static BOX_POSITIVE_NEGATIVE = 'BOX_POSITIVE_NEGATIVE';

  constructor(baseURL, muted) {
    this.muted = muted;
    this.baseURL = baseURL;
    this.baseURL += '/sounds/';
    this.allSounds = [];

    this.GO_SUCCESS = new Howl({
      src: [`${this.baseURL}GO_SUCCESS.mp3`],
    });
    this.allSounds.push(this.GO_SUCCESS);

    this.GO_INVALID = new Howl({
      src: [`${this.baseURL}GO_INVALID.mp3`],
    });
    this.allSounds.push(this.GO_INVALID);

    this.ADD_DOT = new Howl({
      src: [`${this.baseURL}ADD_DOT.mp3`],
    });
    this.allSounds.push(this.ADD_DOT);

    this.ADD_DIVISION_DOT = new Howl({
      src: [`${this.baseURL}ADD_DIVISION_DOT.mp3`],
    });
    this.allSounds.push(this.ADD_DIVISION_DOT);

    this.DOT_VANISH = new Howl({
      src: [`${this.baseURL}DOT_VANISH.mp3`],
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
      src: [`${this.baseURL}DOT_IMPLODE.mp3`],
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

  playSound(id) {
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

  playLoopOne(id) {
    if (this[id]) {
      this[id].play();
      TweenMax.delayedCall(5, this.playLoopOne, [id], this);
    }
  }

  playLoopTwo(id) {
    if (this[id]) {
      this[id].play();
      TweenMax.delayedCall(5, this.playLoopTwo, [id], this);
    }
  }

  stopSound(id) {
    if (this[id]) {
      this[id].stop();
    }
    if (id === SoundManager.BOX_OVERLOAD) {
      TweenMax.killTweensOf(this.playLoopOne);
    } else if (id === SoundManager.BOX_POSITIVE_NEGATIVE) {
      TweenMax.killTweensOf(this.playLoopTwo);
    }
  }

  stopAllSounds() {
    this.allSounds.forEach((sound) => {
      sound.stop();
    });
    this.allLoop.forEach((loop) => {
      TweenMax.killTweensOf(loop);
    });
  }
}

