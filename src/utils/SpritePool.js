

export class SpritePool {

    constructor(texturePosOne, texturePosTwo, textureNegOne, textureNegTwo) {
        this.texturePosOne = texturePosOne;
        this.texturePosTwo = texturePosTwo;
        this.textureNegOne = textureNegOne;
        this.textureNegTwo = textureNegTwo;
        this.pool = [];
    }

    get(color, positive){
        if(this.pool.length > 0) {
            let sprite = this.pool.pop();
            if(color == 'one'){
                if(positive){
                    sprite.texture = this.texturePosOne;
                }else{
                    sprite.texture = this.textureNegOne;
                }
            }else{
                if(positive){
                    sprite.texture = this.texturePosTwo;
                }else{
                    sprite.texture = this.textureNegTwo;
                }
            }
            return sprite;
        }else{
            let sprite;
            if(color == 'one'){
                if(positive){
                    sprite = new PIXI.Sprite(this.texturePosOne);
                }else{
                    sprite = new PIXI.Sprite(this.textureNegOne);
                }
            }else{
                if(positive){
                    sprite = new PIXI.Sprite(this.texturePosTwo);
                }else{
                    sprite = new PIXI.Sprite(this.textureNegTwo);
                }
            }
            return sprite;
        }
    };

    dispose(obj) {
        this.pool.push(obj);
    };
}
