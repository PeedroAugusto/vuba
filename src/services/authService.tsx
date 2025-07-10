import api from './api';
import { AuthResponse } from '../hooks/useAuth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthService {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
}

export const authService: AuthService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/Login', credentials);
    const { token, accountId } = response.data;
    localStorage.setItem('token', token);
    return { token, accountId };
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    await api.post('/api/Logout');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
}; 