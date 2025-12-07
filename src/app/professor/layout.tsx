// src/app/professor/layout.tsx
'use client'; 

import ProfessorLayout from '@/components/layouts/ProfessorLayout';
import { useAuthStore } from '@/store/authStore';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
    const { role, checkAuth } = useAuthStore();
    
    useEffect(() => {
        // Déclencher la vérification du rôle au chargement
        checkAuth(); 
    }, [checkAuth]);
    
    // Attendre que le rôle soit vérifié (si non authentifié, le rôle est null)
    if (role === null && !useAuthStore.getState().isAuthenticated) {
        // TODO: Rediriger vers la page de connexion si l'authentification échoue
        return <div className="min-h-screen flex items-center justify-center">Vérification de l'authentification...</div>;
    }
    
    if (role === 'STUDENT') {
        redirect('/student/dashboard');
    }
    
    if (role === 'PROFESSOR' || role === 'ADMIN') {
        return <ProfessorLayout>{children}</ProfessorLayout>;
    }

    return null; // Retourne null pendant la redirection ou le chargement
}