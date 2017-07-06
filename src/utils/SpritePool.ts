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

  private positiveWrongRedFrames: PIXI.Texture[];
  private positiveWrongBlueFrames: PIXI.Texture[];
  private negativeWrongRedFrames: PIXI.Texture[];
  private negativeWrongBlueFrames: PIXI.Texture[];

  /*private positiveMovingRedFrames: PIXI.Texture[];
  private positiveMovingBlueFrames: PIXI.Texture[];
  private negativeMovingRedFrames: PIXI.Texture[];
  private negativeMovingBlueFrames: PIXI.Texture[];*/

  constructor(textures:TextureDictionary) {

    this.texturePosOne = textures[this.positiveDotRedTexture];
    this.texturePosTwo = textures[this.positiveDotBlueTexture];
    this.textureNegOne = textures[this.negativeDotRedTexture];
    this.textureNegTwo = textures[this.negativeDotBlueTexture];

    this.createOverloadAnimations(textures);
    this.createDripAnimations(textures);
    this.createWrongAnimation(textures);
    //this.createMovingAnimation(textures);
  }

  private createOverloadAnimations(textures:TextureDictionary):void {

    let normalFramesAdded:number = 80;

    this.positiveOverloadRedFrames = [this.texturePosOne];
    for(let i:number = 1; i <= 24; i++){
      this.positiveOverloadRedFrames.push(textures[`dot${i}.png`]);
    }

    while (normalFramesAdded > 0) {
      this.positiveOverloadRedFrames.push(this.texturePosOne);
      normalFramesAdded -= 1;
    }

    this.positiveOverloadBlueFrames = [this.texturePosTwo];
    for(let i:number = 1; i <= 3; i++){
      this.positiveOverloadBlueFrames.push(textures[`b_dot${i}.png`]);
    }
    normalFramesAdded = 80;
    while (normalFramesAdded > 0) {
      this.positiveOverloadBlueFrames.push(this.texturePosTwo);
      normalFramesAdded -= 1;
    }

    this.negativeOverloadRedFrames = [this.textureNegOne];
    for(let i:number = 1; i <= 3; i++){
      this.negativeOverloadRedFrames.push(textures[`antidot${i}.png`]);
    }
    normalFramesAdded = 80;
    while (normalFramesAdded > 0) {
      this.negativeOverloadRedFrames.push(this.textureNegOne);
      normalFramesAdded -= 1;
    }

    this.negativeOverloadBlueFrames = [this.textureNegTwo];
    for(let i:number = 1; i <= 3; i++){
      this.negativeOverloadBlueFrames.push(textures[`b_antidot${i}.png`]);
    }
    normalFramesAdded = 80;
    while (normalFramesAdded > 0) {
      this.negativeOverloadBlueFrames.push(this.textureNegTwo);
      normalFramesAdded -= 1;
    }
  }

  private createDripAnimations(textures: TextureDictionary):void {
    this.positiveRippleRedFrames = [this.texturePosOne];
    for(let i:number = 1; i <= 5; i++){
      this.positiveRippleRedFrames.push(textures[`dot_ripple${i}.png`]);
    }

    this.positiveRippleBlueFrames = [this.texturePosTwo];
    for(let i:number = 1; i <= 5; i++){
      this.positiveRippleBlueFrames.push(textures[`dot_ripple${i}.png`]);
    }

    this.negativeRippleRedFrames = [this.textureNegOne];
    for(let i:number = 1; i <= 5; i++){
      this.negativeRippleRedFrames.push(textures[`dot_ripple${i}.png`]);
    }

    this.negativeRippleBlueFrames = [this.textureNegTwo];
    for(let i:number = 1; i <= 5; i++){
      this.negativeRippleBlueFrames.push(textures[`dot_ripple${i}.png`]);
    }
  }

  private createWrongAnimation(textures: TextureDictionary):void{
    this.positiveWrongRedFrames = [this.texturePosOne];
    for(let i:number = 1; i <= 10; i++){
      this.positiveWrongRedFrames.push(textures[`dot_incorrect${i}.png`]);
    }

    this.positiveWrongBlueFrames = [this.texturePosTwo];
    for(let i:number = 1; i <= 10; i++){
      this.positiveWrongBlueFrames.push(textures[`dot_incorrect${i}.png`]);
    }

    this.negativeWrongRedFrames = [this.textureNegOne];
    for(let i:number = 1; i <= 10; i++){
      this.negativeWrongRedFrames.push(textures[`dot_incorrect${i}.png`]);
    }

    this.negativeWrongBlueFrames = [this.textureNegTwo];
    for(let i:number = 1; i <= 10; i++){
      this.negativeWrongBlueFrames.push(textures[`dot_incorrect${i}.png`]);
    }
  }

  /*private createMovingAnimation(textures:TextureDictionary):void{
    this.positiveMovingRedFrames = [this.texturePosOne];
    for(let i:number = 1; i <= 3; i++){
      this.positiveMovingRedFrames.push(textures[`dot_drip${i}.png`]);
    }

    this.positiveMovingBlueFrames = [this.texturePosTwo];
    for(let i:number = 1; i <= 3; i++){
      this.positiveMovingBlueFrames.push(textures[`dot_drip${i}.png`]);
    }

    this.negativeMovingRedFrames = [this.textureNegOne];
    for(let i:number = 1; i <= 3; i++){
      this.negativeMovingRedFrames.push(textures[`dot_drip${i}.png`]);
    }

    this.negativeMovingBlueFrames = [this.textureNegTwo];
    for(let i:number = 1; i <= 3; i++){
      this.negativeMovingBlueFrames.push(textures[`dot_drip${i}.png`]);
    }
  }*/

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
            this.positiveWrongRedFrames
          );
        }
      } else if (this.poolNegativeRed.length > 0) {
        sprite = this.poolNegativeRed.pop() as DotSprite;
      } else {
        sprite = new DotSprite(
          this.textureNegOne,
          this.negativeOverloadRedFrames,
          this.negativeRippleRedFrames,
          this.negativeWrongRedFrames
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
          this.positiveWrongBlueFrames
        );
      }
    } else if (this.poolNegativeBlue.length > 0) {
      sprite = this.poolNegativeBlue.pop() as DotSprite;
    } else {
      sprite = new DotSprite(
        this.textureNegTwo,
        this.negativeOverloadBlueFrames,
        this.negativeRippleBlueFrames,
        this.negativeWrongBlueFrames
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

}
