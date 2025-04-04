import { PluginModule, ExtensionPointId, ExtensionComponent } from "./types";

/**
 * Singleton registry that manages all plugins and their extensions
 */
class PluginRegistry {
  private plugins: Map<string, PluginModule> = new Map();
  private extensions: Map<string, ExtensionComponent[]> = new Map();

  /**
   * Register a plugin and all its extensions
   */
  registerPlugin(plugin: PluginModule): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin with ID "${plugin.id}" is already registered.`);
      return;
    }

    // register the plugin
    this.plugins.set(plugin.id, plugin);

    // register all extensions from this plugin
    for (const extension of plugin.extensions) {
      this.registerExtension(extension);
    }

    // initialize plugin if needed
    if (plugin.initialize) {
      try {
        plugin.initialize();
      } catch (error) {
        console.error(`Error initializing plugin "${plugin.id}":`, error);
      }
    }
  }

  /**
   * Register a single extension
   */
  private registerExtension(extension: ExtensionComponent): void {
    const { extensionPointId } = extension;

    // Get the extension point ID string
    const extensionPointIdString =
      this.getExtensionPointIdString(extensionPointId);

    if (!this.extensions.has(extensionPointIdString)) {
      this.extensions.set(extensionPointIdString, []);
    }

    const extensions = this.extensions.get(
      extensionPointIdString
    ) as ExtensionComponent[];
    extensions.push(extension);

    // sort by priority if provided (higher priority first)
    extensions.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Get all extensions for a specific extension point
   */
  getExtensions(
    extensionPointId: ExtensionPointId | string
  ): ExtensionComponent[] {
    const extensionPointIdString =
      this.getExtensionPointIdString(extensionPointId);
    return this.extensions.get(extensionPointIdString) || [];
  }

  /**
   * Helper method to get a consistent string ID from an extension point
   */
  private getExtensionPointIdString(
    extensionPointId: ExtensionPointId | string
  ): string {
    if (typeof extensionPointId === "string") {
      return extensionPointId;
    }

    if (typeof extensionPointId === "object" && extensionPointId.id) {
      return extensionPointId.id;
    }

    // Fallback for any unusual cases
    return String(extensionPointId);
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): PluginModule[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get a specific plugin by ID
   */
  getPlugin(pluginId: string): PluginModule | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Check if a plugin is registered
   */
  hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * Cleanup all registered plugins
   */
  cleanup(): void {
    for (const plugin of this.plugins.values()) {
      if (plugin.cleanup) {
        try {
          plugin.cleanup();
        } catch (error) {
          console.error(`Error cleaning up plugin "${plugin.id}":`, error);
        }
      }
    }

    this.plugins.clear();
    this.extensions.clear();
  }
}

// create a singleton instance
export const pluginRegistry = new PluginRegistry();
