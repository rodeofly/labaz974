// src/app/student/level/[id]/page.tsx
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { getPlugin } from '@/plugins/registry';
import { Level, PlayerState, Action } from '@/types'; // Importez vos types
import { CheckCircle, XCircle, Play, RefreshCw, Star, Code } from 'lucide-react';
import StudentLayout from '@/components/layouts/StudentLayout';
import { useAuthStore } from '@/store/authStore';
import { redirect } from 'next/navigation';

// Import de la configuration du labyrinthe pour les valeurs par défaut
import { MAZE_CONFIG } from '@/plugins/maze/config'; 

// --- Mocks des Données ---

// Données Mockées du Niveau (Doit correspondre à la structure de Level)
const MOCK_LEVEL_DATA: Level = {
    id: 'lvl_a1',
    plugin_id: 'MAZE', 
    name: 'Mon Premier Labyrinthe',
    description: 'Utilise les blocs "avancer" et "tourner" pour atteindre le drapeau 🏁.',
    level_data: { 
        grid: MAZE_CONFIG.defaultGrid, // Utilisation de la grille par défaut
        startPos: { x: 1, y: 1, dir: 1 }, // (1,1) avec direction Sud
        startBlocks: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="maze_move_forward" id="start" x="75" y="34"></block></xml>`
    },
    conditions_de_sortie: [],
    maxBlocks: 5,
};

// Simuler la fonction getLevelData
const getLevelData = (id: string): Level | null => {
    // Dans une vraie application, elle chargerait les données de l'API par 'id'
    return MOCK_LEVEL_DATA;
};

// --- Composant Principal ---

interface RunnerPageProps {
    params: { id: string; }
}

export default function LevelRunnerPage({ params }: RunnerPageProps) {
        // 1. Authentification (Sécurité et Redirection)
    const { role } = useAuthStore();
    useEffect(() => {
        if (role !== 'STUDENT') {
            redirect('/professor/editor/lvl_a1');
        }
    }, [role]);

    // Déstructurez 'id' de params pour un accès plus direct et idiomatique
    const { id: levelId } = params;
    // 2. Récupération des données du niveau (Mockées)
    // Utilisez levelId directement
    const level = useMemo(() => getLevelData(levelId), [levelId]);

    // Fallback si les données ne sont pas chargées ou sont nulles
    if (!level) {
        return <StudentLayout><div className="p-8 text-center text-red-500">Niveau {levelId} non trouvé.</div></StudentLayout>;
    }
    
    // 3. Plugin et Logique d'Exécution
    const plugin = useMemo(() => getPlugin(level.plugin_id), [level.plugin_id]);
    const PluginRunner = plugin?.RenderComponent;
    const executeStep = plugin?.logic?.executeStep; // Récupère la fonction d'exécution (doit exister dans logic.ts)

    // 4. État d'Exécution du Jeu
    const [jsCode, setJsCode] = useState<string>(''); // Code généré par Blockly
    const [isExecuting, setIsExecuting] = useState<boolean>(false);
    
    // Initial State doit être basé sur les données du niveau
    const initialPlayerState: PlayerState = useMemo(() => ({
        x: level.level_data.startPos.x,
        y: level.level_data.startPos.y,
        dir: level.level_data.startPos.dir || 1,
        status: 'IDLE',
        actionLog: [],
        stepIndex: 0,
    }), [level.level_data]);

    const [executionState, setExecutionState] = useState<PlayerState>(initialPlayerState);

    // Réinitialisation si l'ID du niveau change
    useEffect(() => {
        setExecutionState(initialPlayerState);
    }, [initialPlayerState]);


    // 5. Fonctions de Contrôle
    
    // Placeholder pour la mise à jour du code Blockly
    const handleBlocklyCodeUpdate = useCallback((newCode: string) => {
        setJsCode(newCode);
        handleReset(); // Réinitialise l'état à chaque changement de code
    }, []);

    // Fonction pour réinitialiser l'état de l'exécution
    const handleReset = useCallback(() => {
        setIsExecuting(false);
        setExecutionState(initialPlayerState);
    }, [initialPlayerState]);

    // Simuler l'exécution du code pour obtenir la séquence d'actions
    const handleRunCode = useCallback(() => {
        if (!jsCode || executionState.status !== 'IDLE') return;

        // **LOGIQUE À IMPLÉMENTER AVEC BLOCLKY** : 
        // 1. Exécuter le code JS (`jsCode`) dans un environnement sécurisé (worker/iframe).
        // 2. Le code JS doit générer la séquence d'actions (actionLog).

        // --- SIMULATION POUR LA DÉMO ---
        const simulatedActions: Action[] = [
            { type: 'MOVE', action: 'moveForward();\n', _uid: 1 },
            { type: 'TURN', action: 'turnRight();\n', dir: 'RIGHT', _uid: 2 },
            { type: 'MOVE', action: 'moveForward();\n', _uid: 3 },
            { type: 'MOVE', action: 'moveForward();\n', _uid: 4 }, 
        ];
        // -----------------------------
        
        setExecutionState(prev => ({
            ...prev,
            status: 'RUNNING',
            actionLog: simulatedActions, // Charge les actions à jouer
            stepIndex: 0,
        }));
        setIsExecuting(true);
    }, [jsCode, executionState.status]);

    // Logique pour exécuter une étape de l'actionLog
    const executeNextStep = useCallback(() => {
        if (!isExecuting || !executeStep) return;

        const currentAction = executionState.actionLog[executionState.stepIndex];

        if (!currentAction) {
            // Fin des actions, si le statut est toujours RUNNING, c'est une FAILURE
            setIsExecuting(false);
            setExecutionState(prev => ({ 
                ...prev, 
                status: prev.status === 'RUNNING' ? 'FAILURE' : prev.status 
            }));
            return;
        }

        // Appelle la logique du plugin (logic.ts) pour obtenir le nouvel état
        const newState = executeStep(
            { x: executionState.x, y: executionState.y, dir: executionState.dir }, 
            currentAction, 
            level.level_data
        );

        setExecutionState(prev => ({
            ...prev,
            x: newState.x,
            y: newState.y,
            dir: newState.dir,
            status: newState.status,
            stepIndex: prev.stepIndex + 1,
        }));
        
        // Arrête l'exécution si le statut est final
        if (newState.status !== 'RUNNING') {
            setIsExecuting(false);
        }
    }, [isExecuting, executionState, executeStep, level.level_data]);

    // Moteur de jeu : Boucle d'exécution (Game Loop)
    useEffect(() => {
        if (isExecuting && executionState.status === 'RUNNING') {
            const timer = setTimeout(executeNextStep, 500); // Délai entre chaque action
            return () => clearTimeout(timer);
        }
    }, [isExecuting, executionState.stepIndex, executionState.status, executeNextStep]);


    // --- Rendu ---
    
    if (!PluginRunner) {
        return <StudentLayout><div className="p-8 text-center text-red-500">Erreur: Le Runner du plugin {level.plugin_id} est introuvable.</div></StudentLayout>;
    }
    
    // Détermine l'icône et la couleur de statut
    let StatusIcon = Play;
    let statusColor = 'text-gray-500';
    if (executionState.status === 'SUCCESS') { StatusIcon = CheckCircle; statusColor = 'text-green-500'; }
    else if (executionState.status === 'FAILURE' || executionState.status === 'ERROR') { StatusIcon = XCircle; statusColor = 'text-red-500'; }
    else if (executionState.status === 'RUNNING') { StatusIcon = Star; statusColor = 'text-yellow-500'; }

    return (
        <StudentLayout>
            <div className="flex flex-col h-[85vh] lg:flex-row gap-4 p-4">
                
                {/* Zone de Code/Blockly (2/3 de l'écran) */}
                <div className="lg:w-2/3 bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 flex flex-col">
                    <h2 className="bg-blue-600 text-white p-3 text-lg font-bold border-b flex items-center">
                        <Code className="w-5 h-5 mr-2" /> {level.name}
                    </h2>
                    
                    {/* Zone de description/instructions */}
                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-700 italic">{level.description}</p>
                        <p className="mt-2 text-xs font-semibold text-gray-500">Blocs Max: {level.maxBlocks || 'Illimité'}</p>
                    </div>

                    {/* Zone Blockly (Mock) */}
                    <div className="flex-1 p-4 bg-gray-50 flex items-center justify-center">
                        <div className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center flex-col">
                            <p className="text-gray-500 mb-4">Espace de Travail Blockly (à implémenter)</p>
                            <button 
                                onClick={() => handleBlocklyCodeUpdate('CODE_GENERATED')} 
                                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Simuler Code (Démo)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Zone de Simulation (Runner) (1/3 de l'écran) */}
                <div className="lg:w-1/3 flex flex-col gap-4">
                    
                    {/* Console et Contrôles */}
                    <div className="bg-white shadow-xl rounded-lg border border-gray-200 p-4">
                        <h3 className="text-xl font-bold mb-3 flex items-center">
                            <StatusIcon className={`w-6 h-6 mr-2 ${statusColor}`} />
                            Statut: <span className={statusColor}>{executionState.status}</span>
                        </h3>
                        
                        <div className="flex justify-between space-x-2">
                            <button 
                                onClick={handleRunCode} 
                                disabled={isExecuting || executionState.status !== 'IDLE'}
                                className={`flex-1 p-3 rounded-lg text-white font-semibold transition-colors ${isExecuting || executionState.status !== 'IDLE' ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                            >
                                <Play className="w-5 h-5 inline mr-2" /> Exécuter
                            </button>
                            <button 
                                onClick={handleReset}
                                className="w-1/3 p-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                            >
                                <RefreshCw className="w-5 h-5 inline" /> Réinitialiser
                            </button>
                        </div>
                    </div>

                    {/* Zone de Preview du Plugin */}
                    <div className="flex-1 bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                        <PluginRunner 
                            // levelData est l'objet { grid, startPos }
                            levelData={level.level_data} 
                            // playerPos doit contenir l'état actuel du joueur pour le rendu
                            playerPos={{ x: executionState.x, y: executionState.y, dir: executionState.dir }}
                            playerDir={executionState.dir}
                            // lastAction est la dernière action jouée (pour l'animation)
                            lastAction={executionState.actionLog[executionState.stepIndex - 1]}
                        />
                    </div>
                    
                </div>
            </div>
        </StudentLayout>
    );
}