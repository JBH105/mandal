import { useState, useEffect } from 'react';
import { useMandalUser } from './useMandalUser';

// Function to get role from token in session storage
const getRoleFromToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Try to get token from sessionStorage first
    const token = sessionStorage.getItem('token');
    
    if (!token) {
      // Fallback to localStorage if sessionStorage doesn't have token
      const fallbackToken = localStorage.getItem('token');
      if (!fallbackToken) return null;
      
      // Parse the token to get role (assuming JWT token)
      const tokenPayload = JSON.parse(atob(fallbackToken.split('.')[1]));
      return tokenPayload?.role || null;
    }
    
    // Parse the token to get role (assuming JWT token)
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    return tokenPayload?.role || null;
  } catch (error) {
    console.error('Error parsing token for role:', error);
    return null;
  }
};

// Function to get user data from session storage
const getUserFromStorage = (): Record<string, unknown> | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export function useUserProfile() {
  const { mandalUser, isLoading: mandalLoading } = useMandalUser();
  // console.log("🚀 ~ useUserProfile ~ mandalUser:", mandalUser);
  
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeUser = (): void => {
      try {
        // Get role from token
        const role = getRoleFromToken();
        setUserRole(role);
        console.log("🚀 ~ Role from token:", role);

        // Check if user is authenticated (has token)
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        setIsAuthenticated(!!token);

      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Check if user is admin - use only token role
  const isAdmin: boolean = userRole === 'admin';

  // Get display name - for admin show "Admin", for mandal show mandal name
  const getDisplayName = (): string => {
    if (isAdmin) {
      return 'Admin';
    }
    return mandalUser?.mandalName || 'Mandal';
  };

  const getUserInitials = (): string => {
    const displayName = getDisplayName();
    
    if (displayName === 'Admin') return 'A';
    if (displayName === 'Mandal') return 'M';
    
    return displayName.charAt(0).toUpperCase();
  };

  const getPhoneNumber = (): string => {
    if (isAdmin) {
      return ''; // No phone number for admin
    }
    return mandalUser?.phoneNumber || 'Not provided';
  };

  const getRoleDisplay = (): string => {
    return isAdmin ? 'Admin' : 'Mandal';
  };

  // Function to update role (useful when admin logs in)
  const updateRole = (role: string): void => {
    setUserRole(role);
  };

  const logout = (): void => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");
    setUserRole(null);
    setIsAuthenticated(false);
  };

  /**
   * updateUser
   * - Avoids `any` by accepting `Record<string, unknown> | null`.
   * - Runtime-safe: tries to stringify and will log and skip if not serializable.
   */
  const updateUser = (userData: Record<string, unknown> | null): void => {
    console.log('Update user called:', userData);

    if (typeof window === 'undefined') return;
    if (!userData) {
      // If null, remove stored user
      sessionStorage.removeItem("user");
      return;
    }

    try {
      // Ensure it's serializable
      const serialized = JSON.stringify(userData);
      sessionStorage.setItem("user", serialized);
    } catch (err) {
      console.error('Failed to serialize userData for storage:', err);
    }
  };

  return {
    user: getUserFromStorage(),
    mandalUser,
    isLoading: isLoading || mandalLoading,
    isAuthenticated,
    isAdmin,
    userRole,
    updateUser,
    updateRole,
    logout,
    getUserInitials,
    getDisplayName,
    getPhoneNumber,
    getRoleDisplay,
  };
}
