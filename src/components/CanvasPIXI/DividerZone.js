export class DividerZone extends PIXI.Container{

    constructor(){
        super();
        this.positiveDots = [[],[],[]];
        this.negativeDots = [[],[],[]];
        this.positiveText;
        this.negativeText;
        this.positiveValue = 0;
        this.negativeValue = 0;
    }

    init(backgroundTexture, positiveTexture, negativeTexture){
        this.bg = new PIXI.Sprite(backgroundTexture);
        this.positiveTexture = positiveTexture;
        this.negativeTexture = negativeTexture;
        this.addChild(this.bg);
    }

    addDots(positiveDots, negativeDots){
        this.positiveValue = Object.keys(positiveDots).length;
        this.negativeValue = Object.keys(negativeDots).length;
        if(this.positiveValue < 10 && this.negativeValue < 10) {
            Object.keys(positiveDots).forEach(key => {
                let dot = positiveDots[key];
                let dotSprite = this.getDot(dot);
                dot.sprite = dotSprite;
                this.addDotToArray(dot);
                this.addChild(dot.sprite);
            });
            Object.keys(negativeDots).forEach(key => {
                let dot = negativeDots[key];
                let dotSprite = this.getDot(dot);
                dot.sprite = dotSprite;
                this.addDotToArray(dot);
                this.addChild(dot.sprite);
            });
        }else{
            if(Object.keys(positiveDots).length > 0) {
                this.positiveText = new PIXI.Text(Object.keys(positiveDots).length.toString(10), {
                    fontFamily: 'museo-slab',
                    fontSize: 18,
                    fill: 0xBCBCBC,
                    align: 'center'
                });
                this.addChild(this.positiveText);
            }
            if(Object.keys(negativeDots).length > 0) {
                this.negativeText = new PIXI.Text(Object.keys(negativeDots).length.toString(10), {
                    fontFamily: 'museo-slab',
                    fontSize: 18,
                    fill: 0xFFFFFF,
                    align: 'center'
                });
                this.negativeText.y = 20;
                this.addChild(this.negativeText);
            }
        }
    }

    getDot(dot){
        let dotSprite;
        if(dot.isPositive){
            dotSprite = new PIXI.Sprite(this.positiveTexture);
        }else{
            dotSprite = new PIXI.Sprite(this.negativeTexture);
        }
        //dotSprite.anchor.set(0.5);
        dotSprite.scale = new PIXI.Point(0.2, 0.2);
        return dotSprite;
    }

    addDotToArray(dot){
        if(dot.isPositive){
            for(let i = 0; i < this.positiveDots.length; i++) {
                if(this.positiveDots[i].length < 3) {
                    this.positiveDots[i].push(dot);
                    dot.sprite.x = (this.positiveDots[i].length * 6) + 1;
                    dot.sprite.y = (i * 6) + 4;
                    break;
                }
            }
        }else{
            for(let i = 0; i < this.negativeDots.length; i++) {
                if(this.negativeDots[i].length < 3) {
                    this.negativeDots[i].push(dot);
                    dot.sprite.x = (this.positiveDots[i].length * 6) + 1;
                    dot.sprite.y = (i * 6) + 22;
                    break;
                }
            }
        }
    }

    destroy(){
        this.positiveDots = null;
        this.negativeDots = null;
        while (this.children.length > 0){
            let child = this.getChildAt(0);
            this.removeChild(child);
            child.destroy();
        }
        this.positiveText = null;
        this.negativeText = null;
        super.destroy();
    }

}

