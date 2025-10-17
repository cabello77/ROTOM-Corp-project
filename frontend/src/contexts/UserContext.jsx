import { createContext, useContext, useState, useEffect } from 'react';
import mockUserData from '../data/mockUserData';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const defaultUserFields = {
    avatar: null,
    bio: '',
    joinDate: null,
    bookClubs: [],
    readingProgress: [],
    recentActivity: [],
    friends: 0,
    friendsList: []
  };

  const mergeUserData = (incoming) => {
    if (!incoming) {
      return { ...defaultUserFields, ...mockUserData };
    }
    if (incoming.isDemo) {
      return { ...defaultUserFields, ...mockUserData, ...incoming, isDemo: true };
    }
    return { ...defaultUserFields, ...incoming, isDemo: false };
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(mergeUserData(parsed));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    const merged = mergeUserData(userData);
    console.log("UserContext: Setting user data:", merged);
    setUser(merged);
    localStorage.setItem('user', JSON.stringify(merged));
    console.log("UserContext: User data stored in localStorage");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = mergeUserData({ ...(prev || {}), ...updatedData });
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
