import Victor from 'victor';
import { TweenMax } from 'gsap';
import { constrain } from '../utils/MathUtils';
import { POSITION_INFO } from '../Constants';

// eslint-disable-next-line import/prefer-default-export
export class ProximityManager {

  constructor(area) {
    this.movers = [];
    this.G = 1;
    this.mass = 1;
    this.area = area;
    this.allDone = true;
  }

  applyForce(item, force) {
    const f = force.divideScalar(this.mass);
    item.acceleration.add(f);
  }

  update(item) {
    // console.log(item.acceleration, item.velocity);
    item.velocity.add(item.acceleration);
    item.vPosition.add(item.velocity);
    item.acceleration.multiplyScalar(0);
    if (item.vPosition.x > POSITION_INFO.DOT_RAYON &&
            item.vPosition.y > POSITION_INFO.DOT_RAYON &&
            item.vPosition.x < this.area.width - POSITION_INFO.DOT_RAYON &&
            item.vPosition.y < this.area.height - POSITION_INFO.DOT_RAYON
            ) {
      /* eslint-disable no-param-reassign */
      item.x = item.vPosition.x;
      item.y = item.vPosition.y;
      /* eslint-enable */
    }
  }

  calculateRepulsion(m1, m2) {
        // console.log('calculateRepulsion');
    let force = new Victor(m1.vPosition.x, m1.vPosition.y);
    force = force.subtract(m2.vPosition);
    let distance = force.length();
    if (distance < POSITION_INFO.DOT_RAYON * 2) {
      distance = constrain(distance, 5.0, 25.0);
      force = force.normalize();
      const strength = (this.G * this.mass * this.mass) / (distance * distance);
      force = force.multiplyScalar(strength * -1);
      return force;
    }
    return new Victor(0, 0);
  }


  addItem(item) {
    // console.log('addItem');
    if (this.movers.indexOf(item) === -1) {
      this.movers.push(item);
      /* eslint-disable no-param-reassign */
      item.vPosition = new Victor(item.x, item.y);
      item.velocity = new Victor(0, 0);
      item.acceleration = new Victor(0, 0);
      /* eslint-enable */
      this.allDone = false;
      TweenMax.delayedCall(5, () => { this.allDone = true; }, null, this);
    }
  }

  removeItem(item) {
        // console.log('removeItem');
    if (this.movers.indexOf(item) !== -1) {
      this.movers.splice(this.movers.indexOf(item), 1);
      /* eslint-disable no-param-reassign */
      item.velocity = null;
      item.acceleration = null;
      /* eslint-enable */
    }
  }

  draw() {
    if (this.allDone === false) {
      let allDone = true;
            // let variableAmount = Number((Math.min(this.movers.length, 99) / 1000).toFixed(3));
      for (let i = 0; i < this.movers.length; i += 1) {
        for (let j = 0; j < this.movers.length; j += 1) {
          if (i !== j) {
            const force = this.calculateRepulsion(this.movers[j], this.movers[i]);
            if (force.length() > 0.001) {
              this.applyForce(this.movers[i], force);
              allDone = false;
            } else {
                            /* this.movers[i].acceleration.multiplyScalar(0.9 + variableAmount);
                            this.movers[i].velocity.multiplyScalar(0.9 + variableAmount);*/
              if (allDone === true) {
                allDone = this.movers[i].acceleration.length() < 0.001;
              }
              this.movers[i].acceleration.multiplyScalar(0.999);
              this.movers[i].velocity.multiplyScalar(0.999);
            }
          }
        }
        this.update(this.movers[i]);
      }
      if (allDone) {
        this.allDone = true;
      }
    }
  }

  destroy() {
    this.movers = [];
  }
}

