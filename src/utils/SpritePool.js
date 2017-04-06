import {SPRITE_COLOR} from '../Constants'

export class SpritePool {

    constructor(textures) {

        this.poolPositiveRed = [];
        this.poolPositiveBlue = [];
        this.poolNegativeRed = [];
        this.poolNegativeBlue = [];

        this.positiveDotRedTexture = 'red_dot.png';
        this.positiveDotBlueTexture = 'blue_dot.png';
        this.negativeDotRedTexture = 'red_antidot.png';
        this.negativeDotBlueTexture = 'blue_antidot.png';

        this.positiveDotRedFrameTwo = 'dot1.png';
        this.positiveDotRedFrameThree = 'dot2.png';
        this.positiveDotRedFrameFour = 'dot3.png';

        this.positiveDotBlueFrameTwo = 'b_dot1.png';
        this.positiveDotBlueFrameThree = 'b_dot2.png';
        this.positiveDotBlueFrameFour = 'b_dot3.png';

        this.negativeDotRedFrameTwo = 'antidot1.png';
        this.negativeDotRedFrameThree = 'antidot2.png';
        this.negativeDotRedFrameFour = 'antidot3.png';

        this.negativeDotBlueFrameTwo = 'b_antidot1.png';
        this.negativeDotBlueFrameThree = 'b_antidot2.png';
        this.negativeDotBlueFrameFour = 'b_antidot3.png';

        this.texturePosOne = textures[this.positiveDotRedTexture];
        this.texturePosTwo = textures[this.positiveDotBlueTexture];
        this.textureNegOne = textures[this.negativeDotRedTexture];
        this.textureNegTwo = textures[this.negativeDotBlueTexture];

        this.positiveSpriteRedFrames = [this.texturePosOne,
            textures[this.positiveDotRedFrameTwo],
            textures[this.positiveDotRedFrameThree],
            textures[this.positiveDotRedFrameFour]
            ];
        let i = 45;
        while(i > 0){
            this.positiveSpriteRedFrames.push(this.texturePosOne);
            i--;
        }

        this.positiveSpriteBlueFrames = [this.texturePosTwo,
            textures[this.positiveDotBlueFrameTwo],
            textures[this.positiveDotBlueFrameThree],
            textures[this.positiveDotBlueFrameFour]
        ];
        i = 45;
        while(i > 0){
            this.positiveSpriteBlueFrames.push(this.texturePosTwo);
            i--;
        }

        this.negativeSpriteRedFrames = [this.textureNegOne,
            textures[this.negativeDotRedFrameTwo],
            textures[this.negativeDotRedFrameThree],
            textures[this.negativeDotRedFrameFour]
        ];
        i = 45;
        while(i > 0){
            this.negativeSpriteRedFrames.push(this.textureNegOne);
            i--;
        }

        this.negativeSpriteBlueFrames = [this.textureNegTwo,
            textures[this.negativeDotBlueFrameTwo],
            textures[this.negativeDotBlueFrameThree],
            textures[this.negativeDotBlueFrameFour]
        ];
        i = 45;
        while(i > 0){
            this.negativeSpriteBlueFrames.push(this.textureNegTwo);
            i--;
        }
    }

    getOne(color, positive){
        //console.log('getOne', color, positive);
        let sprite;
        if(color == SPRITE_COLOR.RED){
            if(positive){
                if(this.poolPositiveRed.length > 0) {
                    sprite = this.poolPositiveRed.pop();
                }else{
                    sprite = new PIXI.extras.AnimatedSprite(this.positiveSpriteRedFrames);
                }
            }else{
                if(this.poolNegativeRed.length > 0) {
                    sprite = this.poolNegativeRed.pop();
                }else{
                    sprite = new PIXI.extras.AnimatedSprite(this.negativeSpriteRedFrames);
                }
            }
        }else{
            if(positive){
                if(this.poolPositiveBlue.length > 0) {
                    sprite = this.poolPositiveBlue.pop();
                }else{
                    sprite = new PIXI.extras.AnimatedSprite(this.positiveSpriteBlueFrames);
                }
            }else{
                if(this.poolNegativeBlue.length > 0) {
                    sprite = this.poolNegativeBlue.pop();
                }else{
                    sprite = new PIXI.extras.AnimatedSprite(this.negativeSpriteBlueFrames);
                }
            }
        }
        sprite.alpha = 1;
        return sprite;
    };

    dispose(sprite, isPositive, color) {
        //sprite.destroy();
        //console.log('dispose', isPositive, color)
        sprite.gotoAndStop(0);
        sprite.dot = null;
        if(isPositive){
            if(color === SPRITE_COLOR.RED){
                this.poolPositiveRed.push(sprite);
            }else{
                this.poolPositiveBlue.push(sprite);
            }
        }else{
            if(color === SPRITE_COLOR.RED){
                this.poolNegativeRed.push(sprite);
            }else{
                this.poolNegativeBlue.push(sprite);
            }
        }

    };
}
