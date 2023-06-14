export default interface Controller {
    create<T>(payload: any): Promise<T>;
    update(payload: any): Promise<any>;
    remove(payload: any): Promise<any>;
    filter(payload: any): Promise<any>;
    totalFilter(payload: any): Promise<any>;
}
