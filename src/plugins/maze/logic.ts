// src/plugins/maze/logic.ts

import Runner from './Runner';
import { MAZE_CONFIG } from './config';
import { LevelData, PlayerState, Action, GameStatus } from '@/types'; // Assurez-vous d'importer vos types

/**
 * 💡 Utility: Normalise la direction (0-3)
 * @param {number} d - Direction brute
 * @returns {number} Direction normalisée (0: Est, 1: Sud, 2: Ouest, 3: Nord)
 */
const normalizeDir = (d: number): number => ((d % 4) + 4) % 4;

/**
 * 🛠️ Logique pour exécuter une seule étape de commande
 * @param {PlayerState} currentState - État actuel du joueur (x, y, dir)
 * @param {Action | string} action - L'action à effectuer (ex: { type: 'MOVE' } ou 'moveForward();\n')
 * @param {LevelData} levelData - Les données statiques du niveau (grille)
 * @returns {PlayerState} Le nouvel état du joueur
 */
export const executeStep = (
  currentState: PlayerState, 
  action: Action | string, 
  levelData: LevelData
): PlayerState => {
  
  // Utilise l'état actuel ou une position de départ sécurisée si l'état est undefined/null
  const state = currentState || { 
    x: levelData.startPos?.x || 1, 
    y: levelData.startPos?.y || 1, 
    dir: levelData.startPos?.dir !== undefined ? levelData.startPos.dir : 1 
  };
  
  let { x, y, dir } = state;
  let status: GameStatus = 'RUNNING';

  // Détermine la commande à partir de l'objet Action ou de la chaîne de caractères
  const cmd = (typeof action === 'object' && action.type) ? action.type : action;

  // --- COMMANDE DE MOUVEMENT (MOVE) ---
  if (cmd === 'MOVE' || action === 'moveForward();\n') {
    let nextX = x, nextY = y;
    const effectiveDir = normalizeDir(dir);

    // Calcule la nouvelle position basée sur la direction actuelle
    if (effectiveDir === 0) nextX++;      // Est
    else if (effectiveDir === 1) nextY++; // Sud
    else if (effectiveDir === 2) nextX--; // Ouest
    else if (effectiveDir === 3) nextY--; // Nord
    
    // Vérifie si le mouvement est valide (utilise la grille du niveau ou la grille par défaut)
    const gridToCheck = levelData.grid || MAZE_CONFIG.defaultGrid;
    const moveStatus = MAZE_CONFIG.checkMove(gridToCheck, nextX, nextY);

    if (moveStatus === 'OK' || moveStatus === 'WIN') {
      x = nextX; y = nextY;
      if (moveStatus === 'WIN') status = 'SUCCESS'; // Le statut devient 'SUCCESS' si on atteint l'arrivée (3)
    } else {
      // Mouvement sur un mur ou hors limites
      status = 'FAILURE';
    }
  } 
  // --- COMMANDE DE ROTATION (TURN) ---
  else if (cmd === 'TURN' || (typeof action === 'string' && action.includes('turn'))) {
    const turnDirection = typeof action === 'object' && action.dir ? action.dir : (action as string).includes('turnLeft') ? 'LEFT' : 'RIGHT';
    
    if (turnDirection === 'LEFT') {
      dir = (dir + 3) % 4; // Tourne à gauche (-90 deg = +270 deg)
    } else if (turnDirection === 'RIGHT') {
      dir = (dir + 1) % 4; // Tourne à droite (+90 deg)
    }
  }
  // --- COMMANDE DE SCAN (A implémenter si besoin) ---
  else if (cmd === 'SCAN') {
      // Le scan ne change pas la position mais retourne une info (pour l'instant, on ne fait rien)
  }
  
  // Retourne le nouvel état
  return { 
    x, 
    y, 
    dir: normalizeDir(dir), // Assure que la direction reste normalisée
    status,
    actionLog: currentState.actionLog,
    stepIndex: currentState.stepIndex,
  };
};

// --- DÉFINITION DU PLUGIN MAZE ---
export const MazePlugin = {
  id: 'MAZE',
  // Le RunnerComponent est importé depuis './Runner' (doit être renommé Runner.tsx)
  RenderComponent: Runner, 

  /**
   * 1. Définition des blocs et générateurs JS.
   * Cette partie est nécessaire pour l'éditeur Blockly.
   */
  registerBlocks: (Blockly: any, javascriptGenerator: any) => {
    // Définition JSON des blocs
    const blocks = [
      {
        "type": "maze_move_forward",
        "message0": "avancer",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 290,
        "tooltip": "Avance le personnage d'une case."
      },
      {
        "type": "maze_turn",
        "message0": "tourner à %1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "DIRECTION",
            "options": [
              ["gauche", "LEFT"],
              ["droite", "RIGHT"]
            ]
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 290,
        "tooltip": "Tourne le personnage de 90 degrés."
      },
      // ... Ajoutez d'autres blocs comme 'maze_if_path', 'maze_repeat', etc.
    ];

    blocks.forEach(block => Blockly.Blocks[block.type] = { 
        init: function() { this.jsonInit(block); } 
    });

    // Définition des générateurs JS (ce qui est généré par Blockly)
    javascriptGenerator.forBlock['maze_move_forward'] = function() {
      return 'moveForward();\n'; // L'action correspondante dans la simulation
    };
    javascriptGenerator.forBlock['maze_turn'] = function(block: any) {
      const direction = block.getFieldValue('DIRECTION');
      if (direction === 'LEFT') return 'turnLeft();\n'; // L'action correspondante
      return 'turnRight();\n'; // L'action correspondante
    };
  },

  /**
   * 2. Définit les catégories et les blocs disponibles dans la boîte à outils Blockly.
   */
  getToolboxXML: () => {
    // XML du bloc pour le labyrinthe (simple)
    return `<xml id="toolbox" style="display: none">
      <category name="Mouvements" colour="#5b67a5">
        <block type="maze_move_forward"></block>
        <block type="maze_turn"></block>
      </category>
      <category name="Contrôle" colour="#4c979a">
        <block type="controls_repeat_ext">
          <value name="TIMES">
            <shadow type="math_number">
              <field name="NUM">4</field>
            </shadow>
          </value>
        </block>
      </category>
    </xml>`;
  },
  
  // Export explicite de la fonction d'exécution
  executeStep: executeStep, 
  
  // Placeholder pour la récupération de la catégorie (si utilisé)
  getCategory: () => ({
    name: 'Labyrinthe',
    blocks: [
      { name: 'move', type: 'maze_move_forward' },
      { name: 'turn', type: 'maze_turn' }
    ]
  }),
};

// Export par défaut pour l'intégration dans index.ts
export default MazePlugin;