
import Sprite = PIXI.Sprite;
import Text = PIXI.Text;
export class DotCounter extends PIXI.Container {

  private bgLeft: Sprite;
  private bgCenter: Sprite;
  private bgRight: Sprite;
  private text: Text;

  constructor(position, left, center, right) {
    super();
    this.bgLeft = new Sprite(left);
    this.bgCenter = new Sprite(center);
    this.bgRight = new Sprite(right);

    this.addChild(this.bgLeft);
    this.addChild(this.bgCenter);
    this.addChild(this.bgRight);

    this.text = new Text(position, {
      align: 'center',
      fill: 0x6D6D6D,
      fontFamily: 'Noto Sans',
      fontSize: 22,
      fontWeight: 'bold',
    });
    this.text.anchor.y = 0.5;
    this.text.anchor.x = 0.5;
    this.setText('', true);
    this.setText('', false);

    this.text.x = this.getWidth() / 2;
    this.text.y = 15;

    this.addChild(this.text);
  }

  public setText(text: string, isPositive: boolean) {
    if (isPositive) {
      this.text.text = text;
    } else {
      this.text.text = `-${text}`;
    }
    switch (this.text.text.length) {
      case 0:
      case 1:
        this.bgCenter.width = 5;
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
      case 6:
        this.bgCenter.width = 60;
        this.bgLeft.x = -29;
        break;
      default:
        this.bgCenter.width = 5;
        this.bgLeft.x = 0;
        break;
    }
    this.setPosition();
  }

  public setStyle(value) {
    this.text.style.fill = value;
  }

  public getWidth() {
    return (this.bgLeft.width + this.bgCenter.width + this.bgRight.width) - 3;
  }

  private setPosition() {
    this.bgCenter.x = (this.bgLeft.x + this.bgLeft.width) - 1;
    this.bgRight.x = (this.bgLeft.x + this.bgLeft.width + this.bgCenter.width) - 2;
  }
}
