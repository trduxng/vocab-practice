// vocab-practice/frontend/src/services/auth.service.ts
import apiClient from "../lib/api-client";
import type { PermissionCode } from "../modules/auth/types/permissions";
import type { GamificationReward } from "../modules/user/types";

type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

type AuthResponse = {
  token: string;
  gamification?: GamificationReward | null;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: "Admin" | "Learner" | "ContentCreator";
    permissions?: PermissionCode[];
  };
};

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// Helper set cookie (client-side)
function setCookie(name: string, value: string, days: number = 1) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export const authService = {
  async register(data: RegisterRequest) {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post("/auth/login", data);

    const res: AuthResponse = response.data;

    if (res.token) {
      // Lưu vào localStorage (cho client-side access)
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      if (res.gamification?.awarded) {
        localStorage.setItem("pendingGamificationReward", JSON.stringify(res.gamification));
      }

      // Lưu vào cookie (cho middleware server-side check)
      setCookie("token", res.token, 1);
      setCookie("user", JSON.stringify(res.user), 1);
    }

    return res;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userProgress");

    deleteCookie("token");
    deleteCookie("user");
  },

  getCurrentUser() {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token && isTokenExpired(token)) {
        this.logout();
        return null;
      }

      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && isTokenExpired(token)) {
        this.logout();
        return null;
      }
      return token;
    }
    return null;
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },
};
