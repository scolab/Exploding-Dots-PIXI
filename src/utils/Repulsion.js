import victor from 'victor';
import {constrain} from '../utils/MathUtils';
import {POSITION_INFO} from '../Constants';
export class Repulsion{

    constructor(area) {
        this.movers = [];
        this.G = 1;
        this.mass = 1;
        this.area = area;
    }

    applyForce(item, force) {
        var f = force.divideScalar(this.mass);
        item.acceleration.add(f);
    };

    update(item) {
        item.velocity.add(item.acceleration);
        item.vPosition.add(item.velocity);
        //console.log(item.dot.id, Math.abs(item.x - item.vPosition.x), Math.abs(item.y - item.vPosition.y));
        item.acceleration.multiplyScalar(0);
        if(item.vPosition.x > POSITION_INFO.DOT_RAYON &&
            item.vPosition.y > POSITION_INFO.DOT_RAYON &&
            item.vPosition.x < this.area.width - POSITION_INFO.DOT_RAYON &&
            item.vPosition.y < this.area.height - POSITION_INFO.DOT_RAYON
            ) {
            item.x = item.vPosition.x;
            item.y = item.vPosition.y;
        }
    };


    calculateRepulsion(m1, m2) {
        //console.log('calculateRepulsion');
        let force = new victor(m1.vPosition.x, m1.vPosition.y);
        force = force.subtract(m2.vPosition);
        let distance = force.length();
        if(distance < POSITION_INFO.DOT_RAYON * 2) {
            //console.log('1');
            distance = constrain(distance, 5.0, 25.0);
            force = force.normalize();
            let strength = (this.G * this.mass * this.mass) / (distance * distance);
            force = force.multiplyScalar(strength * -1);
            return force;
        }else{
            //console.log('2');
            return new victor(0,0);
        }
    };


    addItem(item){
        console.log('addItem');
        if(this.movers.indexOf(item) === -1) {
            this.movers.push(item);
            item.vPosition = new victor(item.x, item.y);
            item.velocity = new victor(0, 0);
            item.acceleration = new victor(0, 0);
        }
    }

    removeItem(item){
        console.log('removeItem');
        if(this.movers.indexOf(item) !== -1) {
            this.movers.splice(this.movers.indexOf(item), 1);
            item.velocity = null;
            item.acceleration = null;
        }
    }

    draw() {
        let variableAmount = Number((Math.min(this.movers.length, 99)/1000).toFixed(3));
        for (let i = 0; i < this.movers.length; i++) {
            for (let j = 0; j < this.movers.length; j++) {
                if (i !== j) {
                    let force = this.calculateRepulsion(this.movers[j], this.movers[i]);
                    //console.log(force.length());
                    if(force.length() > 0) {
                        //console.log(this.movers[i].dot.id, force);
                        this.applyForce(this.movers[i], force);
                    }else{
                        /*this.movers[i].acceleration.multiplyScalar(0.9 + variableAmount);
                        this.movers[i].velocity.multiplyScalar(0.9 + variableAmount);*/
                        console.log(0.9 + variableAmount);
                        this.movers[i].acceleration.multiplyScalar(0.999);
                        this.movers[i].velocity.multiplyScalar(0.999);
                    }
                }
            }
            this.update(this.movers[i]);
        }
    }
}




