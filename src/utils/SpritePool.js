

export class SpritePool {

    constructor(textures) {
        this.positiveDotOneTexture = 'red_dot.png';
        this.positiveDotTwoTexture = 'blue_dot.png';
        this.negativeDotOneTexture = 'red_antidot.png';
        this.negativeDotTwoTexture = 'blue_antidot.png';
        this.positiveDotOneFrameTwo = 'dot1.png';
        this.positiveDotOneFrameThree = 'dot2.png';
        this.positiveDotOneFrameFour = 'dot3.png';

        this.texturePosOne = textures[this.positiveDotOneTexture];
        this.texturePosTwo = textures[this.positiveDotTwoTexture];
        this.textureNegOne = textures[this.negativeDotOneTexture];
        this.textureNegTwo = textures[this.negativeDotTwoTexture];

        this.positiveSpriteOneframes = [this.texturePosOne,
            textures[this.positiveDotOneFrameTwo],
            textures[this.positiveDotOneFrameThree],
            textures[this.positiveDotOneFrameFour]
            ];
        let i = 90;
        while(i > 0){
            this.positiveSpriteOneframes.push(this.texturePosOne);
            i--;
        }

        this.positiveSpriteTwoframes = [this.texturePosTwo,
            textures[this.positiveDotOneFrameTwo],
            textures[this.positiveDotOneFrameThree],
            textures[this.positiveDotOneFrameFour]
        ];
        i = 90;
        while(i > 0){
            this.positiveSpriteTwoframes.push(this.texturePosTwo);
            i--;
        }

        this.negativeSpriteOneframes = [this.textureNegOne,
            textures[this.positiveDotOneFrameTwo],
            textures[this.positiveDotOneFrameThree],
            textures[this.positiveDotOneFrameFour]
        ];
        i = 90;
        while(i > 0){
            this.negativeSpriteOneframes.push(this.textureNegOne);
            i--;
        }

        this.negativeSpriteTwoframes = [this.textureNegTwo,
            textures[this.positiveDotOneFrameTwo],
            textures[this.positiveDotOneFrameThree],
            textures[this.positiveDotOneFrameFour]
        ];
        i = 90;
        while(i > 0){
            this.negativeSpriteTwoframes.push(this.textureNegTwo);
            i--;
        }

        this.pool = [];
    }

    getOne(color, positive){
        if(this.pool.length > 0) {
            let sprite = this.pool.pop();
            if(color == 'one'){
                if(positive){
                    sprite.textures = this.positiveSpriteOneframes;
                }else{
                    sprite.textures = this.negativeSpriteOneframes;
                }
            }else{
                if(positive){
                    sprite.texture = this.positiveSpriteTwoframes;
                }else{
                    sprite.texture = this.negativeSpriteTwoframes;
                }
            }
            return sprite;
        }else{
            let sprite;
            if(color == 'one'){
                if(positive){
                    sprite = new PIXI.extras.AnimatedSprite(this.positiveSpriteOneframes);
                    //sprite = new PIXI.Sprite(this.texturePosOne);
                }else{
                    sprite = new PIXI.extras.AnimatedSprite(this.negativeSpriteOneframes);
                    //sprite = new PIXI.Sprite(this.textureNegOne);
                }
            }else{
                if(positive){
                    sprite = new PIXI.extras.AnimatedSprite(this.positiveSpriteTwoframes);
                    //sprite = new PIXI.Sprite(this.texturePosTwo);
                }else{
                    sprite = new PIXI.extras.AnimatedSprite(this.negativeSpriteTwoframes);
                    //sprite = new PIXI.Sprite(this.textureNegTwo);
                }
            }
            return sprite;
        }
    };

    dispose(sprite) {
        sprite.destroy();
        //this.pool.push(obj);
    };
}
