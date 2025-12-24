
export interface Vector2 {
  x: number;
  y: number;
}

export interface PlayerState {
  pos: Vector2;
  angle: number;
}

export enum SectionId {
  UNIT_CIRCLE = 'unit-circle',
  TRIGONOMETRY = 'trig',
  MOVEMENT = 'movement',
  DEGREES_VS_RADIANS = 'comparison',
  CUB3D_APPLICATION = 'cub3d'
}
