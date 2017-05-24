import {ISPRITE_COLOR, SPRITE_COLOR} from '../Constants';
import {DotSprite} from '../components/CanvasPIXI/DotSprite';
import {DotVO} from "../VO/DotVO";

export class SpritePool {

  private poolPositiveRed: DotSprite[] = new Array<DotSprite>();
  private poolPositiveBlue: DotSprite[] = new Array<DotSprite>();
  private poolNegativeRed: DotSprite[] = new Array<DotSprite>();
  private poolNegativeBlue: DotSprite[] = new Array<DotSprite>();

  private positiveDotRedTexture: string = 'red_dot.png';
  private positiveDotBlueTexture: string = 'blue_dot.png';
  private negativeDotRedTexture: string = 'red_antidot.png';
  private negativeDotBlueTexture: string = 'blue_antidot.png';

  private positiveDotRedFrameTwo: string = 'dot1.png';
  private positiveDotRedFrameThree: string = 'dot2.png';
  private positiveDotRedFrameFour: string = 'dot3.png';

  private positiveDotBlueFrameTwo: string = 'b_dot1.png';
  private positiveDotBlueFrameThree: string = 'b_dot2.png';
  private positiveDotBlueFrameFour: string = 'b_dot3.png';

  private negativeDotRedFrameTwo: string = 'antidot1.png';
  private negativeDotRedFrameThree: string = 'antidot2.png';
  private negativeDotRedFrameFour: string = 'antidot3.png';

  private negativeDotBlueFrameTwo: string = 'b_antidot1.png';
  private negativeDotBlueFrameThree: string = 'b_antidot2.png';
  private negativeDotBlueFrameFour: string = 'b_antidot3.png';

  private texturePosOne: PIXI.Texture;
  private texturePosTwo: PIXI.Texture;
  private textureNegOne: PIXI.Texture;
  private textureNegTwo: PIXI.Texture;

  private positiveSpriteRedFrames: PIXI.Texture[];
  private positiveSpriteBlueFrames: PIXI.Texture[];
  private negativeSpriteRedFrames: PIXI.Texture[];
  private negativeSpriteBlueFrames: PIXI.Texture[];

  constructor(textures) {

    this.texturePosOne = textures[this.positiveDotRedTexture];
    this.texturePosTwo = textures[this.positiveDotBlueTexture];
    this.textureNegOne = textures[this.negativeDotRedTexture];
    this.textureNegTwo = textures[this.negativeDotBlueTexture];

    this.positiveSpriteRedFrames = [this.texturePosOne,
      textures[this.positiveDotRedFrameTwo],
      textures[this.positiveDotRedFrameThree],
      textures[this.positiveDotRedFrameFour],
    ];
    let i = 45;
    while (i > 0) {
      this.positiveSpriteRedFrames.push(this.texturePosOne);
      i -= 1;
    }

    this.positiveSpriteBlueFrames = [this.texturePosTwo,
      textures[this.positiveDotBlueFrameTwo],
      textures[this.positiveDotBlueFrameThree],
      textures[this.positiveDotBlueFrameFour],
    ];
    i = 45;
    while (i > 0) {
      this.positiveSpriteBlueFrames.push(this.texturePosTwo);
      i -= 1;
    }

    this.negativeSpriteRedFrames = [this.textureNegOne,
      textures[this.negativeDotRedFrameTwo],
      textures[this.negativeDotRedFrameThree],
      textures[this.negativeDotRedFrameFour],
    ];
    i = 45;
    while (i > 0) {
      this.negativeSpriteRedFrames.push(this.textureNegOne);
      i -= 1;
    }

    this.negativeSpriteBlueFrames = [this.textureNegTwo,
      textures[this.negativeDotBlueFrameTwo],
      textures[this.negativeDotBlueFrameThree],
      textures[this.negativeDotBlueFrameFour],
    ];
    i = 45;
    while (i > 0) {
      this.negativeSpriteBlueFrames.push(this.textureNegTwo);
      i -= 1;
    }
  }

  public getOne(color: string, positive: boolean): DotSprite {
        // console.log('getOne', color, positive);
    let sprite: DotSprite;
    if (color === SPRITE_COLOR.RED) {
      if (positive) {
        if (this.poolPositiveRed.length > 0) {
          sprite = this.poolPositiveRed.pop() as DotSprite;
        } else {
          sprite = new DotSprite(this.positiveSpriteRedFrames);
        }
      } else if (this.poolNegativeRed.length > 0) {
        sprite = this.poolNegativeRed.pop() as DotSprite;
      } else {
        sprite = new DotSprite(this.negativeSpriteRedFrames);
      }
    } else if (positive) {
      if (this.poolPositiveBlue.length > 0) {
        sprite = this.poolPositiveBlue.pop() as DotSprite;
      } else {
        sprite = new DotSprite(this.positiveSpriteBlueFrames);
      }
    } else if (this.poolNegativeBlue.length > 0) {
      sprite = this.poolNegativeBlue.pop() as DotSprite;
    } else {
      sprite = new DotSprite(this.negativeSpriteBlueFrames);
    }
    sprite.alpha = 1;
    return sprite;
  }

  public dispose(sprite: DotSprite, isPositive: boolean, color: string) {
        // sprite.destroy();
        // console.log('dispose', isPositive, color)
    sprite.gotoAndStop(0);
    sprite.dot = new DotVO();
    if (isPositive) {
      if (color === SPRITE_COLOR.RED) {
        this.poolPositiveRed.push(sprite);
      } else {
        this.poolPositiveBlue.push(sprite);
      }
    } else if (color === SPRITE_COLOR.RED) {
      this.poolNegativeRed.push(sprite);
    } else {
      this.poolNegativeBlue.push(sprite);
    }
  }

  public destroy() {
    this.poolPositiveRed.forEach((sprite) => {
      sprite.destroy();
    });
    this.poolPositiveBlue.forEach((sprite) => {
      sprite.destroy();
    });
    this.poolNegativeRed.forEach((sprite) => {
      sprite.destroy();
    });
    this.poolNegativeBlue.forEach((sprite) => {
      sprite.destroy();
    });
    this.positiveSpriteRedFrames.forEach((texture) => {
      texture.destroy();
    });
    this.positiveSpriteBlueFrames.forEach((texture) => {
      texture.destroy();
    });
    this.negativeSpriteRedFrames.forEach((texture) => {
      texture.destroy();
    });
    this.negativeSpriteBlueFrames.forEach((texture) => {
      texture.destroy();
    });
  }
}
