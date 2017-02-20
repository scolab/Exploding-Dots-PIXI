export const degToRad = (deg) => {
    return deg * Math.PI / 180;
};

export const makeUID = () =>{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};

export const randomFromTo = (min, max) => {
    return Math.floor(Math.random()*(max-min+1)+min);
};

export const convertBase = (value, from_base, to_base) => {
    var range = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('');
    var from_range = range.slice(0, from_base);
    var to_range = range.slice(0, to_base);

    var dec_value = value.split('').reverse().reduce(function (carry, digit, index) {
        if (from_range.indexOf(digit) === -1) throw new Error('Invalid digit `'+digit+'` for base '+from_base+'.');
        return carry += from_range.indexOf(digit) * (Math.pow(from_base, index));
    }, 0);

    var new_value = '';
    while (dec_value > 0) {
        new_value = to_range[dec_value % to_base] + new_value;
        dec_value = (dec_value - (dec_value % to_base)) / to_base;
    }
    return new_value || '0';
};

export const findQuadrant = (point, rect) =>{
    let midHeight = rect.height >> 1;
    let midWidth = rect.width >> 1;

    if(point.x <= midWidth && point.y <= midHeight){
        return 0;
    }else if(point.x > midWidth && point.y <= midHeight){
        return 1;
    }else if(point.x > midWidth && point.y > midHeight){
        return 2;
    }else if(point.x <= midWidth && point.y > midHeight){
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

    //Define the variables we'll need to calculate
    var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision
    hit = false;

    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {
        //A collision might be occuring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {
            //There's definitely a collision happening
            hit = true;
        } else {
            //There's no collision on the y axis
            hit = false;
        }
    } else {
        //There's no collision on the x axis
        hit = false;
    }
    //`hit` will be either `true` or `false`
    return hit;
};

export const isPointInRectangle = (point, rect) => {
    if(point.x > rect.x &&
        point.x < (rect.x + rect.width) &&
        point.y > rect.y &&
        point.y < rect.y + rect.height){
        return true;
    }
    return false;
}
