import { Reducer } from "@reduxjs/toolkit";
import React from "react";

/**
 * Represents an extension point in the application where plugins can inject content
 */
export interface ExtensionPoint {
  id: string;
  displayName: string;
  description: string;
}

/**
 * All available extension points in the application
 */
const dashboardContent: ExtensionPoint = {
  id: "dashboardContent",
  displayName: "Dashboard Content",
  description: "Add content to the main dashboard",
};

const userEditForm: ExtensionPoint = {
  id: "userEditForm",
  displayName: "User Edit Form",
  description: "Add fields to the user edit form",
};

// Navigation extension points
const navigationItems: ExtensionPoint = {
  id: "navigationItems",
  displayName: "Navigation Items",
  description: "Add items to the main navigation",
};

/**
 * Type for extension point IDs
 */
export type ExtensionPointId =
  | typeof dashboardContent
  | typeof userEditForm
  | typeof navigationItems;

/**
 * Base plugin interface with metadata
 */
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
}

/**
 * Represents a component that extends a specific extension point
 */
export interface ExtensionComponent<T> {
  extensionPointId: ExtensionPointId;
  component: React.ComponentType<T>;
  priority?: number; // Higher priority will be rendered first
  metadata?: Record<string, any>; // Additional metadata if needed
}

/**
 * Complete plugin module interface
 */
export interface PluginModule extends Plugin {
  extensions: ExtensionComponent<any>[];

  // Optional lifecycle hooks
  initialize?: () => void;
  cleanup?: () => void;

  // Optional reducers for Redux integration
  reducers?: Record<string, Reducer>;
}
