import { useState } from 'react';
import { authService } from '../services/authService';
import { Account } from '../types/Account';
 

export interface AuthResponse {
  token: string;
  accountId: Account;
}

export interface AuthState {
  accountId: Account | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

export type UseAuthReturn = AuthState & AuthActions;

export const useAuth = (): UseAuthReturn => {
  const [accountId, setAccountId] = useState<Account | null>(null);
  const [loading, setLoading] = useState<boolean>(true);


  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true);
    const response = await authService.login({ email, password });
    setAccountId(response.accountId);
    setLoading(false);
    return response;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setAccountId(null);
  };

  return {
    accountId,
    loading,
    login,
    logout,
    isAuthenticated: !!accountId,
  };
}; 