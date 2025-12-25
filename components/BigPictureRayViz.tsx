import React, { useEffect, useMemo, useRef, useState } from 'react';
import { castRayDetailed, WORLD_MAP } from '../utils/engine';

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

type RaySample = {
  i: number;
  cameraX: number;
  rayDirX: number;
  rayDirY: number;
  perp: number;
  euclid: number;
  lineHPerp: number;
  lineHEuclid: number;
  hitX: number;
  hitY: number;
  steps: ReturnType<typeof castRayDetailed>['steps'];
  deltaDistX: number;
  deltaDistY: number;
  sideDistX0: number;
  sideDistY0: number;
  side: number;
  mapX: number;
  mapY: number;
};

export default function BigPictureRayViz() {
  const topDownRef = useRef<HTMLCanvasElement>(null);
  const plotRef = useRef<HTMLCanvasElement>(null);

  const [angle, setAngle] = useState(0);
  const [planeLen, setPlaneLen] = useState(0.66);
  const [selected, setSelected] = useState(30);

  const rays = 61;
  const posX = 3.5;
  const posY = 3.5;
  const screenH = 200;

  const dir = useMemo(() => ({ x: Math.cos(angle), y: Math.sin(angle) }), [angle]);
  const plane = useMemo(() => ({ x: -dir.y * planeLen, y: dir.x * planeLen }), [dir.x, dir.y, planeLen]);

  const samples = useMemo<RaySample[]>(() => {
    const out: RaySample[] = [];
    for (let i = 0; i < rays; i++) {
      const cameraX = (2 * i) / (rays - 1) - 1;
      const rayDirX = dir.x + plane.x * cameraX;
      const rayDirY = dir.y + plane.y * cameraX;

      const dbg = castRayDetailed(posX, posY, rayDirX, rayDirY, WORLD_MAP);
      const perp = dbg.perpWallDist;
      const hitX = posX + rayDirX * perp;
      const hitY = posY + rayDirY * perp;
      const euclid = Math.hypot(hitX - posX, hitY - posY);
      const lineHPerp = perp > 0 ? Math.floor(screenH / perp) : 0;
      const lineHEuclid = euclid > 0 ? Math.floor(screenH / euclid) : 0;

      out.push({
        i,
        cameraX,
        rayDirX,
        rayDirY,
        perp,
        euclid,
        lineHPerp,
        lineHEuclid,
        hitX,
        hitY,
        steps: dbg.steps,
        deltaDistX: dbg.deltaDistX,
        deltaDistY: dbg.deltaDistY,
        sideDistX0: dbg.sideDistX0,
        sideDistY0: dbg.sideDistY0,
        side: dbg.side,
        mapX: dbg.mapX,
        mapY: dbg.mapY,
      });
    }
    return out;
  }, [dir.x, dir.y, plane.x, plane.y]);

  const sel = samples[clamp(selected, 0, rays - 1)] ?? samples[0];

  useEffect(() => {
    const canvas = topDownRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tile = 28;
    const pad = 12;
    const mapH = WORLD_MAP.length;
    const mapW = WORLD_MAP[0]?.length ?? 0;

    canvas.width = pad * 2 + mapW * tile;
    canvas.height = pad * 2 + mapH * tile;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid + walls
    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        const px = pad + x * tile;
        const py = pad + y * tile;
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(px, py, tile, tile);

        if (WORLD_MAP[y][x] === 1) {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.18)';
          ctx.fillRect(px, py, tile, tile);
        }
      }
    }

    // DDA visited tiles (selected ray)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    for (const s of sel.steps) {
      const px = pad + s.mapX * tile;
      const py = pad + s.mapY * tile;
      ctx.fillRect(px, py, tile, tile);
    }

    // Camera plane segment
    const ppx = pad + posX * tile;
    const ppy = pad + posY * tile;
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ppx - plane.x * tile, ppy - plane.y * tile);
    ctx.lineTo(ppx + plane.x * tile, ppy + plane.y * tile);
    ctx.stroke();

    // Direction vector
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ppx, ppy);
    ctx.lineTo(ppx + dir.x * tile * 1.2, ppy + dir.y * tile * 1.2);
    ctx.stroke();

    // Rays
    for (const r of samples) {
      const hx = pad + r.hitX * tile;
      const hy = pad + r.hitY * tile;

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ppx, ppy);
      ctx.lineTo(hx, hy);
      ctx.stroke();
    }

    // Selected ray highlighted
    {
      const hx = pad + sel.hitX * tile;
      const hy = pad + sel.hitY * tile;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ppx, ppy);
      ctx.lineTo(hx, hy);
      ctx.stroke();

      ctx.fillStyle = 'rgba(56, 189, 248, 1)';
      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player
    ctx.fillStyle = 'rgba(34, 197, 94, 0.95)';
    ctx.beginPath();
    ctx.arc(ppx, ppy, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }, [dir.x, dir.y, plane.x, plane.y, samples, sel.hitX, sel.hitY, sel.steps]);

  useEffect(() => {
    const canvas = plotRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 520;
    const h = 220;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);

    // Axes
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(36, 12);
    ctx.lineTo(36, h - 24);
    ctx.lineTo(w - 12, h - 24);
    ctx.stroke();

    const maxH = Math.max(
      1,
      ...samples.map(s => Math.max(s.lineHPerp, s.lineHEuclid)).map(v => clamp(v, 0, 400))
    );

    const x0 = 36;
    const y0 = h - 24;
    const x1 = w - 12;
    const y1 = 12;

    const toX = (i: number) => x0 + (i / (rays - 1)) * (x1 - x0);
    const toY = (lh: number) => y0 - (clamp(lh, 0, maxH) / maxH) * (y0 - y1);

    // Euclidean (fish-eye)
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    samples.forEach((s, idx) => {
      const x = toX(s.i);
      const y = toY(s.lineHEuclid);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Perpendicular (correct)
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    samples.forEach((s, idx) => {
      const x = toX(s.i);
      const y = toY(s.lineHPerp);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Selected marker
    const sx = toX(sel.i);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx, 12);
    ctx.lineTo(sx, h - 24);
    ctx.stroke();

    ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
    ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
    ctx.fillText('lineHeight', 6, 20);
    ctx.fillText('ray index', w - 90, h - 8);

    ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
    ctx.fillText('perpWallDist (correct)', 44, 18);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.9)';
    ctx.fillText('euclidean (fish-eye)', 44, 34);
  }, [samples, sel.i]);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="space-y-1">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Raycasting, visualized</div>
          <div className="text-slate-300">
            Left: rays on the grid. Right: how distance becomes slice height (fish-eye vs corrected).
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <label className="text-xs text-slate-400 flex items-center gap-2">
            FOV
            <input
              type="range"
              min={0.2}
              max={1.0}
              step={0.01}
              value={planeLen}
              onChange={e => setPlaneLen(parseFloat(e.target.value))}
              className="w-40"
            />
            <span className="font-mono text-slate-200 w-12 text-right">{planeLen.toFixed(2)}</span>
          </label>

          <label className="text-xs text-slate-400 flex items-center gap-2">
            Angle
            <input
              type="range"
              min={-Math.PI}
              max={Math.PI}
              step={0.01}
              value={angle}
              onChange={e => setAngle(parseFloat(e.target.value))}
              className="w-40"
            />
            <span className="font-mono text-slate-200 w-12 text-right">{angle.toFixed(2)}</span>
          </label>

          <label className="text-xs text-slate-400 flex items-center gap-2">
            Column
            <input
              type="range"
              min={0}
              max={rays - 1}
              step={1}
              value={selected}
              onChange={e => setSelected(parseInt(e.target.value, 10))}
              className="w-40"
            />
            <span className="font-mono text-slate-200 w-12 text-right">{selected}</span>
          </label>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
          <canvas ref={topDownRef} className="w-full h-auto" />
          <div className="mt-2 text-xs text-slate-500">
            Purple = camera plane, White = direction, Cyan = selected ray, Green = DDA-visited cells.
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
            <canvas ref={plotRef} className="w-full h-auto" />
            <div className="mt-2 text-xs text-slate-500">Green stays “flat”; red curves → fish-eye.</div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <div className="text-xs font-black tracking-widest uppercase text-slate-500 mb-3">Selected column numbers</div>
            <div className="grid grid-cols-2 gap-3 text-sm font-mono">
              <div className="text-slate-400">cameraX</div>
              <div className="text-slate-200">{sel.cameraX.toFixed(3)}</div>

              <div className="text-slate-400">rayDir</div>
              <div className="text-slate-200">[{sel.rayDirX.toFixed(3)}, {sel.rayDirY.toFixed(3)}]</div>

              <div className="text-slate-400">deltaDist</div>
              <div className="text-slate-200">[{sel.deltaDistX.toFixed(3)}, {sel.deltaDistY.toFixed(3)}]</div>

              <div className="text-slate-400">sideDist0</div>
              <div className="text-slate-200">[{sel.sideDistX0.toFixed(3)}, {sel.sideDistY0.toFixed(3)}]</div>

              <div className="text-slate-400">hit cell</div>
              <div className="text-slate-200">[{sel.mapY}, {sel.mapX}] side={sel.side}</div>

              <div className="text-slate-400">perpWallDist</div>
              <div className="text-emerald-300">{sel.perp.toFixed(3)}</div>

              <div className="text-slate-400">euclidean dist</div>
              <div className="text-rose-300">{sel.euclid.toFixed(3)}</div>

              <div className="text-slate-400">lineHeight</div>
              <div className="text-slate-200">
                <span className="text-emerald-300">{sel.lineHPerp}</span> vs <span className="text-rose-300">{sel.lineHEuclid}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
