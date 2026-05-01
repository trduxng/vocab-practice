import apiClient from '../lib/api-client';

export const authService = {
  async register(data: any) {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async login(data: any) {
    const response = await apiClient.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }
};
