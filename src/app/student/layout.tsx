// src/app/student/layout.tsx
'use client'; 

import StudentLayout from '@/components/layouts/StudentLayout';
import { useAuthStore } from '@/store/authStore';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
    const { role, checkAuth } = useAuthStore();
    
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);
    
    if (role === null && !useAuthStore.getState().isAuthenticated) {
        // TODO: Rediriger vers la page de connexion si l'authentification échoue
        return <div className="min-h-screen flex items-center justify-center">Vérification de l'authentification...</div>;
    }
    
    if (role === 'PROFESSOR' || role === 'ADMIN') {
        redirect('/professor/dashboard');
    }
    
    if (role === 'STUDENT') {
        return <StudentLayout>{children}</StudentLayout>;
    }
    
    return null; 
}