// src/types/index.ts

// --- 1. AUTHENTIFICATION & RÔLE ---
export type UserRole = 'PROFESSOR' | 'STUDENT' | 'ADMIN';

export interface User {
    id: string;
    username: string;
    role: UserRole;
}

// --- 2. CONTRAT PLUGIN/NIVEAU ---

// Métriques spécifiques renvoyées par le plugin
export interface PluginMetrics {
    score: number;
    time_ms: number;
    moves?: number; 
    // ... autres métriques
}

// Contrat de la réponse finale du Niveau (le Callback onLevelComplete)
export interface LevelCompletionResult {
    status: 'WIN' | 'LOSE';
    stars: 1 | 2 | 3 | 4; 
    metrics: PluginMetrics;
}

// Définition d'une condition pour déverrouiller le Niveau suivant
export interface NextLevelCondition {
    resultat: 'WIN' | 'LOSE';
    etoiles_min?: 1 | 2 | 3 | 4;
    niveau_suivant_id: string; 

    metrics_condition?: {
        metric_key: keyof PluginMetrics;
        operator: 'LESS_THAN' | 'GREATER_THAN' | 'EQUALS';
        value: number;
    };
}

// Le Modèle de Niveau (stocké dans le Backend)
export interface Level {
    id: string;
    plugin_id: string; 
    name: string;
    description: string;
    level_data: any; // Configuration spécifique du plugin (ex: la grille MAZE)
    conditions_de_sortie: NextLevelCondition[];
}