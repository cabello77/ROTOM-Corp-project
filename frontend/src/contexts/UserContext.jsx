import { createContext, useContext, useEffect, useMemo, useState } from "react";

const UserContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const STORAGE_KEY = "user";

const normalizeUser = (user) => {
  if (!user) return null;

  const canonicalUsername =
    user.username ??
    user.profile?.username ??
    "";

  return {
    id: user.id,

    fullName: user.profile?.fullName || user.name || "",

    username: canonicalUsername,

    email: user.email,
    createdAt: user.createdAt,

    profile: {
      fullName: user.profile?.fullName || "",
      bio: user.profile?.bio || "",
      profilePicture: user.profile?.profilePicture || null,
      joinDate: user.profile?.joinDate || null,
      username: canonicalUsername,
    },

    bookClubs: user.bookClubs ?? [],
    friends: user.friends ?? 0,
    friendsList: user.friendsList ?? [],
    readingProgress: user.readingProgress ?? [],
    recentActivity: user.recentActivity ?? [],
  };
};


const getErrorMessage = async (response) => {
  try {
    const data = await response.json();
    return data?.error || response.statusText || "Request failed";
  } catch {
    return response.statusText || "Request failed";
  }
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveUser = (data) => {
    const normalized = normalizeUser(data);
    setUser(normalized);

    if (normalized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    return normalized;
  };

  const fetchUser = async (id) => {
    const response = await fetch(`${API_BASE}/api/users/${id}`);
    if (!response.ok) throw new Error(await getErrorMessage(response));

    const data = await response.json();
    return saveUser(data);
  };

  const signup = async ({ fullName, email, username, password }) => {
    const response = await fetch(`${API_BASE}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        email,
        username,
        password,
      }),
    });

    if (!response.ok) throw new Error(await getErrorMessage(response));

    const data = await response.json();
    return saveUser(data.user);
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error(await getErrorMessage(response));

    const data = await response.json();
    return saveUser(data.user);
  };

  const logout = () => saveUser(null);


  /******************************************
   * 📌 FIXED updateProfile
   * - maps fullName correctly
   * - sends username correctly
   * - DOES NOT transform username at all
   ******************************************/
  const updateProfile = async (id, payload) => {
    console.log("🔥 FRONTEND sending payload to backend:", payload);

    const response = await fetch(`${API_BASE}/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.fullName,
        email: payload.email,
        profile: {
          bio: payload.profile.bio,
          username: payload.profile.username,  // ✔ correct
        }
      }),
    });

    if (!response.ok) throw new Error(await getErrorMessage(response));

    const data = await response.json();
    return saveUser(data.user);
  };



  const uploadAvatar = async (id, file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch(`${API_BASE}/api/users/${id}/avatar`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error(await getErrorMessage(response));

    const data = await response.json();
    return saveUser(data.user);
  };

  // restore login state
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setIsLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (!parsed?.id) {
        localStorage.removeItem(STORAGE_KEY);
        setIsLoading(false);
        return;
      }

      setUser(normalizeUser(parsed));

      fetchUser(parsed.id)
        .catch(() => {
          localStorage.removeItem(STORAGE_KEY);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      signup,
      login,
      logout,
      fetchUser,
      updateProfile,
      uploadAvatar,
    }),
    [user, isLoading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
