export const degToRad = (deg) => {
  return (deg * Math.PI) / 180;
};

export const makeUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0; // eslint-disable-line no-bitwise
    const v = c === 'x' ? r : (r & 0x3 | 0x8); // eslint-disable-line no-mixed-operators, no-bitwise
    return v.toString(16);
  });
};

export const randomFromTo = (min, max) => {
  return Math.floor((Math.random() * ((max - min) + 1)) + min);
};

export const convertBase = (value, fromBase, toBase) => {
  const range = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('');
  const fromRange = range.slice(0, fromBase);
  const toRange = range.slice(0, toBase);

  let decValue = value.split('').reverse().reduce(function (carry, digit, index) {
    if (fromRange.indexOf(digit) === -1) throw new Error(`Invalid digit \`${digit}\` for base ${fromBase}.`);
    return carry + (fromRange.indexOf(digit) * (Math.pow(fromBase, index)));
  }, 0);

  let newValue = '';
  while (decValue > 0) {
    newValue = toRange[decValue % toBase] + newValue;
    decValue = (decValue - (decValue % toBase)) / toBase;
  }
  return newValue || '0';
};

export const findQuadrant = (point, rect) => {
  const midHeight = rect.height / 2;
  const midWidth = rect.width / 2;

  if (point.x <= midWidth && point.y <= midHeight) {
    return 0;
  } else if (point.x > midWidth && point.y <= midHeight) {
    return 1;
  } else if (point.x > midWidth && point.y > midHeight) {
    return 2;
  } else if (point.x <= midWidth && point.y > midHeight) {
    return 3;
  }
  return -1;
};

export const isPointInRectangle = (point, rect) => {
  if (point.x > rect.x &&
        point.x < (rect.x + rect.width) &&
        point.y > rect.y &&
        point.y < rect.y + rect.height) {
    return true;
  }
  return false;
};

export const constrain = (aNumber, aMin, aMax) => {
  return Math.min(Math.max(parseInt(aNumber, 10), aMin), aMax);
};
