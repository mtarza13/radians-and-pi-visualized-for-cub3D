
export const WORLD_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];

export interface RayResult {
  dist: number;
  side: number;
  mapX: number;
  mapY: number;
  rayDirX: number;
  rayDirY: number;
}

export interface DDAStep {
  i: number;
  mapX: number;
  mapY: number;
  sideDistX: number;
  sideDistY: number;
  took: 'x' | 'y';
}

export interface RayDebugResult extends RayResult {
  hit: boolean;
  stepX: number;
  stepY: number;
  deltaDistX: number;
  deltaDistY: number;
  sideDistX0: number;
  sideDistY0: number;
  perpWallDist: number;
  wallX: number;
  steps: DDAStep[];
}

function invAbs(v: number) {
  // In raycasting, a 0 component means you will never cross that set of gridlines.
  // Use a very large value instead of Infinity to keep debug output readable.
  if (v === 0) return 1e30;
  return Math.abs(1 / v);
}

export function castRay(posX: number, posY: number, rayDirX: number, rayDirY: number): RayResult {
  let mapX = Math.floor(posX);
  let mapY = Math.floor(posY);

  const deltaDistX = invAbs(rayDirX);
  const deltaDistY = invAbs(rayDirY);

  let sideDistX: number;
  let sideDistY: number;

  const stepX = rayDirX < 0 ? -1 : 1;
  const stepY = rayDirY < 0 ? -1 : 1;

  if (rayDirX < 0) {
    sideDistX = (posX - mapX) * deltaDistX;
  } else {
    sideDistX = (mapX + 1.0 - posX) * deltaDistX;
  }
  if (rayDirY < 0) {
    sideDistY = (posY - mapY) * deltaDistY;
  } else {
    sideDistY = (mapY + 1.0 - posY) * deltaDistY;
  }

  let hit = 0;
  let side = 0;
  let maxSteps = 50;
  while (hit === 0 && maxSteps > 0) {
    if (sideDistX < sideDistY) {
      sideDistX += deltaDistX;
      mapX += stepX;
      side = 0;
    } else {
      sideDistY += deltaDistY;
      mapY += stepY;
      side = 1;
    }
    if (WORLD_MAP[mapY]?.[mapX] === 1) hit = 1;
    maxSteps--;
  }

  const dist = (side === 0) ? (sideDistX - deltaDistX) : (sideDistY - deltaDistY);

  return { dist, side, mapX, mapY, rayDirX, rayDirY };
}

export function castRayDetailed(
  posX: number,
  posY: number,
  rayDirX: number,
  rayDirY: number,
  worldMap: number[][] = WORLD_MAP,
  maxSteps: number = 256
): RayDebugResult {
  let mapX = Math.floor(posX);
  let mapY = Math.floor(posY);

  const deltaDistX = invAbs(rayDirX);
  const deltaDistY = invAbs(rayDirY);

  const stepX = rayDirX < 0 ? -1 : 1;
  const stepY = rayDirY < 0 ? -1 : 1;

  let sideDistX = rayDirX < 0 ? (posX - mapX) * deltaDistX : (mapX + 1.0 - posX) * deltaDistX;
  let sideDistY = rayDirY < 0 ? (posY - mapY) * deltaDistY : (mapY + 1.0 - posY) * deltaDistY;

  const sideDistX0 = sideDistX;
  const sideDistY0 = sideDistY;

  let hit = false;
  let side: 0 | 1 = 0;
  const steps: DDAStep[] = [];

  for (let i = 0; i < maxSteps; i++) {
    if (sideDistX < sideDistY) {
      sideDistX += deltaDistX;
      mapX += stepX;
      side = 0;
      steps.push({ i, mapX, mapY, sideDistX, sideDistY, took: 'x' });
    } else {
      sideDistY += deltaDistY;
      mapY += stepY;
      side = 1;
      steps.push({ i, mapX, mapY, sideDistX, sideDistY, took: 'y' });
    }

    if (worldMap[mapY]?.[mapX] === 1) {
      hit = true;
      break;
    }
  }

  const perpWallDist = side === 0 ? sideDistX - deltaDistX : sideDistY - deltaDistY;

  // wallX is the fractional coordinate on the wall for texture mapping.
  let wallX = 0;
  if (side === 0) {
    wallX = posY + perpWallDist * rayDirY;
  } else {
    wallX = posX + perpWallDist * rayDirX;
  }
  wallX -= Math.floor(wallX);

  return {
    dist: perpWallDist,
    side,
    mapX,
    mapY,
    rayDirX,
    rayDirY,
    hit,
    stepX,
    stepY,
    deltaDistX,
    deltaDistY,
    sideDistX0,
    sideDistY0,
    perpWallDist,
    wallX,
    steps,
  };
}
