import { useState, useEffect } from "react";
import { useApiWithSessionHandling } from "./useApiWithSessionHandling";
import { handleSessionError } from "../utils/sessionErrorHandler";

interface Branch {
  id: number;
  name: string;
  code: string;
  description: string;
}

interface UserProfile {
  id: number;
  name: string;
  login: string;
  role: string;
  phone: string;
  email: string;
  country_of_residence: string;
  operator_type: string;
  operator_type_other: string;
  gender: string;
  state: string;
  user_type: string;
  active: boolean;
  registration_date: string;
  branches: Branch[];
  branch_count: number;
  groups: string[];
  has_branch_access: boolean;
}

interface StoredUserData {
  data: UserProfile;
  timestamp: number;
}

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithSessionHandling } = useApiWithSessionHandling();

  const isDataStale = (timestamp: number) => {
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - timestamp > fiveMinutes;
  };

  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem("userProfile");
        if (storedUser) {
          const parsedUser: StoredUserData = JSON.parse(storedUser);

          if (isDataStale(parsedUser.timestamp)) {
            fetchUserProfile();
          } else {
            setUserProfile(parsedUser.data);
            setLoading(false);
          }
        } else {
          fetchUserProfile();
        }
      } catch (err) {
        console.error("Error loading user from localStorage:", err);
        fetchUserProfile();
      }
    };

    loadUserFromStorage();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchWithSessionHandling(`/api/user_profile`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch user profile");
      }

      // Handle response format from /api/user_profile
      if (result.success && result.data && result.data.id) {
        // Ensure all fields are present with default values if missing
        const userData: UserProfile = {
          id: result.data.id || 0,
          name: result.data.name || "",
          login: result.data.login || "",
          role: result.data.role || "",
          phone: result.data.phone || "",
          email: result.data.email || "",
          country_of_residence: result.data.country_of_residence || "",
          operator_type: result.data.operator_type || "",
          operator_type_other: result.data.operator_type_other || "",
          gender: result.data.gender || "",
          state: result.data.state || "",
          user_type: result.data.user_type || "",
          active: result.data.active || false,
          registration_date: result.data.registration_date || "",
          branches: result.data.branches || [],
          branch_count: result.data.branch_count || 0,
          groups: result.data.groups || [],
          has_branch_access: result.data.has_branch_access || false,
        };

        // Store data with timestamp
        const userDataWithTimestamp: StoredUserData = {
          data: userData,
          timestamp: Date.now(),
        };
        
        localStorage.setItem(
          "userProfile",
          JSON.stringify(userDataWithTimestamp)
        );
        setUserProfile(userData);
        setLoading(false);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      // Handle session expired errors gracefully
      if (handleSessionError(err)) {
        setLoading(false);
        return;
      }
      
      console.error("Error fetching user profile:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch user profile"
      );
      setLoading(false);
    }
  };

  const updateUserProfile = (newProfile: UserProfile) => {
    const userDataWithTimestamp: StoredUserData = {
      data: newProfile,
      timestamp: Date.now(),
    };
    setUserProfile(newProfile);
    localStorage.setItem("userProfile", JSON.stringify(userDataWithTimestamp));
  };

  const clearUserProfile = () => {
    setUserProfile(null);
    localStorage.removeItem("userProfile");
  };

  const refreshUserProfile = () => {
    fetchUserProfile();
  };

  return {
    userProfile,
    loading,
    error,
    fetchUserProfile,
    updateUserProfile,
    clearUserProfile,
    refreshUserProfile,
  };
}
