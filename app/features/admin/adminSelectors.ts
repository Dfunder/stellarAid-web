'use client';

import { RootState } from '@/app/store';

// Select all users
export const selectAllUsers = (state: RootState) => state.admin.users;

// Select admin settings
export const selectAdminSettings = (state: RootState) => state.admin.settings;

// Select admin loading state
export const selectAdminLoading = (state: RootState) => state.admin.loading;

// Select admin error
export const selectAdminError = (state: RootState) => state.admin.error;

// Filter users by role
export const selectUsersByRole = (role: string) => (state: RootState) => {
  return state.admin.users.filter((user) => user.role === role);
};

// Get active users
export const selectActiveUsers = (state: RootState) => {
  return state.admin.users.filter((user) => user.isActive);
};

// Get inactive users
export const selectInactiveUsers = (state: RootState) => {
  return state.admin.users.filter((user) => !user.isActive);
};

// Find user by ID
export const selectUserById = (userId: string) => (state: RootState) => {
  return state.admin.users.find((user) => user.id === userId);
};

// Get user count
export const selectUserCount = (state: RootState) => state.admin.users.length;

// Check if maintenance mode is enabled
export const selectMaintenanceMode = (state: RootState) =>
  state.admin.settings?.maintenanceMode || false;
