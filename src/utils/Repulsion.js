//import PVector from 'processing-js/src/Objects/PVector';
import victor from 'victor';
import {constrain} from '../utils/MathUtils';
export class Repulsion{

    constructor(area) {
        this.movers = [];
        this.G = 1;
        this.mass = 1;
        this.area = area;
        /*this.position = new PVector(x, y);
        this.velocity = new PVector(0, 0);
        this.acceleration = new PVector(0, 0);*/
    }

    applyForce(item, force) {
        /*var f = victor.div(force, this.mass);
        item.acceleration.add(f);*/
    };

    update(item) {
        //console.log(item.position, item.acceleration, item.velocity);
        //item.velocity.add(item.acceleration);
        /*item.position.add(item.velocity);
        item.acceleration.mult(0);
        item.x = item.position.x;
        item.y = item.position.y;*/
    };

    calculateRepulsion(m1, m2) {
        /*let force = PVector.sub(m1.position, m2.position);
        let distance = force.mag();
        distance = constrain(distance, 5.0, 25.0);
        force.normalize();
        let strength = (this.G * this.mass * m.mass) / (distance * distance);
        force.mult(strength * -1);
        return force;*/
    };


    addItem(item){
        if(this.movers.indexOf(item) === -1) {
            this.movers.push(item);
            item.position = new victor(item.x, item.y);
            item.velocity = new victor(0, 0);
            item.acceleration = new victor(0, 0);
        }
    }

    removeItem(item){
        if(this.movers.indexOf(item) !== -1) {
            this.movers.splice(this.movers.indexOf(item), 1);
            item.velocity = null;
            item.acceleration = null;
        }
    }

    draw() {
        for (let i = 0; i < this.movers.length; i++) {
            for (let j = 0; j < this.movers.length; j++) {
                if (i !== j) {
                    let force = this.calculateRepulsion(this.movers[j], this.movers[i]);
                    //this.applyForce(this.movers[i], force);
                }
            }
            this.update(this.movers[i]);
        }
    }
}




