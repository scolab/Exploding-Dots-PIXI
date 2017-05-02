export class ObjPool {

  static pool = [];

  static getOne() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return {};
  }

  static dispose(objArr) {
    this.pool.concat(objArr);
  }
}

