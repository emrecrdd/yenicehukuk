import { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';
import authApi from '../../features/auth/auth.api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage('user', null);
  const [tokens, setTokens] = useLocalStorage('tokens', null);

  const [loading, setLoading] = useState(true);

  // ✅ INIT AUTH (SADECE 1 KEZ)
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!tokens?.accessToken) {
          setUser(null);
          return;
        }

        const res = await authApi.getProfile();
        const data = res.data.data;

        // 🔥 direkt user
        setUser(data);
      } catch (err) {
        console.error('Auth init error:', err);
        setUser(null);
        setTokens(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []); // 🔥 CRITICAL FIX: tokens kaldırıldı

  // LOGIN
  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    const data = res.data.data;

    setUser(data.user);

    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    return res;
  };

  // LOGOUT
  const logout = async () => {
    try {
      if (tokens?.refreshToken) {
        await authApi.logout(tokens.refreshToken);
      }
    } catch (err) {
      console.error(err);
    }

    setUser(null);
    setTokens(null);
  };

  // REGISTER
  const register = async (userData) => {
    return authApi.register(userData);
  };

  // REFRESH
  const refreshTokenFn = async () => {
    try {
      const res = await authApi.refreshToken(tokens?.refreshToken);
      const data = res.data.data;

      setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      return res;
    } catch (err) {
      await logout();
      throw err;
    }
  };

  const value = {
    user,
    tokens,
    loading,

    // 🔥 FIXED AUTH LOGIC
    isAuthenticated: !!tokens?.accessToken,

    login,
    logout,
    register,
    refreshToken: refreshTokenFn,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};