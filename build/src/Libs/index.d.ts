/**
 * Library class
 */
declare class Library {
    /**
     * Instance of the blue client
     */
    blue: any;
    /**
     * Library name
     */
    lib: string;
    constructor(lib: string, blue: any);
    /**
     * Main function to initialize the library
     */
    main(): void;
}
export default Library;
