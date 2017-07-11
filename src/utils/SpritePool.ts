import {SPRITE_COLOR} from '../Constants';
import {DotSprite} from '../components/CanvasPIXI/DotSprite';
import {DotVO} from "../VO/DotVO";
import TextureDictionary = PIXI.loaders.TextureDictionary;
import Texture = PIXI.Texture;

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

  private positiveOverloadRedFrames: PIXI.Texture[];
  private positiveOverloadBlueFrames: PIXI.Texture[];
  private negativeOverloadRedFrames: PIXI.Texture[];
  private negativeOverloadBlueFrames: PIXI.Texture[];

  private positiveRippleRedFrames: PIXI.Texture[];
  private positiveRippleBlueFrames: PIXI.Texture[];
  private negativeRippleRedFrames: PIXI.Texture[];
  private negativeRippleBlueFrames: PIXI.Texture[];

  /*private positiveWrongRedFrames: PIXI.Texture[];
  private positiveWrongBlueFrames: PIXI.Texture[];
  private negativeWrongRedFrames: PIXI.Texture[];
  private negativeWrongBlueFrames: PIXI.Texture[];*/

  private positiveImplodeRedFrames: PIXI.Texture[];
  private positiveImplodeBlueFrames: PIXI.Texture[];
  private negativeImplodeRedFrames: PIXI.Texture[];
  private negativeImplodeBlueFrames: PIXI.Texture[];

  private positiveOutRedFrames: PIXI.Texture[];
  private positiveOutBlueFrames: PIXI.Texture[];
  private negativeOutRedFrames: PIXI.Texture[];
  private negativeOutBlueFrames: PIXI.Texture[];

  private positiveWiggleRedFrames: PIXI.Texture[];
  private positiveWiggleBlueFrames: PIXI.Texture[];
  private negativeWiggleRedFrames: PIXI.Texture[];
  private negativeWiggleBlueFrames: PIXI.Texture[];

  private positiveWiggleUnstableRedFrames: PIXI.Texture[];
  private positiveWiggleUnstableBlueFrames: PIXI.Texture[];
  private negativeWiggleUnstableRedFrames: PIXI.Texture[];
  private negativeWiggleUnstableBlueFrames: PIXI.Texture[];

  constructor(textures: TextureDictionary) {

    this.texturePosOne = textures[this.positiveDotRedTexture];
    this.texturePosTwo = textures[this.positiveDotBlueTexture];
    this.textureNegOne = textures[this.negativeDotRedTexture];
    this.textureNegTwo = textures[this.negativeDotBlueTexture];

    this.createOverloadAnimations(textures);
    this.createDripAnimations(textures);
    // this.createWrongAnimation(textures);
    this.createImplodeAnimation(textures);
    this.createOutAnimation(textures);
    this.createWiggleAnimation(textures);
    this.createWiggleUnstableAnimation(textures);
  }

  public getOne(color: string, positive: boolean): DotSprite {
    // console.log('getOne', color, positive);
    let sprite: DotSprite;
    if (color === SPRITE_COLOR.RED) {
      if (positive) {
        if (this.poolPositiveRed.length > 0) {
          sprite = this.poolPositiveRed.pop() as DotSprite;
        } else {
          sprite = new DotSprite(
            this.texturePosOne,
            this.positiveOverloadRedFrames,
            this.positiveRippleRedFrames,
            this.positiveImplodeRedFrames,
            this.positiveOutRedFrames,
            this.positiveWiggleRedFrames,
            this.positiveWiggleUnstableRedFrames,
          );
        }
      } else if (this.poolNegativeRed.length > 0) {
        sprite = this.poolNegativeRed.pop() as DotSprite;
      } else {
        sprite = new DotSprite(
          this.textureNegOne,
          this.negativeOverloadRedFrames,
          this.negativeRippleRedFrames,
          this.negativeImplodeRedFrames,
          this.negativeOutRedFrames,
          this.negativeWiggleRedFrames,
          this.negativeWiggleUnstableRedFrames,
        );
      }
    } else if (positive) {
      if (this.poolPositiveBlue.length > 0) {
        sprite = this.poolPositiveBlue.pop() as DotSprite;
      } else {
        sprite = new DotSprite(
          this.texturePosTwo,
          this.positiveOverloadBlueFrames,
          this.positiveRippleBlueFrames,
          this.positiveImplodeBlueFrames,
          this.positiveOutBlueFrames,
          this.positiveWiggleBlueFrames,
          this.positiveWiggleUnstableBlueFrames,
        );
      }
    } else if (this.poolNegativeBlue.length > 0) {
      sprite = this.poolNegativeBlue.pop() as DotSprite;
    } else {
      sprite = new DotSprite(
        this.textureNegTwo,
        this.negativeOverloadBlueFrames,
        this.negativeRippleBlueFrames,
        this.negativeImplodeBlueFrames,
        this.negativeOutBlueFrames,
        this.negativeWiggleBlueFrames,
        this.negativeWiggleUnstableBlueFrames,
      );
    }
    sprite.alpha = 1;
    return sprite;
  }

  public dispose(sprite: DotSprite, isPositive: boolean, color: string) {
    // sprite.destroy();
    // console.log('dispose', isPositive, color)
    sprite.returnToNormal(true);
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
    this.positiveOverloadRedFrames.forEach((texture) => {
      texture.destroy();
    });
    this.positiveOverloadBlueFrames.forEach((texture) => {
      texture.destroy();
    });
    this.negativeOverloadRedFrames.forEach((texture) => {
      texture.destroy();
    });
    this.negativeOverloadBlueFrames.forEach((texture) => {
      texture.destroy();
    });
  }

  private createOverloadAnimations(textures: TextureDictionary): void {

    let normalFramesAdded: number = 80;

    this.positiveOverloadRedFrames = [this.texturePosOne];
    for (let i: number = 1; i <= 24; i++) {
      this.positiveOverloadRedFrames.push(textures[`dot${i}.png`]);
    }

    while (normalFramesAdded > 0) {
      this.positiveOverloadRedFrames.push(this.texturePosOne);
      normalFramesAdded -= 1;
    }

    this.positiveOverloadBlueFrames = [this.texturePosTwo];
    for (let i: number = 1; i <= 3; i++) {
      this.positiveOverloadBlueFrames.push(textures[`b_dot${i}.png`]);
    }
    normalFramesAdded = 80;
    while (normalFramesAdded > 0) {
      this.positiveOverloadBlueFrames.push(this.texturePosTwo);
      normalFramesAdded -= 1;
    }

    this.negativeOverloadRedFrames = [this.textureNegOne];
    for (let i: number = 1; i <= 3; i++) {
      this.negativeOverloadRedFrames.push(textures[`antidot${i}.png`]);
    }
    normalFramesAdded = 80;
    while (normalFramesAdded > 0) {
      this.negativeOverloadRedFrames.push(this.textureNegOne);
      normalFramesAdded -= 1;
    }

    this.negativeOverloadBlueFrames = [this.textureNegTwo];
    for (let i: number = 1; i <= 3; i++) {
      this.negativeOverloadBlueFrames.push(textures[`b_antidot${i}.png`]);
    }
    normalFramesAdded = 80;
    while (normalFramesAdded > 0) {
      this.negativeOverloadBlueFrames.push(this.textureNegTwo);
      normalFramesAdded -= 1;
    }
  }

  private createDripAnimations(textures: TextureDictionary): void {
    this.positiveRippleRedFrames = [this.texturePosOne];
    for (let i: number = 1; i <= 5; i++) {
      this.positiveRippleRedFrames.push(textures[`dot_ripple${i}.png`]);
    }

    this.positiveRippleBlueFrames = [this.texturePosTwo];
    for (let i: number = 1; i <= 5; i++) {
      this.positiveRippleBlueFrames.push(textures[`dot_ripple${i}.png`]);
    }

    this.negativeRippleRedFrames = [this.textureNegOne];
    for (let i: number = 1; i <= 5; i++) {
      this.negativeRippleRedFrames.push(textures[`dot_ripple${i}.png`]);
    }

    this.negativeRippleBlueFrames = [this.textureNegTwo];
    for (let i: number = 1; i <= 5; i++) {
      this.negativeRippleBlueFrames.push(textures[`dot_ripple${i}.png`]);
    }
  }

  /*private createWrongAnimation(textures: TextureDictionary): void {
    this.positiveWrongRedFrames = [this.texturePosOne];
    for (let i: number = 1; i <= 10; i++) {
      this.positiveWrongRedFrames.push(textures[`dot_incorrect${i}.png`]);
    }

    this.positiveWrongBlueFrames = [this.texturePosTwo];
    for (let i: number = 1; i <= 10; i++) {
      this.positiveWrongBlueFrames.push(textures[`dot_incorrect${i}.png`]);
    }

    this.negativeWrongRedFrames = [this.textureNegOne];
    for (let i: number = 1; i <= 10; i++) {
      this.negativeWrongRedFrames.push(textures[`dot_incorrect${i}.png`]);
    }

    this.negativeWrongBlueFrames = [this.textureNegTwo];
    for (let i: number = 1; i <= 10; i++) {
      this.negativeWrongBlueFrames.push(textures[`dot_incorrect${i}.png`]);
    }
  }*/

  private createImplodeAnimation(textures: TextureDictionary): void {
    const numFrame: number = 10;
    this.positiveImplodeRedFrames = [this.texturePosOne];
    for (let i: number = 1; i <= numFrame; i++) {
      this.positiveImplodeRedFrames.push(textures[`dot_implode${i}.png`]);
    }

    this.positiveImplodeBlueFrames = [this.texturePosTwo];
    for (let i: number = 1; i <= numFrame; i++) {
      this.positiveImplodeBlueFrames.push(textures[`dot_implode${i}.png`]);
    }

    this.negativeImplodeRedFrames = [this.textureNegOne];
    for (let i: number = 1; i <= numFrame; i++) {
      this.negativeImplodeRedFrames.push(textures[`dot_implode${i}.png`]);
    }

    this.negativeImplodeBlueFrames = [this.textureNegTwo];
    for (let i: number = 1; i <= numFrame; i++) {
      this.negativeImplodeBlueFrames.push(textures[`dot_implode${i}.png`]);
    }
  }

  private createOutAnimation(textures: TextureDictionary): void {
    const numFrame: number = 7;
    this.positiveOutRedFrames = [this.texturePosOne];
    for (let i: number = 1; i <= numFrame; i++) {
      this.positiveOutRedFrames.push(textures[`dot_out${i}.png`]);
    }

    this.positiveOutBlueFrames = [this.texturePosTwo];
    for (let i: number = 1; i <= numFrame; i++) {
      this.positiveOutBlueFrames.push(textures[`dot_out${i}.png`]);
    }

    this.negativeOutRedFrames = [this.textureNegOne];
    for (let i: number = 1; i <= numFrame; i++) {
      this.negativeOutRedFrames.push(textures[`dot_out${i}.png`]);
    }

    this.negativeOutBlueFrames = [this.textureNegTwo];
    for (let i: number = 1; i <= numFrame; i++) {
      this.negativeOutBlueFrames.push(textures[`dot_out${i}.png`]);
    }
  }

  private createWiggleAnimation(textures: TextureDictionary): void {
    const numFrame: number = 13;
    this.positiveWiggleRedFrames = [this.texturePosOne];
    for (let i: number = 1; i <= numFrame; i++) {
      this.positiveWiggleRedFrames.push(textures[`dot_wiggle${i}.png`]);
    }

    this.positiveWiggleBlueFrames = [this.texturePosTwo];
    for (let i: number = 1; i <= numFrame; i++) {
      this.positiveWiggleBlueFrames.push(textures[`dot_wiggle${i}.png`]);
    }

    this.negativeWiggleRedFrames = [this.textureNegOne];
    for (let i: number = 1; i <= numFrame; i++) {
      this.negativeWiggleRedFrames.push(textures[`dot_wiggle${i}.png`]);
    }

    this.negativeWiggleBlueFrames = [this.textureNegTwo];
    for (let i: number = 1; i <= numFrame; i++) {
      this.negativeWiggleBlueFrames.push(textures[`dot_wiggle${i}.png`]);
    }
  }

  private createWiggleUnstableAnimation(textures: TextureDictionary): void {
    const numFrame: number = 13;
    let normalFramesAdded: number = 80;

    this.positiveWiggleUnstableRedFrames = [this.texturePosOne];
    for (let i: number = 1; i <= numFrame; i++) {
      this.positiveWiggleUnstableRedFrames.push(textures[`dot_wiggle${i}.png`]);
    }
    while (normalFramesAdded > 0) {
      this.positiveWiggleUnstableRedFrames.push(this.texturePosOne);
      normalFramesAdded -= 1;
    }

    normalFramesAdded = 80;
    this.positiveWiggleUnstableBlueFrames = [this.texturePosTwo];
    for (let i: number = 1; i <= numFrame; i++) {
      this.positiveWiggleUnstableBlueFrames.push(textures[`dot_wiggle${i}.png`]);
    }
    while (normalFramesAdded > 0) {
      this.positiveWiggleUnstableBlueFrames.push(this.texturePosTwo);
      normalFramesAdded -= 1;
    }

    normalFramesAdded = 80;
    this.negativeWiggleUnstableRedFrames = [this.textureNegOne];
    for (let i: number = 1; i <= numFrame; i++) {
      this.negativeWiggleUnstableRedFrames.push(textures[`dot_wiggle${i}.png`]);
    }
    while (normalFramesAdded > 0) {
      this.negativeWiggleUnstableRedFrames.push(this.textureNegOne);
      normalFramesAdded -= 1;
    }

    normalFramesAdded = 80;
    this.negativeWiggleUnstableBlueFrames = [this.textureNegTwo];
    for (let i: number = 1; i <= numFrame; i++) {
      this.negativeWiggleUnstableBlueFrames.push(textures[`dot_wiggle${i}.png`]);
    }
    while (normalFramesAdded > 0) {
      this.negativeWiggleUnstableBlueFrames.push(this.textureNegTwo);
      normalFramesAdded -= 1;
    }
  }
}