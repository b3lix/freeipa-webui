import { ExtensionPoint } from "./types";

/**
 * All available extension points in the application
 */
export const dashboardContent: ExtensionPoint = {
  id: "dashboardContent",
  displayName: "Dashboard Content",
  description: "Add content to the main dashboard",
};

export const userEditForm: ExtensionPoint = {
  id: "userEditForm",
  displayName: "User Edit Form",
  description: "Add fields to the user edit form",
};

// Navigation extension points
export const navigationItems: ExtensionPoint = {
  id: "navigationItems",
  displayName: "Navigation Items",
  description: "Add items to the main navigation",
};

/**
 * Map of all extension points by ID, useful for lookups
 */
export const extensionPointsMap = {
  dashboardContent,
  userEditForm,
  navigationItems,
};
