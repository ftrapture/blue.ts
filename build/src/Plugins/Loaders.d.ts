/**
 * PluginsLoader class for loading plugins.
 */
declare class PluginsLoader {
    /**
     * The name of the plugin loader.
     */
    name: string;
    /**
     * Constructs a new PluginsLoader instance.
     * @param name - The name of the plugin loader.
     */
    constructor(name: string);
    /**
     * Placeholder method for plugin initialization.
     */
    main(): any;
}
export default PluginsLoader;
