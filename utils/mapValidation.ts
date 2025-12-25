export type MapIssueKind =
  | 'invalid-char'
  | 'player-count'
  | 'open-boundary'
  | 'touches-void'
  | 'empty-line';

export interface MapIssue {
  kind: MapIssueKind;
  message: string;
  x?: number;
  y?: number;
}

export interface ValidatedMap {
  width: number;
  height: number;
  grid: string[][];
  issues: MapIssue[];
  playerCount: number;
}

const PLAYER_CHARS = new Set(['N', 'S', 'E', 'W']);
const ALLOWED = new Set(['0', '1', ' ', 'N', 'S', 'E', 'W']);

function isWalkable(ch: string) {
  return ch === '0' || PLAYER_CHARS.has(ch);
}

/**
 * Educational validator matching common cub3D expectations:
 * - Allowed chars only
 * - Exactly one player
 * - Map must be closed: any walkable tile cannot touch void (' ' or out-of-bounds)
 * - Empty line inside the map is treated as invalid
 */
export function validateCubMap(text: string): ValidatedMap {
  const rawLines = text.replace(/\r/g, '').split('\n');

  // Keep meaningful spaces. Remove only leading/trailing completely-empty lines.
  while (rawLines.length > 0 && rawLines[0].trim().length === 0) rawLines.shift();
  while (rawLines.length > 0 && rawLines[rawLines.length - 1].trim().length === 0) rawLines.pop();

  const issues: MapIssue[] = [];

  // Detect empty lines inside the map body.
  for (let i = 0; i < rawLines.length; i++) {
    if (rawLines[i].trim().length === 0) {
      issues.push({ kind: 'empty-line', message: `Empty line inside map at row ${i}`, y: i });
    }
  }

  const height = rawLines.length;
  const width = rawLines.reduce((m, l) => Math.max(m, l.length), 0);

  const grid: string[][] = Array.from({ length: height }, (_, y) => {
    const line = rawLines[y] ?? '';
    return Array.from({ length: width }, (_, x) => line[x] ?? ' ');
  });

  let playerCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ch = grid[y][x];
      if (!ALLOWED.has(ch)) {
        issues.push({ kind: 'invalid-char', message: `Invalid character '${ch}' at (${y},${x})`, x, y });
      }
      if (PLAYER_CHARS.has(ch)) playerCount++;
    }
  }

  if (playerCount !== 1) {
    issues.push({
      kind: 'player-count',
      message: `Must have exactly 1 player (found ${playerCount})`,
    });
  }

  const dirs = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
  ];

  // Closed-map check: walkable tiles cannot touch void or boundary.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ch = grid[y][x];
      if (!isWalkable(ch)) continue;

      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        issues.push({
          kind: 'open-boundary',
          message: `Open map: walkable tile on boundary at (${y},${x})`,
          x,
          y,
        });
        continue;
      }

      for (const { dx, dy } of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        const n = grid[ny]?.[nx];
        if (n == null) {
          issues.push({
            kind: 'touches-void',
            message: `Open map: walkable tile touches out-of-bounds at (${y},${x})`,
            x,
            y,
          });
          break;
        }
        if (n === ' ') {
          issues.push({
            kind: 'touches-void',
            message: `Open map: walkable tile touches void ' ' at (${y},${x})`,
            x,
            y,
          });
          break;
        }
      }
    }
  }

  return { width, height, grid, issues, playerCount };
}
