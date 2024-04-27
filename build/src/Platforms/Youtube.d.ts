declare class Youtube {
    readonly blue: any;
    constructor(blue: any);
    search(query: string, type?: string): Promise<unknown>;
}
export default Youtube;
