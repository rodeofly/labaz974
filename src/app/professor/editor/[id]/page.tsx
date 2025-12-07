// src/app/professor/editor/[id]/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { getPlugin } from '@/plugins/registry'; // Assurez-vous que ce chemin est correct
import { Level, LevelData } from '@/types'; // Assurez-vous que ce chemin est correct
import { Edit3, Code, Save, Grid, Map } from 'lucide-react'; 
import { MAZE_CONFIG } from '@/plugins/maze/config'; // Importez MAZE_CONFIG en haut du fichier

// --- TYPES (À adapter si vos types sont dans un fichier séparé) ---
interface EditorPageProps {
    params: { id: string; }
}
// -----------------------------------------------------------------


// Données Mockées du Niveau (Simule la récupération Backend)
const MOCK_LEVEL_DATA: Level = {
    id: 'lvl_a1',
    plugin_id: 'MAZE', 
    name: 'Niveau d\'Introduction',
    description: 'Créez votre premier Labyrinthe',
    level_data: { 
        grid: [[4, 4, 4, 4, 4], [4, 2, 1, 3, 4], [4, 4, 4, 4, 4]], 
        startPos: { x: 1, y: 1, dir: 0 } // dir: 0 (Est)
    },
    conditions_de_sortie: []
};

// Simuler la fonction getLevelData
const getLevelData = (id: string): Level | null => {
    // Dans une vraie application, elle chargerait les données de l'API
    return id === 'lvl_a1' ? MOCK_LEVEL_DATA : null;
};


export default function LevelEditorPage({ params }: EditorPageProps) {
    
    // 1. Correction de l'avertissement Next.js: Destructuration directe
    const { id: levelId } = params; 
    
    // 2. Chargement du niveau (Simulé)
    const initialLevel = getLevelData(levelId) || MOCK_LEVEL_DATA;
    const [level, setLevel] = useState<Level>(initialLevel);

    // 3. Récupération du plugin et des composants
    const plugin = useMemo(() => getPlugin(level.plugin_id), [level.plugin_id]);
    const EditorComponent = plugin?.EditorComponent;
    const PluginRunner = plugin?.RenderComponent; 
    
    // 4. Fonction de rappel pour mettre à jour l'état du niveau
    const handleLevelDataUpdate = (newLevelData: LevelData) => {
        // newLevelData contient la nouvelle grille, startPos, etc.
        setLevel(prevLevel => ({
            ...prevLevel,
            level_data: {
                ...prevLevel.level_data,
                // On fusionne les nouvelles données avec les anciennes
                ...newLevelData, 
            },
        }));
    };

    // 5. Vérification et Fallback
    if (!EditorComponent || !PluginRunner) {
        return <div className="text-red-500 p-8">Erreur : Plugin {level.plugin_id} non trouvé ou incomplet.</div>;
    }

    // 6. Préparation des props pour Runner et Editor (basé sur l'état 'level')
    const currentLevelData = level.level_data;
    const gridData = currentLevelData?.grid || MAZE_CONFIG.defaultGrid;
    const startPos = currentLevelData?.startPos || { x: 1, y: 1, dir: 1 };
    
    const runnerProps = {
        levelData: { grid: gridData, startPos: startPos },
        playerPos: startPos,
        playerDir: startPos.dir,
    };
    
    return (
        <div className="min-h-screen bg-gray-100 p-4"> 
            
            {/* Titre et actions */}
            <header className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <Edit3 className="w-7 h-7 mr-3" /> Éditeur de Niveau : {level.name}
                </h1>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition flex items-center">
                    <Save className="w-5 h-5 mr-2" /> Enregistrer le Niveau
                </button>
            </header>

            {/* Grille Principale (Éditeur 2/3, Preview 1/3) */}
            <div className="grid grid-cols-3 gap-4 h-[85vh]">
                
                {/* 1. Zone d'édition (2/3 de l'écran) - COLONNE 1 */}
                <div className="col-span-2 flex flex-col bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
                    <h3 className="bg-gray-200 p-3 text-lg font-medium border-b flex items-center">
                        <Grid className="w-5 h-5 mr-2" /> Éditeur de Grille et Logique Blockly
                    </h3>
                    <div className="p-4 flex-1 flex items-center justify-center bg-gray-50 overflow-auto">
                        <EditorComponent 
                            levelData={currentLevelData}
                            onUpdate={handleLevelDataUpdate} // ✅ La fonction est maintenant définie
                        />
                    </div>
                </div>

                {/* 2. Zone de Preview (Runner) (1/3 de l'écran) - COLONNE 2 */}
                <div className="col-span-1 flex flex-col gap-4">
                    {/* Boîte des contrôles du professeur */}
                    <div className="bg-white shadow-xl rounded-lg border border-gray-200 p-4">
                        <h4 className="font-semibold text-gray-700 flex items-center mb-2">
                             <Map className="w-5 h-5 mr-2" /> Aperçu du Labyrinthe
                        </h4>
                        <p className="text-sm text-gray-500">
                            Affiche l'état initial du labyrinthe. Toute modification de grille est visible ici.
                        </p>
                    </div>

                    {/* Affichage du Runner (labyrinthe) */}
                    <div className="flex-1 bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                        <PluginRunner {...runnerProps} />
                    </div>
                </div>
                
            </div>
        </div>
    );
}