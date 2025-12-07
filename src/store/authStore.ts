// src/store/authStore.ts

import { create } from 'zustand';
import { User, UserRole } from '@/types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    role: UserRole | null;
    login: (user: User, token: string) => void;
    logout: () => void;
    checkAuth: () => void; 
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    role: null,

    login: (user, token) => {
        // Logique de stockage du token
        set({ user, isAuthenticated: true, role: user.role });
    },

    logout: () => {
        // Logique de suppression du token
        set({ user: null, isAuthenticated: false, role: null });
    },

    checkAuth: () => {
        // SIMULATION : Récupération du token et du rôle
        // CHANGEZ ICI pour basculer entre les thèmes Prof et Élève
        const mockUser: User = {
            id: 'mock-123',
            username: 'John.Doe',
            role: 'STUDENT', // <-- RÔLE ACTUEL (Changez à 'PROFESSOR' pour l'éditeur)
        };
        set({ user: mockUser, isAuthenticated: true, role: mockUser.role });
    }
}));