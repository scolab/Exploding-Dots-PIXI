import {BOX_INFO} from '../../Constants'

export class DotCounter extends PIXI.Container{

    bgLeft = null;
    bgCenter = null;
    bgRight = null;
    text = null;

    constructor(position, left, center, right){
        super();
        this.bgLeft = new PIXI.Sprite(left);
        this.bgCenter = new PIXI.Sprite(center);
        this.bgRight = new PIXI.Sprite(right);

        this.addChild(this.bgLeft);
        this.addChild(this.bgCenter);
        this.addChild(this.bgRight);

        this.text = new PIXI.Text(position, {
            fontFamily: 'museo-slab',
            fontSize: 22,
            fill: 0x6D6D6D,
            align: 'center',
        });
        this.text.anchor.y = 0.5;
        this.text.anchor.x = 0.5;
        this.setText('');

        this.text.x = this.getWidth() / 2;
        this.text.y = 15;

        this.addChild(this.text);
    }

    setText(text){
        this.text.text = text;
        switch(this.text.text.length){
            case 0:
            case 1:
                this.bgCenter.width = 4;
                this.bgLeft.x = 0;
                break;
            case 2:
                this.bgCenter.width = 20;
                this.bgLeft.x = -9;
                break;
            case 3:
                this.bgCenter.width = 36;
                this.bgLeft.x = -17;
                break;
            case 4:
                this.bgCenter.width = 50;
                this.bgLeft.x = -24;
                break;
            case 5:
                this.bgCenter.width = 60;
                this.bgLeft.x = -29;
                break;
        }
        this.setPosition();
    }

    setPosition(){
        this.bgCenter.x = this.bgLeft.x + this.bgLeft.width - 1;
        this.bgRight.x = this.bgLeft.x + this.bgLeft.width + this.bgCenter.width - 2;

    }

    setStyle(value){
        this.text.style.fill = value;
    }

    getWidth(){
        return this.bgLeft.width + this.bgCenter.width + this.bgRight.width - 3;
    }
}
