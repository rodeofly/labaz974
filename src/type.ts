// src/types.ts (Ajoutez/vérifiez ces définitions)
export type ActionType = 'MOVE' | 'TURN' | 'SCAN' | 'LOGIC' | 'COMPLETE';
export interface Action {
    type: ActionType;
    action: string; // La fonction JS appelée (ex: 'moveForward();\n')
    dir?: 'LEFT' | 'RIGHT' | 'SELF'; // Pour les actions comme TURN ou SCAN
    _uid?: number; // Pour forcer la re-déclenchement de l'animation
}

export type GameStatus = 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILURE' | 'ERROR';

export interface PlayerState {
    x: number;
    y: number;
    dir: number; // 0=Est, 1=Sud, 2=Ouest, 3=Nord (convention Maze)
    status: GameStatus;
    actionLog: Action[]; // Séquence complète des actions à jouer
    stepIndex: number; // Index de l'action en cours dans actionLog
}

export interface LevelData {
    grid: number[][]; // (Maze)
    startPos: { x: number; y: number; dir?: number };
    startBlocks?: string; // XML de départ pour Blockly
    // ... autres données spécifiques au plugin
}

export interface Level {
    id: string;
    plugin_id: string;
    name: string;
    description: string;
    level_data: LevelData;
    maxBlocks?: number;
    conditions_de_sortie: any[]; // Non détaillé ici
}