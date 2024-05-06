/**
 * PluginsLoader class for loading plugins.
 */
class PluginsLoader {
    /**
     * The name of the plugin loader.
     */
    public name: string;

    /**
     * Constructs a new PluginsLoader instance.
     * @param name - The name of the plugin loader.
     */
    constructor(name: string) {
        this.name = name;
    }

    /**
     * Placeholder method for plugin initialization.
     */
    public main(): any { }
}

export default PluginsLoader;
