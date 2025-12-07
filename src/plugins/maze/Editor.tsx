// src/plugins/maze/Editor.tsx

import React, { useState } from 'react';
import { MAZE_CONFIG, MazeGrid } from './config';

interface MazeEditorProps {
    levelData: any;
    onUpdate: (data: any) => void;
}

export default function MazeEditor({ levelData, onUpdate }: MazeEditorProps) {
  const [selectedTool, setSelectedTool] = useState(4); 

  const startPos = levelData.startPos || { x: 1, y: 1, dir: 1 };
  const grid: MazeGrid = levelData.grid || MAZE_CONFIG.defaultGrid;
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  const tools = [
    { id: 1, label: "Chemin", icon: "⬜" },
    { id: 4, label: "Mur", icon: "🧱" },
    { id: 3, label: "Arrivée", icon: "🏁" },
  ];

  const handleResize = (dRows: number, dCols: number) => {
      const nextRows = Math.max(3, Math.min(50, dRows));
      const nextCols = Math.max(3, Math.min(50, dCols));
      if (nextRows === rows && nextCols === cols) return;
      const newGrid = MAZE_CONFIG.resizeGrid(grid, nextRows, nextCols);
      onUpdate({ ...levelData, grid: newGrid });
  };

  const handleCellClick = (rIndex: number, cIndex: number) => {
    const newGrid = grid.map(row => [...row]);
    
    if (selectedTool === 2) {
        // Enlever l'ancien départ et placer le nouveau
        for(let y=0; y<newGrid.length; y++) {
            for(let x=0; x<newGrid[y].length; x++) {
                if(newGrid[y][x] === 2) newGrid[y][x] = 1;
            }
        }
        newGrid[rIndex][cIndex] = 2;
        onUpdate({ ...levelData, grid: newGrid, startPos: { ...startPos, x: cIndex, y: rIndex } });
    } else {
        newGrid[rIndex][cIndex] = selectedTool;
        onUpdate({ ...levelData, grid: newGrid });
    }
  };

  const updateDirection = (newDir: string) => {
      onUpdate({ ...levelData, startPos: { ...startPos, dir: parseInt(newDir) } });
  };

  const visualRotation = startPos.dir * 90 + 90;

  return (
    <div className="flex flex-col h-full">
      {/* TOOLBAR AVEC TAILWIND */}
      <div className="bg-gray-100 p-3 border-b border-gray-300">
        <div className="flex justify-center gap-5 mb-3 items-center">
            {/* Contrôles de Taille */}
            <div className="flex items-center gap-1 bg-white p-2 rounded-md border border-gray-200 shadow-sm">
                <label className="text-xs font-bold text-gray-700">L:</label>
                <input type="number" min="3" max="50" value={cols} 
                    onChange={(e) => handleResize(rows, parseInt(e.target.value)||3)} 
                    className="w-10 text-center border border-gray-300 rounded-sm text-sm" />
                <span className="text-gray-400">x</span>
                <label className="text-xs font-bold text-gray-700">H:</label>
                <input type="number" min="3" max="50" value={rows} 
                    onChange={(e) => handleResize(parseInt(e.target.value)||3, cols)} 
                    className="w-10 text-center border border-gray-300 rounded-sm text-sm" />
            </div>
            {/* Contrôle de Direction */}
            <div className="flex items-center gap-2">
                <label className="text-sm font-semibold">Direction:</label>
                <input type="range" min="0" max="3" step="1" value={startPos.dir} 
                    onChange={(e) => updateDirection(e.target.value)} className="w-14" />
                <span style={{ transform: `rotate(${visualRotation}deg)` }} className="text-xl transition-transform duration-200">
                    🤖
                </span>
            </div>
        </div>
        {/* Barre d'Outils */}
        <div className="flex justify-center gap-2">
            <button onClick={() => setSelectedTool(2)} 
                    className={`px-3 py-1 text-sm font-medium rounded-lg transition ${selectedTool === 2 ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-green-50'}`}>
                🤖 Départ
            </button>
            {tools.map(tool => (
                <button key={tool.id} onClick={() => setSelectedTool(tool.id)} 
                        className={`px-3 py-1 text-sm font-medium rounded-lg transition ${selectedTool === tool.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50'}`}>
                    {tool.icon} {tool.label}
                </button>
            ))}
        </div>
      </div>
      {/* GRILLE D'ÉDITION */}
      <div className="flex-1 p-5 overflow-hidden flex justify-center items-center bg-gray-300">
        <div className="editor-grid w-full h-full max-w-full max-h-full" style={{
                display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '1px', padding: '2px', backgroundColor: '#34495e',
                aspectRatio: `${cols} / ${rows}`, margin: 'auto'
            }}>
            {grid.map((row, rIndex) => (
                row.map((cell, cIndex) => {
                    const isStart = (cell === 2);
                    const isEnd = (cell === 3);

                    return (
                        <div key={`${rIndex}-${cIndex}`} onClick={() => handleCellClick(rIndex, cIndex)}
                            className="w-full h-full flex justify-center items-center cursor-pointer relative overflow-hidden"
                            style={{ 
                                background: cell === 4 ? '#2c3e50' : (cell === 2 ? '#2ecc71' : (cell === 3 ? '#e74c3c' : '#fff')), 
                            }}>
                            <span style={{fontSize: `min(40px, ${60/Math.max(rows,cols)}vmin)`, opacity: isStart ? 0.3 : 1}}>
                                {isEnd ? '🏁' : (cell === 2 ? '' : MAZE_CONFIG.THEME[cell as keyof typeof MAZE_CONFIG.THEME])}
                            </span>
                            {isStart && (
                                <div style={{ position: 'absolute', transform: `rotate(${visualRotation}deg)`, fontSize: `min(40px, ${60/Math.max(rows,cols)}vmin)`, transition: 'transform 0.2s' }}>
                                    {MAZE_CONFIG.THEME.PLAYER}
                                </div>
                            )}
                        </div>
                    );
                })
            ))}
        </div>
      </div>
    </div>
  );
}