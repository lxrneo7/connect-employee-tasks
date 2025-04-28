
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.38.236:8000/api/v1';

const localStorageKey = "auth";

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  currentUser: any | null;
}

const getInitialState = (): AuthState => {
  const storedAuth = localStorage.getItem(localStorageKey);
  if (storedAuth) {
    try {
      const authData = JSON.parse(storedAuth);
      return {
        isAuthenticated: authData.isAuthenticated || false,
        accessToken: authData.accessToken || null,
        refreshToken: authData.refreshToken || null,
        expiresAt: authData.expiresAt || null,
        currentUser: authData.currentUser || null,
      };
    } catch (error) {
      console.error("Error parsing auth data from localStorage:", error);
      localStorage.removeItem(localStorageKey);
      return {
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        currentUser: null,
      };
    }
  }
  return {
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    currentUser: null,
  };
};

let authState = getInitialState();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    listener(authState);
  });
};

const setAuth = (auth: Partial<AuthState>) => {
  authState = { ...authState, ...auth };
  localStorage.setItem(localStorageKey, JSON.stringify(authState));
  notifyListeners();
};

const clearAuth = () => {
  authState = {
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    currentUser: null,
  };
  localStorage.removeItem(localStorageKey);
  notifyListeners();
};

const login = async (credentials: { username: string; password: string }) => {
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Login failed");
  }

  const data = await response.json();
  
  if (data.access && data.refresh) {
    await setIntervalAuth(data.access, data.refresh);
  }
  
  return data;
};

const logout = async (): Promise<void> => {
  clearAuth();
};

const refreshAuthToken = async (refreshToken: string): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    clearAuth();
    throw new Error("Failed to refresh token");
  }

  const data = await response.json();
  return data.access;
};

const isAuthenticated = (): boolean => {
  return !!authState.isAuthenticated;
};

const getAccessToken = (): string | null => {
  return authState.accessToken;
};

const getCurrentUser = (): any | null => {
  return authState.currentUser;
};

let refreshInterval: NodeJS.Timeout | null = null;

const startRefreshTokenInterval = (refreshToken: string) => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  refreshInterval = setInterval(async () => {
    try {
      const newAccessToken = await refreshAuthToken(refreshToken);
      setAuth({ accessToken: newAccessToken });
    } catch (error) {
      console.error("Token refresh failed:", error);
      clearInterval(refreshInterval!);
    }
  }, 14 * 60 * 1000);
};

const setIntervalAuth = async (
  accessToken: string,
  refreshToken: string
) => {
  const decodedAccess: { exp: number; user: any } = jwtDecode(accessToken);
  const expiresAt = decodedAccess.exp * 1000;
  const currentUser = decodedAccess.user;

  setAuth({
    isAuthenticated: true,
    accessToken,
    refreshToken,
    expiresAt,
    currentUser,
  });

  startRefreshTokenInterval(refreshToken);
};

export const register = async ({
  username,
  password,
  password_confirm,
  employee_id,
}: {
  username: string;
  password: string;
  password_confirm: string;
  employee_id: number;
}): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, password_confirm, employee_id }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(
        data.detail || data.username?.[0] || 'Ошибка регистрации'
      );
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    throw error;
  }
};

const listeners: ((authState: AuthState) => void)[] = [];

const subscribe = (listener: (authState: AuthState) => void) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

export {
  login,
  logout,
  refreshAuthToken as refreshToken,
  isAuthenticated,
  getAccessToken,
  getCurrentUser,
  setIntervalAuth,
  subscribe,
};

export type AuthStateHook = {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  currentUser: any | null;
};
