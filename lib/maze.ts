export interface Cell {
  x: number;
  y: number;
  visited: boolean;
  walls: [boolean, boolean, boolean, boolean];
}

export interface MazePoint {
  x: number;
  y: number;
}

// NEW: invisible anchor system
export interface MazeAnchor {
  x: number;
  y: number;
}

const DIRS = [
  { dx: 0, dy: -1, wall: 0, opposite: 2 },
  { dx: 1, dy: 0, wall: 1, opposite: 3 },
  { dx: 0, dy: 1, wall: 2, opposite: 0 },
  { dx: -1, dy: 0, wall: 3, opposite: 1 },
];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function manhattanDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

export function generateMaze(cols: number, rows: number): Cell[][] {
  const maze: Cell[][] = [];

  // ============================
  // CREATE GRID
  // ============================
  for (let y = 0; y < rows; y++) {
    const row: Cell[] = [];

    for (let x = 0; x < cols; x++) {
      row.push({
        x,
        y,
        visited: false,
        walls: [true, true, true, true],
      });
    }

    maze.push(row);
  }

  // ============================
  // RECURSIVE BACKTRACKER
  // ============================
  function carve(cx: number, cy: number) {
    maze[cy][cx].visited = true;

    const directions = shuffle(DIRS);

    for (const dir of directions) {
      const nx = cx + dir.dx;
      const ny = cy + dir.dy;

      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;

      const next = maze[ny][nx];
      if (next.visited) continue;

      maze[cy][cx].walls[dir.wall] = false;
      next.walls[dir.opposite] = false;

      carve(nx, ny);
    }
  }

  carve(0, 0);

  // ===================================
  // MAZE EXTRA COMPLEXITY (UNCHANGED)
  // ===================================
  const extraConnections = Math.floor((cols * rows) / 45);

  let opened = 0;
  let attempts = 0;

  while (opened < extraConnections && attempts < 10000) {
    attempts++;

    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);

    const dirs = shuffle(DIRS);

    for (const dir of dirs) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;

      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;

      const current = maze[y][x];
      const neighbor = maze[ny][nx];

      if (!current.walls[dir.wall]) continue;

      current.walls[dir.wall] = false;
      neighbor.walls[dir.opposite] = false;

      opened++;
      break;
    }
  }

  // ===================================
  // LONG RANDOM CORRIDORS (UNCHANGED)
  // ===================================
  const corridorCount = Math.floor(cols / 2);

  for (let i = 0; i < corridorCount; i++) {
    let x = Math.floor(Math.random() * cols);
    let y = Math.floor(Math.random() * rows);

    const dir = DIRS[Math.floor(Math.random() * 4)];
    const length = 4 + Math.floor(Math.random() * 8);

    for (let j = 0; j < length; j++) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;

      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) break;

      maze[y][x].walls[dir.wall] = false;
      maze[ny][nx].walls[dir.opposite] = false;

      x = nx;
      y = ny;
    }
  }

  // ===================================
  // DEAD END COLLECTION (UNCHANGED)
  // ===================================
  const deadEnds: MazePoint[] = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = maze[y][x];

      let openings = 0;
      for (let i = 0; i < 4; i++) {
        if (!cell.walls[i]) openings++;
      }

      if (openings === 1) {
        const dist = manhattanDistance(x, y, 0, 0);

        if (dist > cols / 2) {
          deadEnds.push({ x, y });
        }
      }
    }
  }

  // ===================================
  // ❗ NEW: EDGE + CORNER ANCHOR SYSTEM
  // ===================================

  const anchors: MazeAnchor[] = [];

  const isEdge = (x: number, y: number) =>
    x === 0 || y === 0 || x === cols - 1 || y === rows - 1;

  const isCorner = (x: number, y: number) =>
    (x === 0 && y === 0) ||
    (x === 0 && y === rows - 1) ||
    (x === cols - 1 && y === 0) ||
    (x === cols - 1 && y === rows - 1);

  // collect ALL edge + corner candidates
  const edgeCandidates: MazeAnchor[] = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (isEdge(x, y)) {
        edgeCandidates.push({ x, y });
      }
    }
  }

  // shuffle edge pool
  const shuffled = shuffle(edgeCandidates);

  // pick exactly 6 anchors
  for (let i = 0; i < Math.min(6, shuffled.length); i++) {
    anchors.push(shuffled[i]);
  }

  // ensure corners are strongly preferred
  const corners = anchors.filter(a => isCorner(a.x, a.y));
  const nonCorners = anchors.filter(a => !isCorner(a.x, a.y));

  // rebuild with bias: corners first
  const finalAnchors = [...corners, ...nonCorners].slice(0, 6);

  // fallback safety
  while (finalAnchors.length < 6) {
    finalAnchors.push({
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    });
  }

  // ===================================
  // REAL EXIT (ONLY ONE VISIBLE POINT)
  // ===================================

  const realExit =
    finalAnchors[Math.floor(Math.random() * finalAnchors.length)];

  // ===================================
  // IMPORTANT: ONLY REAL EXIT IS USED BY CANVAS
  // ===================================

  const destinations: MazePoint[] = [realExit];

  // ===================================
  // ATTACH METADATA
  // ===================================
  (maze as Cell[][] & {
    destinations: MazePoint[];
    realExit: MazePoint;
    anchors: MazeAnchor[];
  }).destinations = destinations;

  (maze as Cell[][] & {
    destinations: MazePoint[];
    realExit: MazePoint;
    anchors: MazeAnchor[];
  }).realExit = realExit;

  (maze as Cell[][] & {
    destinations: MazePoint[];
    realExit: MazePoint;
    anchors: MazeAnchor[];
  }).anchors = finalAnchors;

  // ===================================
  // CLEANUP
  // ===================================
  for (const row of maze) {
    for (const cell of row) {
      cell.visited = false;
    }
  }

  return maze;
}