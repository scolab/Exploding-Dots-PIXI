import Texture = PIXI.Texture;
import Text = PIXI.Text;
import {DividerDotVO} from '../../VO/DividerDotVO';
import Sprite = PIXI.Sprite;
export class DividerZone extends PIXI.Container {

  public positiveValue: number;
  public negativeValue: number;

  private positiveDots: DividerDotVO[][];
  private negativeDots: DividerDotVO[][];
  private positiveText: Text;
  private negativeText: Text;
  private bg: PIXI.Sprite;
  private positiveTexture: Texture;
  private negativeTexture: Texture;

  constructor() {
    super();
    this.positiveDots = new Array<DividerDotVO[]>();
    this.negativeDots = new Array<DividerDotVO[]>();
    for (let i: number = 0; i < 3; i += 1) {
      this.positiveDots[i] = new Array<DividerDotVO>();
      this.negativeDots[i] = new Array<DividerDotVO>();
    }
    this.positiveValue = 0;
    this.negativeValue = 0;
  }

  public init(backgroundTexture: Texture, positiveTexture: Texture, negativeTexture: Texture): void {
    this.bg = new PIXI.Sprite(backgroundTexture);
    this.positiveTexture = positiveTexture;
    this.negativeTexture = negativeTexture;
    this.addChild(this.bg);
  }

  public addDots(positiveDots: IDividerDotVOHash<DividerDotVO>, negativeDots: IDividerDotVOHash<DividerDotVO>): void {
    this.positiveValue = Object.keys(positiveDots).length;
    this.negativeValue = Object.keys(negativeDots).length;
    if (this.positiveValue < 10 && this.negativeValue < 10) {
      Object.keys(positiveDots).forEach((key) => {
        const dot: DividerDotVO = positiveDots[key];
        const dotSprite = this.getDot(dot);
        dot.sprite = dotSprite;
        this.addDotToArray(dot);
        this.addChild(dot.sprite);
      });
      Object.keys(negativeDots).forEach((key) => {
        const dot = negativeDots[key];
        const dotSprite = this.getDot(dot);
        dot.sprite = dotSprite;
        this.addDotToArray(dot);
        this.addChild(dot.sprite);
      });
    } else {
      if (Object.keys(positiveDots).length > 0) {
        this.positiveText = new Text(Object.keys(positiveDots).length.toString(10), {
          align: 'center',
          fill: 0xBCBCBC,
          fontFamily: 'Noto Sans',
          fontSize: 34,
          fontWeight: 'bold',
        });
        this.positiveText.anchor.set(0.5);
        this.positiveText.x = 32;
        this.positiveText.y = 25;
        this.addChild(this.positiveText);
      }
      if (Object.keys(negativeDots).length > 0) {
        this.negativeText = new Text(Object.keys(negativeDots).length.toString(10), {
          align: 'center',
          fill: 0xFFFF00,
          fontFamily: 'Noto Sans',
          fontSize: 34,
          fontWeight: 'bold',
        });
        this.negativeText.anchor.set(0.5);
        this.negativeText.x = 32;
        this.negativeText.y = 68;
        this.addChild(this.negativeText);
      }
    }
  }

  public destroy(): void {
    this.positiveDots = new Array<DividerDotVO[]>();
    this.negativeDots = new Array<DividerDotVO[]>();
    while (this.children.length > 0) {
      const child = this.getChildAt(0);
      this.removeChild(child);
      child.destroy();
    }
    if (this.positiveText !== undefined) {
      this.positiveText.destroy();
    }
    if (this.negativeText !== undefined) {
      this.negativeText.destroy();
    }
    super.destroy();
  }

  private getDot(dot: DividerDotVO): Sprite {
    let dotSprite: Sprite;
    if (dot.isPositive) {
      dotSprite = new Sprite(this.positiveTexture);
    } else {
      dotSprite = new Sprite(this.negativeTexture);
    }
    dotSprite.anchor.set(0.5);
    return dotSprite;
  }

  private addDotToArray(dot: DividerDotVO): void {
    if (dot.isPositive) {
      for (let i: number = 0; i < this.positiveDots.length; i++) {
        if (this.positiveDots[i].length < 3) {
          this.positiveDots[i].push(dot);
          dot.sprite.x = (this.positiveDots[i].length * 15) + 1;
          dot.sprite.y = (i * 15) + 9;
          break;
        }
      }
    } else {
      for (let i: number = 0; i < this.negativeDots.length; i += 1) {
        if (this.negativeDots[i].length < 3) {
          this.negativeDots[i].push(dot);
          dot.sprite.x = (this.negativeDots[i].length * 15) + 1;
          dot.sprite.y = (i * 15) + 54;
          break;
        }
      }
    }
  }

}

