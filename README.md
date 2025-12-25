# cub3D Masterclass — The Graphics Guide

A documentation-style learning site for 42 students to understand **cub3D raycasting**.

## What you get

- Left sidebar navigation + top breadcrumbs + search (Ctrl+K)
- 11 lessons with ASCII diagrams + formulas + “MUST remember” + common mistakes + mini-quiz
- Interactive tools:
  - **Raycasting Playground**: top-down + 3D canvases, WASD/rotate, live ray variables, selectable ray, DDA step animation, FOV slider
  - **Map Validator**: highlights invalid chars/open maps/multiple players and prints cub3D-like errors

## Run locally

**Prerequisites**: Node.js (LTS recommended)

```sh
cd /goinfre/mtarza/cub3d-masterclass_-the-graphics-guide
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Site structure

- `components/` UI + visualizers (ASCII, UnitCircle, DDAVisualizer, MemoryVisualizer, MovementSim)
- `pages/` Lessons + tools
- `utils/engine.ts` Raycasting + DDA debug info used by the Playground
- `utils/mapValidation.ts` cub3D-style map validation

## Notes for cub3D defense

- Always explain raycasting as **1D vertical slices** computed from **2D grid DDA**.
- Use **perpWallDist** (not raw distance) to avoid fish-eye.
- Use the MLX image buffer (bpp/line_length) and present the frame once.
