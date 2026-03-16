'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, ApiResponse } from '@/lib/api/client';

interface User {
  id: string;
  walletAddress: string;
  role: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface NonceResponse {
  message: string;
  expiresAt: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('swarmfund_token');
    if (savedToken) {
      setToken(savedToken);
      apiClient.setToken(savedToken);
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get<{ id: string; walletAddress: string; role: string }>('/api/v1/auth/me');
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      localStorage.removeItem('swarmfund_token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No wallet found. Please install MetaMask or another Web3 wallet.');
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    }) as string[];

    const walletAddress = accounts[0];

    const nonceResponse = await apiClient.post<NonceResponse>('/api/v1/auth/wallet/nonce', {
      walletAddress,
    });

    if (!nonceResponse.success || !nonceResponse.data) {
      throw new Error('Failed to get nonce');
    }

    const message = nonceResponse.data.message;
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, walletAddress],
    }) as string;

    const verifyResponse = await apiClient.post<AuthResponse>('/api/v1/auth/wallet/verify', {
      walletAddress,
      signature,
    });

    if (!verifyResponse.success || !verifyResponse.data) {
      throw new Error('Failed to verify signature');
    }

    const { token: newToken, user: newUser } = verifyResponse.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('swarmfund_token', newToken);
    apiClient.setToken(newToken);
  };

  const disconnect = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('swarmfund_token');
    apiClient.setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, connectWallet, disconnect }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
