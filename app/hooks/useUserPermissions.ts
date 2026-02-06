"use client";

import { useMemo } from "react";

interface Permission {
  id: number;
  name: string;
  code: string;
}

interface Module {
  id: number;
  name: string;
  code: string;
  permissions: Permission[];
}

/**
 * Hook to check user module permissions
 * Returns functions to check if user can view or add for specific modules
 */
export function useUserPermissions() {
  const modules = useMemo<Module[]>(() => {
    if (typeof window === "undefined") return [];
    
    try {
      const stored = localStorage.getItem("userModules");
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error parsing user modules:", error);
      return [];
    }
  }, []);

  /**
   * Check if user has a specific permission for a module
   * @param moduleCode - The module code (e.g., "membership", "factory_verification", "certificate_origin")
   * @param permissionCode - The permission code (e.g., "can_view", "can_add")
   * @returns boolean
   */
  const hasPermission = (moduleCode: string, permissionCode: string): boolean => {
    const module = modules.find((m) => m.code === moduleCode);
    if (!module) return false;
    
    return module.permissions.some((p) => p.code === permissionCode);
  };

  /**
   * Check if user can view a specific module
   */
  const canView = (moduleCode: string): boolean => {
    return hasPermission(moduleCode, "can_view");
  };

  /**
   * Check if user can add/create in a specific module
   */
  const canAdd = (moduleCode: string): boolean => {
    return hasPermission(moduleCode, "can_add");
  };

  /**
   * Get all modules the user has access to
   */
  const getUserModules = (): Module[] => {
    return modules;
  };

  return {
    modules,
    hasPermission,
    canView,
    canAdd,
    getUserModules,
  };
}

