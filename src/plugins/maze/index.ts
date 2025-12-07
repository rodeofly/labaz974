// src/plugins/maze/index.ts

// src/plugins/maze/index.ts
import { MazePlugin } from './logic'; // Resolves to logic.ts
import Editor from './Editor'; // Resolves to Editor.tsx
import Runner from './Runner'; // Resolves to Runner.tsx
import { MAZE_CONFIG } from './config'; // Resolves to config.ts

export default {
    id: 'MAZE',
    name: 'Labyrinthe',
    icon: '🏰',
    ...MazePlugin,
    RenderComponent: Runner,
    EditorComponent: Editor,
    config: MAZE_CONFIG
};


// --- Implémentation des fonctions de logic.js ---
const registerBlocks = (Blockly: any, javascriptGenerator: any) => {
    // Définition JSON des blocs (Copié de logic.js)
    const blocks = [
        {"type": "maze_move_forward", "message0": "avancer", "previousStatement": null, "nextStatement": null, "colour": 290, "tooltip": "Avance le personnage d'une case."},
        {"type": "maze_turn", "message0": "tourner à %1", "args0": [{"type": "field_dropdown", "name": "DIRECTION", "options": [["gauche", "LEFT"], ["droite", "RIGHT"]]}], "previousStatement": null, "nextStatement": null, "colour": 290, "tooltip": "Tourne le personnage de 90 degrés."},
        {"type": "maze_if_path", "message0": "si chemin %1 %2", "args0": [{"type": "field_dropdown", "name": "DIRECTION", "options": [["devant", "AHEAD"], ["à gauche", "LEFT"], ["à droite", "RIGHT"]]}, {"type": "input_statement", "name": "DO"}], "previousStatement": null, "nextStatement": null, "colour": 210, "tooltip": "Exécute si un chemin existe."},
        {"type": "maze_forever", "message0": "répéter jusqu'à l'arrivée %1 %2", "args0": [{"type": "input_dummy"}, {"type": "input_statement", "name": "DO"}], "previousStatement": null, "colour": 120, "tooltip": "Boucle jusqu'à la fin du niveau."}
    ];

    Blockly.common.defineBlocksWithJsonArray(blocks);

    // Générateurs JavaScript
    javascriptGenerator.forBlock['maze_move_forward'] = function() { return 'moveForward();\n'; };
    javascriptGenerator.forBlock['maze_turn'] = function(block: any) { const dir = block.getFieldValue('DIRECTION'); return `turn("${dir}");\n`; };
    javascriptGenerator.forBlock['maze_if_path'] = function(block: any) {
      const dir = block.getFieldValue('DIRECTION');
      const branch = javascriptGenerator.statementToCode(block, 'DO');
      return `if (isPath("${dir}")) {\n${branch}}\n`;
    };
    javascriptGenerator.forBlock['maze_forever'] = function(block: any) {
      const branch = javascriptGenerator.statementToCode(block, 'DO');
      return `while (true) {\n${branch}}\n`;
    };
};

const getToolboxXML = () => {
    return `
      <category name="Labyrinthe" colour="#5C81A6">
        <block type="maze_move_forward"></block>
        <block type="maze_turn">
            <field name="DIRECTION">LEFT</field>
        </block>
        <block type="maze_if_path">
            <field name="DIRECTION">AHEAD</field>
        </block>
        <block type="maze_forever"></block>
      </category>
    `;
};

const executeStep = (currentState: any, action: string, levelData: any): { newState: any, status: 'RUNNING' | 'WIN' | 'LOST' } => {
    // Logique d'exécution copiée de logic.js, adaptée aux types TS
    const state = currentState || { 
        x: levelData.startPos?.x || 0, 
        y: levelData.startPos?.y || 1, 
        dir: levelData.startPos?.dir !== undefined ? levelData.startPos.dir : 1 
    };
      
    let { x, y, dir } = state;
    let status: 'RUNNING' | 'WIN' | 'LOST' = 'RUNNING';

    const cmd = action; 
    const normalizeDir = (d: number) => ((d % 4) + 4) % 4;

    if (cmd === 'moveForward();\n') {
        let nextX = x, nextY = y;
        const effectiveDir = normalizeDir(dir);
        if (effectiveDir === 0) nextX++;      
        else if (effectiveDir === 1) nextY++; 
        else if (effectiveDir === 2) nextX--; 
        else if (effectiveDir === 3) nextY--; 
        
        const moveStatus = MAZE_CONFIG.checkMove(levelData.grid || MAZE_CONFIG.defaultGrid, nextX, nextY);
        if (moveStatus === 'OK' || moveStatus === 'WIN') {
            x = nextX; y = nextY;
            if (moveStatus === 'WIN') status = 'WIN';
        } else {
            status = 'LOST';
        }
    } else if (cmd.includes('turn("LEFT")')) {
        dir = dir - 1;
    } else if (cmd.includes('turn("RIGHT")')) {
        dir = dir + 1;
    }
    // Note: La logique pour 'if (isPath)' doit être gérée par l'interpréteur JavaScript hôte. 
    // Ici, nous simulerons l'exécution d'une instruction à la fois.

    return { newState: { x, y, dir }, status };
};


// Export final du Plugin
const MazePlugin: BasePlugin = {
    id: 'MAZE',
    name: 'Labyrinthe',
    icon: '🏰',
    RenderComponent: Runner,
    EditorComponent: Editor,
    registerBlocks: registerBlocks,
    getToolboxXML: getToolboxXML,
    executeStep: executeStep,
};

export default MazePlugin;