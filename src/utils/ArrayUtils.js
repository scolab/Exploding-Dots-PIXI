
// make both array the same length with 0
// eslint-disable-next-line import/prefer-default-export
export const makeBothArrayTheSameLength = (arrayA, arrayB) => {
  while (arrayA.length > arrayB.length) {
    arrayB.push(0);
  }
  while (arrayB.length > arrayA.length) {
    arrayA.push(0);
  }
};
