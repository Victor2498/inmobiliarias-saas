import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    email: string;
    tenant_id: string;
    role: string;
    plan: string;
    name?: string;
    preferences?: {
        theme: 'light' | 'dark';
    };
}

interface AuthState {
    token: string | null;
    user: User | null;
    setAuth: (token: string, user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            setAuth: (token, user) => set({ token, user }),
            logout: () => set({ token: null, user: null }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
