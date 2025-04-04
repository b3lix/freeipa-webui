import { PluginModule } from "src/core/plugins/types";
import Greeting from "./components/Greeting";
import { dashboardContent } from "src/core/plugins/extensionPoints";

/**
 * Hello World plugin definition
 */
const helloWorldPlugin: PluginModule = {
  id: "hello-world",
  name: "Hello World",
  version: "1.0.0",
  description: "A simple Hello World plugin for FreeIPA WebUI",
  author: "FreeIPA Team",

  extensions: [
    {
      extensionPointId: dashboardContent,
      component: Greeting as React.ComponentType,
      priority: 10,
    },
  ],

  initialize: () => {
    // possible logic for initializing plugin, logging and so...
    console.log("Hello World plugin initialized");
  },

  cleanup: () => {
    // possible logic for cleaning up plugin, logging and so...
    console.log("Hello World plugin cleaned up");
  },
};

export default helloWorldPlugin;
