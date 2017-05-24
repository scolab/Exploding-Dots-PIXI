export class DividerResult extends PIXI.Text {

  constructor() {
    super('allo', {
      align: 'center',
      fill: 0xBCBCBC,
      fontFamily: 'Noto Sans',
      fontSize: 34,
      fontWeight: 'bold',
    });
  }

  public update(positiveDividerValue: number[],
                negativeDividerValue: number[],
                positiveDots: number[],
                negativeDots: number[]) {
    let dotValue = '';

    for (let i = 0; i < positiveDividerValue.length; i += 1) {
      dotValue += positiveDividerValue[i] - negativeDividerValue[i];
      dotValue += '|';
    }
    dotValue = dotValue.slice(0, -1);

    dotValue += ' r ';

    for (let i = 0; i < positiveDots.length; i += 1) {
      dotValue += positiveDots[i] - negativeDots[i];
      dotValue += '|';
    }
    dotValue = dotValue.slice(0, -1);

    this.text = dotValue;
  }
}
