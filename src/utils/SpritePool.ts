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

    this.positiveSpriteRedFrames = [this.texturePosOne];
    for(let i:number = 1; i <= 24; i++){
      this.positiveSpriteRedFrames.push(textures[`dot${i}.png`]);
    }
    let i = 80;
    while (i > 0) {
      this.positiveSpriteRedFrames.push(this.texturePosOne);
      i -= 1;
    }

    this.positiveSpriteBlueFrames = [this.texturePosTwo];
    for(let i:number = 1; i <= 3; i++){
      this.positiveSpriteBlueFrames.push(textures[`b_dot${i}.png`]);
    }
    i = 45;
    while (i > 0) {
      this.positiveSpriteBlueFrames.push(this.texturePosTwo);
      i -= 1;
    }

    this.negativeSpriteRedFrames = [this.textureNegOne];
    for(let i:number = 1; i <= 3; i++){
      this.negativeSpriteRedFrames.push(textures[`antidot${i}.png`]);
    }
    i = 45;
    while (i > 0) {
      this.negativeSpriteRedFrames.push(this.textureNegOne);
      i -= 1;
    }

    this.negativeSpriteBlueFrames = [this.textureNegTwo];
    for(let i:number = 1; i <= 3; i++){
      this.negativeSpriteBlueFrames.push(textures[`b_antidot${i}.png`]);
    }
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
          sprite = new DotSprite(this.texturePosOne, this.positiveSpriteRedFrames);
        }
      } else if (this.poolNegativeRed.length > 0) {
        sprite = this.poolNegativeRed.pop() as DotSprite;
      } else {
        sprite = new DotSprite(this.textureNegOne, this.negativeSpriteRedFrames);
      }
    } else if (positive) {
      if (this.poolPositiveBlue.length > 0) {
        sprite = this.poolPositiveBlue.pop() as DotSprite;
      } else {
        sprite = new DotSprite(this.texturePosTwo, this.positiveSpriteBlueFrames);
      }
    } else if (this.poolNegativeBlue.length > 0) {
      sprite = this.poolNegativeBlue.pop() as DotSprite;
    } else {
      sprite = new DotSprite(this.textureNegTwo, this.negativeSpriteBlueFrames);
    }
    sprite.alpha = 1;
    return sprite;
  }

  public dispose(sprite: DotSprite, isPositive: boolean, color: string) {
        // sprite.destroy();
        // console.log('dispose', isPositive, color)
    sprite.returnToNormal();
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
