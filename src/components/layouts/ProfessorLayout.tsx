// src/components/layouts/ProfessorLayout.tsx
'use client'; 

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { BookA, Palette, LogOut, User } from 'lucide-react'; 

interface ProfessorLayoutProps {
    children: React.ReactNode;
}

export default function ProfessorLayout({ children }: ProfessorLayoutProps) {
    const logout = useAuthStore(state => state.logout);
    const user = useAuthStore(state => state.user);

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Barre Latérale (Nav) - Thème Professeur */}
            <aside className="w-64 bg-gray-800 text-white shadow-xl flex flex-col p-4">
                <div className="text-xl font-bold mb-6 flex items-center text-cyan-400">
                    <Palette className="w-6 h-6 mr-2" /> 
                    <span className="uppercase tracking-widest">Éditeur PRO</span>
                </div>
                
                <nav className="flex-grow space-y-2">
                    <Link href="/professor/dashboard" className="flex items-center p-2 rounded-lg text-gray-200 hover:bg-orange-600 transition duration-150">
                        <BookA className="w-5 h-5 mr-3" />
                        Gestion des Quêtes
                    </Link>
                    <Link href="/professor/plugins" className="flex items-center p-2 rounded-lg text-gray-200 hover:bg-orange-600 transition duration-150">
                        <Palette className="w-5 h-5 mr-3" />
                        Plugins
                    </Link>
                </nav>

                <div className="pt-4 border-t border-gray-700">
                    <div className="flex items-center p-2 mb-2 text-sm text-gray-400">
                         <User className="w-4 h-4 mr-2" /> {user?.username} ({user?.role})
                    </div>
                    <button 
                        onClick={logout} 
                        className="w-full flex items-center justify-center p-2 rounded-lg bg-orange-700 hover:bg-orange-600 transition duration-150 text-white"
                    >
                        <LogOut className="w-5 h-5 mr-2" /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* Contenu Principal */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}