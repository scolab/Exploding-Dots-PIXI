
export class DividerResult extends PIXI.Text {

  constructor() {
    super('allo', {
      fontFamily: 'Noto Sans',
      fontWeight: 'bold',
      fontSize: 34,
      fill: 0xBCBCBC,
      align: 'center',
    });
  }

  update(positiveDividerValue, negativeDividerValue, positiveDots, negativeDots) {
    let dotValue = '';

    for (let i = 0; i < positiveDividerValue.length; i++) {
      dotValue += positiveDividerValue[i] - negativeDividerValue[i];
      dotValue += '|';
    }
    dotValue = dotValue.slice(0, -1);

    dotValue += ' r ';

    for (let i = 0; i < positiveDots.length; i++) {
      dotValue += positiveDots[i] - negativeDots[i];
      dotValue += '|';
    }
    dotValue = dotValue.slice(0, -1);

    this.text = dotValue;
  }
}
