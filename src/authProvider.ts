import type { AuthProvider } from "@refinedev/core";
import axios from "axios";
import { API_URL, TOKEN_KEY } from "./constants";

export const axiosInstance = axios.create();

export const authProvider: AuthProvider = {
  login: async ({ email }) => {
    try {
      console.log("Sending login request to:", `${API_URL}/api/auth/magic-link/send`);
      await axios.post(`${API_URL}/api/auth/magic-link/send`, { email });
      console.log("Login request successful");
      return {
        success: true,
        redirectTo: "/auth/check-email",
      };
    } catch (error) {
      console.error("Login request failed:", error);
      return {
        success: false,
        error: {
          message: "Failed to send login link",
          name: "Login Error",
        },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  onError: async (error) => {
    console.error("Auth request failed:", error);
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      return {
        logout: true,
        redirectTo: "/login",
        error: {
          message: "Authentication failed",
          name: "Authentication Error"
        }
      };
    }
    return { error };
  },

  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      return {
        authenticated: true,
      };
    }
    return {
      authenticated: false,
      logout: true,
      redirectTo: "/login",
    };
  },

  getPermissions: async () => null,
  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }

    try {
      const { data } = await axios.get(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { id, username, email } = data;
      return {
        id,
        name: username,
        email,
      };
    } catch (error) {
      return null;
    }
  },
};

export const verifyMagicLink = async (token: string) => {
  try {
    const { data } = await axios.post(`${API_URL}/api/auth/magic-link/verify`, { token });

    if (data.jwt) {
      localStorage.setItem(TOKEN_KEY, data.jwt);
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${data.jwt}`;

      return {
        success: true,
        redirectTo: "/",
      };
    }

    return {
      success: false,
      error: {
        message: "Invalid token",
        name: "Verification Error",
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "Token verification failed",
        name: "Verification Error",
      },
    };
  }
};
