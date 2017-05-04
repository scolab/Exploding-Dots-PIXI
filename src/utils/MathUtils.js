export const degToRad = (deg) => {
  return (deg * Math.PI) / 180;
};

export const makeUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
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
    carry += fromRange.indexOf(digit) * (Math.pow(fromBase, index));
    return carry;
  }, 0);

  let newValue = '';
  while (decValue > 0) {
    newValue = toRange[decValue % toBase] + newValue;
    decValue = (decValue - (decValue % toBase)) / toBase;
  }
  return newValue || '0';
};

export const findQuadrant = (point, rect) => {
  const midHeight = rect.height >> 1;
  const midWidth = rect.width >> 1;

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

export const isIntersecting = (r1, r2) => {
  return !(r2.x > (r1.x + r1.width) ||

    (r2.x + r2.width) < r1.x ||

    r2.y > (r1.y + r1.height) ||

    (r2.y + r2.height) < r1.y);
};

export const hitTestRectangle = (r1, r2) => {
    // Define the variables we'll need to calculate
  let hit = false;
  // hit will determine whether there's a collision
  // Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

    // Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

    // Calculate the distance vector between the sprites
  const vx = r1.centerX - r2.centerX;
  const vy = r1.centerY - r2.centerY;

    // Figure out the combined half-widths and half-heights
  const combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  const combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    // Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {
        // A collision might be occuring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {
            // There's definitely a collision happening
      hit = true;
    } else {
            // There's no collision on the y axis
      hit = false;
    }
  } else {
        // There's no collision on the x axis
    hit = false;
  }
    // `hit` will be either `true` or `false`
  return hit;
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
  return aNumber > aMax ? aMax : aNumber < aMin ? aMin : aNumber;
};
