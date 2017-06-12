// @flow

import { TweenMax } from 'gsap';

// eslint-disable-next-line import/prefer-default-export
export class FeedbackDisplay extends window.PIXI.Text {

  guideReminder: string;
  guideFeedback: string;

  constructor(guideReminder: string, guideFeedback: string) {
    super('', {
      fontFamily: 'Noto Sans',
      fontWeight: 'bold',
      fontSize: 34,
      fill: 0xBCBCBC,
      align: 'center',
    });
    this.guideReminder = guideReminder;
    this.guideFeedback = guideFeedback;
  }

  showReminder() {
    // console.log('showReminder');
    this.text = this.guideReminder;
    TweenMax.killTweensOf(this.hideReminder);
    TweenMax.delayedCall(2, this.hideReminder, null, this);
  }

  hideReminder() {
    // console.log('hideReminder');
    this.text = '';
  }

  showFeedback() {
    this.text = this.guideFeedback;
  }

}
