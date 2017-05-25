import Point = PIXI.Point;
import Rectangle = PIXI.Rectangle;
export const degToRad = (deg: number): number => {
  return (deg * Math.PI) / 180;
};

export const makeUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0; // tslint:disable-line no-bitwise
    const v = c === 'x' ? r : (r & 0x3 | 0x8); // tslint:disable-line no-bitwise
    return v.toString(16);
  });
};

export const randomFromTo = (min: number, max: number): number => {
  return Math.floor((Math.random() * ((max - min) + 1)) + min);
};

export const convertBase = (value: string, fromBase: number, toBase: number): string => {
  const range = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('');
  const fromRange = range.slice(0, fromBase);
  const toRange = range.slice(0, toBase);

  let decValue = value.split('').reverse().reduce((carry, digit, index) => {
    if (fromRange.indexOf(digit) === -1) {
      throw new Error(`Invalid digit \`${digit}\` for base ${fromBase}.`);
    }
    return carry + (fromRange.indexOf(digit) * (Math.pow(fromBase, index)));
  }, 0);

  let newValue = '';
  while (decValue > 0) {
    newValue = toRange[decValue % toBase] + newValue;
    decValue = (decValue - (decValue % toBase)) / toBase;
  }
  return newValue || '0';
};

export const findQuadrant = (point: Point, rect: Rectangle): number => {
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

export const isPointInRectangle = (point: Point, rect: Rectangle): boolean => {
  if (point.x > rect.x &&
        point.x < (rect.x + rect.width) &&
        point.y > rect.y &&
        point.y < rect.y + rect.height) {
    return true;
  }
  return false;
};

export const constrain = (aNumber: number, aMin: number, aMax: number): number => {
  return Math.min(Math.max(aNumber, aMin), aMax);
};
