export class ObjPool {

    static _instance = null;
    static _canCreate = true;
    pool;

    static getInstance(){
        if(ObjPool._instance === null){
            ObjPool._instance = new ObjPool();
            ObjPool._canCreate = false;
        }
        return ObjPool._instance;
    }

    constructor() {
        if(ObjPool._canCreate) {
            this.pool = [];
        }else {
            console.log('Use getInstance');
        }
    }

    getOne(){
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

