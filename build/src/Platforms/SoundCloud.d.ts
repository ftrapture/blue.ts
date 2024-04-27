declare class SoundCloud {
    readonly blue: any;
    constructor(blue: any);
    search(query: string): Promise<unknown>;
}
export default SoundCloud;
