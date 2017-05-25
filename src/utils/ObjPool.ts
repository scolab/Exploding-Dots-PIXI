export default class ObjPool {

  public static getOne(): any {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return {};
  }

  public static dispose(objArr) {
    this.pool.concat(objArr);
  }

  private static pool: any[] = new Array<any>();
}
