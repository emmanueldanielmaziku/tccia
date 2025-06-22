import { useState, useEffect } from "react";

interface UserProfile {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  company?: string;
  phone?: string;
  state?: string;
}

interface StoredUserData {
  data: UserProfile;
  timestamp: number;
}

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchUserProfile = async (userId: string = "7") => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/user_profile?id=${userId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch user profile");
      }

      if (result.success && result.data) {
        // Store data with timestamp
        const userDataWithTimestamp: StoredUserData = {
          data: result.data,
          timestamp: Date.now(),
        };
        localStorage.setItem(
          "userProfile",
          JSON.stringify(userDataWithTimestamp)
        );
        setUserProfile(result.data);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch user profile"
      );
    } finally {
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

  const refreshUserProfile = (userId: string = "7") => {
    fetchUserProfile(userId);
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
