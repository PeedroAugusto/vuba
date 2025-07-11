import { useState, useEffect, useCallback } from 'react';
import { authService } from '../../services/authService';
import { Account } from '../../types/Account';

const TOKEN_KEY = '@vuba:token';
const ACCOUNT_KEY = '@vuba:account';

export interface AuthResponse {
    token: string;
    accountId: Account;
}

export interface AuthState {
    account: Account | null;
    loading: boolean;
    isAuthenticated: boolean;
    error: Error | null;
}

export interface AuthActions {
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
}

export type UseAuthReturn = AuthState & AuthActions;

export const useAuth = (): UseAuthReturn => {
    const [account, setAccount] = useState<Account | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const loadStoredAuth = useCallback(async () => {
        try {
            const storedToken = localStorage.getItem(TOKEN_KEY);
            const storedAccount = localStorage.getItem(ACCOUNT_KEY);

            if (storedToken && storedAccount) {
                const parsedAccount = JSON.parse(storedAccount) as Account;
                setAccount(parsedAccount);
                // Configura o token no serviço de autenticação
                authService.setToken(storedToken);
            }
        } catch (err) {
            console.error('Erro ao carregar dados de autenticação:', err);
            // Limpa dados potencialmente corrompidos
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(ACCOUNT_KEY);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStoredAuth();
    }, [loadStoredAuth]);

    const login = useCallback(async (email: string, password: string): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const response = await authService.login({ email, password });
            
            // Armazena dados de autenticação
            localStorage.setItem(TOKEN_KEY, response.token);
            localStorage.setItem(ACCOUNT_KEY, JSON.stringify(response.accountId));
            
            setAccount(response.accountId);
            authService.setToken(response.token);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro desconhecido ao fazer login'));
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async (): Promise<void> => {
        setLoading(true);
        try {
            await authService.logout();
        } catch (err) {
            console.error('Erro ao fazer logout:', err);
        } finally {
            // Limpa dados locais independente do resultado do logout
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(ACCOUNT_KEY);
            setAccount(null);
            authService.setToken(null);
            setLoading(false);
        }
    }, []);

    const refreshToken = useCallback(async (): Promise<void> => {
        try {
            const response = await authService.refreshToken();
            localStorage.setItem(TOKEN_KEY, response.token);
            authService.setToken(response.token);
        } catch (err) {
            console.error('Erro ao atualizar token:', err);
            // Se falhar ao atualizar o token, faz logout
            await logout();
        }
    }, [logout]);

    return {
        account,
        loading,
        error,
        isAuthenticated: !!account,
        login,
        logout,
        refreshToken
    };
}; 