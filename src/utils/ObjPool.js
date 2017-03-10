export class ObjPool {

    constructor() {
        this.pool = [];
    }

    get(){
        if(this.pool.length > 0) {
            return this.pool.pop();
        }else{
            return {};
        }
    };

    dispose(objArr) {
        this.pool.concat(objArr);
    };
}

