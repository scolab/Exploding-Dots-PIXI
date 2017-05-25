// make both array the same length with filler
export const makeBothArrayTheSameLength = (arrayA: any[], arrayB: any[], filler: any) => {
  while (arrayA.length > arrayB.length) {
    arrayB.push(filler);
  }
  while (arrayB.length > arrayA.length) {
    arrayA.push(filler);
  }
};
