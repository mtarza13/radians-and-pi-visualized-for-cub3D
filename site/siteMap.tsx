import React from 'react';

import BigPicture from '../pages/BigPicture';
import MapParsingLesson from '../pages/MapParsingLesson';
import VectorsFov from '../pages/VectorsFov';
import RayPerColumn from '../pages/RayPerColumn';
import DDADeepDive from '../pages/DDADeepDive';
import FishEyeFix from '../pages/FishEyeFix';
import ProjectionLineHeight from '../pages/ProjectionLineHeight';
import TextureMapping from '../pages/TextureMapping';
import MlxMemoryLayout from '../pages/MlxMemoryLayout';
import MovementRotationCollision from '../pages/MovementRotationCollision';
import FullFramePipeline from '../pages/FullFramePipeline';

import Playground from '../pages/Playground';
import MapValidator from '../pages/MapValidator';

export type PageGroup = 'Lessons' | 'Tools';

export type PageId =
  | 'big-picture'
  | 'map-parsing'
  | 'vectors-fov'
  | 'ray-per-column'
  | 'dda'
  | 'fisheye'
  | 'projection'
  | 'textures'
  | 'mlx-memory'
  | 'movement'
  | 'pipeline'
  | 'playground'
  | 'map-validator';

export interface PageMeta {
  id: PageId;
  group: PageGroup;
  number?: number;
  title: string;
  shortTitle: string;
  keywords: string[];
  Component: React.FC;
}

export const PAGES: PageMeta[] = [
  {
    id: 'big-picture',
    group: 'Lessons',
    number: 1,
    title: 'Big Picture: 2D → fake 3D',
    shortTitle: 'Big Picture',
    keywords: ['raycasting', '2D', '3D', 'columns', 'depth'],
    Component: BigPicture,
  },
  {
    id: 'map-parsing',
    group: 'Lessons',
    number: 2,
    title: 'Map Parsing & Validation (closed map, spaces)',
    shortTitle: 'Map Parsing',
    keywords: ['parser', 'validation', 'closed map', 'spaces', 'NSEW'],
    Component: MapParsingLesson,
  },
  {
    id: 'vectors-fov',
    group: 'Lessons',
    number: 3,
    title: 'Vectors: dir + camera plane (FOV)',
    shortTitle: 'Vectors & FOV',
    keywords: ['vectors', 'dir', 'plane', 'fov', 'unit circle'],
    Component: VectorsFov,
  },
  {
    id: 'ray-per-column',
    group: 'Lessons',
    number: 4,
    title: 'Ray per Column: cameraX and rayDir',
    shortTitle: 'Ray per Column',
    keywords: ['cameraX', 'rayDir', 'columns', 'screen'],
    Component: RayPerColumn,
  },
  {
    id: 'dda',
    group: 'Lessons',
    number: 5,
    title: 'DDA Deep Dive (with step table)',
    shortTitle: 'DDA Deep Dive',
    keywords: ['dda', 'grid', 'sideDist', 'deltaDist', 'step'],
    Component: DDADeepDive,
  },
  {
    id: 'fisheye',
    group: 'Lessons',
    number: 6,
    title: 'perpWallDist & fish-eye fix',
    shortTitle: 'Fish-eye Fix',
    keywords: ['perpWallDist', 'fisheye', 'projection'],
    Component: FishEyeFix,
  },
  {
    id: 'projection',
    group: 'Lessons',
    number: 7,
    title: 'Projection and lineHeight',
    shortTitle: 'Projection',
    keywords: ['lineHeight', 'drawStart', 'drawEnd', 'screen'],
    Component: ProjectionLineHeight,
  },
  {
    id: 'textures',
    group: 'Lessons',
    number: 8,
    title: 'Texture mapping (texX/texY, flipping)',
    shortTitle: 'Textures',
    keywords: ['texX', 'texY', 'texture', 'sampling', 'flip'],
    Component: TextureMapping,
  },
  {
    id: 'mlx-memory',
    group: 'Lessons',
    number: 9,
    title: 'MLX memory layout (bpp, line_length)',
    shortTitle: 'MLX Memory',
    keywords: ['mlx', 'bpp', 'line_length', 'endian'],
    Component: MlxMemoryLayout,
  },
  {
    id: 'movement',
    group: 'Lessons',
    number: 10,
    title: 'Movement + rotation + collision',
    shortTitle: 'Movement',
    keywords: ['movement', 'rotation', 'collision', 'WASD'],
    Component: MovementRotationCollision,
  },
  {
    id: 'pipeline',
    group: 'Lessons',
    number: 11,
    title: 'Full frame pipeline',
    shortTitle: 'Full Pipeline',
    keywords: ['pipeline', 'frame', 'render loop', 'mlx_put_image_to_window'],
    Component: FullFramePipeline,
  },
  {
    id: 'playground',
    group: 'Tools',
    title: 'Raycasting Playground',
    shortTitle: 'Playground',
    keywords: ['interactive', 'demo', 'playground', 'dda', 'fov'],
    Component: Playground,
  },
  {
    id: 'map-validator',
    group: 'Tools',
    title: 'Map Validator',
    shortTitle: 'Map Validator',
    keywords: ['map', 'validator', 'errors', 'closed', 'spaces'],
    Component: MapValidator,
  },
];

export const PAGES_BY_ID: Record<PageId, PageMeta> = Object.fromEntries(PAGES.map((p) => [p.id, p])) as any;

export const GROUPS: PageGroup[] = ['Lessons', 'Tools'];
