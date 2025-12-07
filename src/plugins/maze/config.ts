// src/plugins/maze/config.ts

export type MazeGrid = number[][];

export const MAZE_CONFIG = {
  defaultGrid: [
    [4, 4, 4, 4, 4, 4, 4, 4],
    [4, 2, 1, 1, 1, 1, 3, 4], // 2=Départ, 3=Arrivée
    [4, 4, 4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4, 4, 4]
  ] as MazeGrid,

  THEME: {
    0: '⬛', 
    1: '⬜', 
    2: '🟩', 
    3: '🏁', 
    4: '🧱', 
    PLAYER: '🤖' 
  },

  checkMove: (grid: MazeGrid, x: number, y: number): 'WALL' | 'WIN' | 'OK' => {
    if (!grid || !grid[y] || typeof grid[y][x] === 'undefined') return 'WALL';
    const cell = grid[y][x];
    if (cell === 4 || cell === 0) return 'WALL';
    if (cell === 3) return 'WIN';
    return 'OK';
  },

  look: (grid: MazeGrid, x: number, y: number, currentDir: number, lookDir: string) => {
      let testDir = currentDir;
      if (lookDir === 'LEFT') testDir = (currentDir + 3) % 4;
      else if (lookDir === 'RIGHT') testDir = (currentDir + 1) % 4;
      
      let tx = x, ty = y;
      // 0=Est, 1=Sud, 2=Ouest, 3=Nord
      const effectiveDir = ((testDir % 4) + 4) % 4;
      if (effectiveDir === 0) tx++;      
      else if (effectiveDir === 1) ty++; 
      else if (effectiveDir === 2) tx--; 
      else if (effectiveDir === 3) ty--; 

      const result = MAZE_CONFIG.checkMove(grid, tx, ty);
      return result !== 'WALL'; 
  },

  resizeGrid: (oldGrid: MazeGrid, newRows: number, newCols: number): MazeGrid => {
    const newGrid: MazeGrid = [];
    for (let r = 0; r < newRows; r++) {
        const row: number[] = [];
        for (let c = 0; c < newCols; c++) {
            if (oldGrid[r] && oldGrid[r][c] !== undefined) {
                row.push(oldGrid[r][c]);
            } else {
                row.push(4);
            }
        }
        newGrid.push(row);
    }
    return newGrid;
  }
};