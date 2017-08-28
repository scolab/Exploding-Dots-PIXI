export class DividerResult extends PIXI.Text {

  constructor() {
    super('', {
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
                negativeDots: number[]): void {
    // console.log(positiveDividerValue, negativeDividerValue, positiveDots, negativeDots);
    let dotValue: string = '';
    for (let i: number = 0; i < positiveDividerValue.length; i += 1) {
      dotValue += positiveDividerValue[i] - negativeDividerValue[i];
      dotValue += '|';
    }
    dotValue = dotValue.slice(0, -1);

    dotValue += ' r ';

    for (let i: number = 0; i < positiveDots.length; i += 1) {
      dotValue += positiveDots[i] - negativeDots[i];
      dotValue += '|';
    }
    dotValue = dotValue.slice(0, -1);

    this.text = dotValue;
  }
}
