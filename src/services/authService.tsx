import api from './api';
import { AuthResponse } from '../hooks/api/useAuth';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthService {
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    isAuthenticated: () => boolean;
    refreshToken: () => Promise<AuthResponse>;
    setToken: (token: string | null) => void;
}

class AuthServiceImpl implements AuthService {
    private token: string | null = null;

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/api/Login', credentials);
        const { token, accountId } = response.data;
        this.setToken(token);
        return { token, accountId };
    }

    async logout(): Promise<void> {
        try {
            await api.post('/api/Logout');
        } finally {
            this.setToken(null);
        }
    }

    isAuthenticated(): boolean {
        return !!this.token;
    }

    async refreshToken(): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/api/RefreshToken');
        const { token, accountId } = response.data;
        this.setToken(token);
        return { token, accountId };
    }

    setToken(token: string | null): void {
        this.token = token;
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }
}

export const authService = new AuthServiceImpl(); 