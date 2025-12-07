// src/plugins/registry.ts

import { Level, LevelCompletionResult, PluginMetrics } from '@/types'; 
import React from 'react';

// --- BasePlugin Interface ---
export interface BasePlugin {
    id: string;
    name: string;
    icon: string; 
    
    RenderComponent: React.ComponentType<{ 
        levelData: Level['level_data']; 
        onLevelComplete: (result: LevelCompletionResult) => void;
        code: string; 
    }>;
    EditorComponent: React.ComponentType<{ 
        levelData: Level['level_data']; 
        onUpdate: (data: Level['level_data']) => void 
    }>;

    // Logique d'exécution (pour la simulation)
    executeStep: (currentState: any, action: string, levelData: any) => { newState: any, status: 'RUNNING' | 'WIN' | 'LOST' };
    
    // Blockly
    registerBlocks: (Blockly: any, javascriptGenerator: any) => void;
    getToolboxXML: () => string;
}

// Import du Plugin MAZE (doit exister)
import MazePlugin from './maze';

// Le Registre qui contient tous les plugins disponibles
export const PluginRegistry: Record<string, BasePlugin> = {
    [MazePlugin.id]: MazePlugin as BasePlugin,
};

export const getPlugin = (id: string): BasePlugin | undefined => {
    return PluginRegistry[id];
};