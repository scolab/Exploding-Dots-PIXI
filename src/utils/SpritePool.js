export class SpritePool {

    constructor(objConstructor, params) {
        this.pool = [];
        this.objConstructor = objConstructor;
        this.params = params;
    }

    get(){
        if(this.pool.length > 0) {
            return this.pool.pop();
        }else{
            return null;
        }
    };

    dispose(obj) {
        this.pool.push(obj);
    };
}
