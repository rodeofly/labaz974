// src/components/layouts/StudentLayout.tsx
'use client'; 

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Rocket, Trophy, LogOut, User } from 'lucide-react';

interface StudentLayoutProps {
    children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
    const logout = useAuthStore(state => state.logout);
    const user = useAuthStore(state => state.user);

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Barre de Navigation Supérieure (Header) - Thème Élève */}
            <header className="bg-blue-600 text-white shadow-lg p-4 flex justify-between items-center">
                <Link href="/student/dashboard" className="text-2xl font-black flex items-center tracking-wider">
                    <Rocket className="w-6 h-6 mr-2 text-yellow-400" /> 
                    <span className="hidden sm:inline">QuêteApp</span>
                </Link>
                
                <nav className="flex items-center space-x-4">
                    <Link href="/student/leaderboard" className="p-2 rounded-full hover:bg-blue-700 transition">
                        <Trophy className="w-6 h-6" />
                    </Link>
                    <div className="flex items-center p-2 text-sm">
                        <User className="w-5 h-5 mr-2" /> {user?.username}
                    </div>
                    <button 
                        onClick={logout} 
                        className="p-2 rounded-full bg-blue-700 hover:bg-blue-800 transition duration-150"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </nav>
            </header>

            {/* Contenu Principal */}
            <main className="flex-grow container mx-auto p-4 md:p-8">
                {children}
            </main>

            {/* Footer optionnel */}
            <footer className="p-4 text-center text-gray-500 text-sm border-t border-gray-200">
                © 2024 QuêteApp | Propulsé par la Communauté
            </footer>
        </div>
    );
}