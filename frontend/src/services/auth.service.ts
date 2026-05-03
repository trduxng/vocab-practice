// vocab-practice/frontend/src/services/auth.service.ts
import apiClient from "../lib/api-client";

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
  user: {
    userId: number;
    fullName: string;
    email: string;
    role: "Admin" | "Learner" | "ContentCreator";
  };
};

export const authService = {
  async register(data: RegisterRequest) {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post("/auth/login", data);

    const res: AuthResponse = response.data;

    if (res.token) {
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
    }

    return res;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser() {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  },
};
