import React, { useEffect, useMemo, useRef, useState } from 'react';

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

type Sample = {
  x: number;
  floorX: number;
  floorY: number;
  cellX: number;
  cellY: number;
  tx: number;
  ty: number;
};

export default function FloorCastingViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<HTMLCanvasElement>(null);

  const [angle, setAngle] = useState(0.25);
  const [planeLen, setPlaneLen] = useState(0.66);
  const [y, setY] = useState(140);

  // A tiny world grid (purely for visualization)
  const world = useMemo(
    () => [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    []
  );

  const screenW = 320;
  const screenH = 200;
  const texW = 64;
  const texH = 64;

  const posX = 3.5;
  const posY = 3.5;

  const dir = useMemo(() => ({ x: Math.cos(angle), y: Math.sin(angle) }), [angle]);
  const plane = useMemo(() => ({ x: -dir.y * planeLen, y: dir.x * planeLen }), [dir.x, dir.y, planeLen]);

  const p = useMemo(() => y - Math.floor(screenH / 2), [y]);
  const posZ = useMemo(() => 0.5 * screenH, []);
  const rowDistance = useMemo(() => {
    // Avoid division by zero at horizon.
    const denom = p === 0 ? 1e-6 : p;
    return posZ / denom;
  }, [p, posZ]);

  const rayDir0 = useMemo(() => ({ x: dir.x - plane.x, y: dir.y - plane.y }), [dir.x, dir.y, plane.x, plane.y]);
  const rayDir1 = useMemo(() => ({ x: dir.x + plane.x, y: dir.y + plane.y }), [dir.x, dir.y, plane.x, plane.y]);

  const floorStep = useMemo(
    () => ({
      x: (rowDistance * (rayDir1.x - rayDir0.x)) / screenW,
      y: (rowDistance * (rayDir1.y - rayDir0.y)) / screenW,
    }),
    [rowDistance, rayDir0.x, rayDir0.y, rayDir1.x, rayDir1.y]
  );

  const samples = useMemo<Sample[]>(() => {
    let floorX = posX + rowDistance * rayDir0.x;
    let floorY = posY + rowDistance * rayDir0.y;

    const take = (x: number): Sample => {
      const cellX = Math.floor(floorX);
      const cellY = Math.floor(floorY);
      const tx = (Math.floor(texW * (floorX - cellX)) & (texW - 1)) >>> 0;
      const ty = (Math.floor(texH * (floorY - cellY)) & (texH - 1)) >>> 0;
      return { x, floorX, floorY, cellX, cellY, tx, ty };
    };

    const out: Sample[] = [];
    for (let x = 0; x < screenW; x++) {
      if (x % 16 === 0) out.push(take(x));
      floorX += floorStep.x;
      floorY += floorStep.y;
    }
    return out;
  }, [floorStep.x, floorStep.y, posX, posY, rayDir0.x, rayDir0.y, rowDistance]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    c.width = screenW;
    c.height = screenH;

    ctx.clearRect(0, 0, screenW, screenH);
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, screenW, screenH);

    const horizon = Math.floor(screenH / 2);

    // ceiling half
    ctx.fillStyle = 'rgba(148, 163, 184, 0.06)';
    ctx.fillRect(0, 0, screenW, horizon);

    // floor half
    ctx.fillStyle = 'rgba(16, 185, 129, 0.06)';
    ctx.fillRect(0, horizon, screenW, screenH - horizon);

    // horizon line
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, horizon + 0.5);
    ctx.lineTo(screenW, horizon + 0.5);
    ctx.stroke();

    // selected scanline
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(screenW, y + 0.5);
    ctx.stroke();

    // draw sample ticks + labels
    ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

    for (const s of samples) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.beginPath();
      ctx.moveTo(s.x + 0.5, y - 8);
      ctx.lineTo(s.x + 0.5, y + 8);
      ctx.stroke();

      const label = `(${s.cellX},${s.cellY}) tx=${s.tx}`;
      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
      ctx.fillText(label, clamp(s.x - 18, 2, screenW - 140), clamp(y - 12, 12, screenH - 6));
      break; // show only one label to keep it clean
    }

    // HUD
    ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
    ctx.fillText('ceil', 6, 14);
    ctx.fillText('floor', 6, screenH - 8);

    ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
    ctx.fillText(`scanline y=${y}`, 84, 14);
  }, [samples, y]);

  useEffect(() => {
    const c = mapRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const tile = 26;
    const pad = 10;
    c.width = pad * 2 + world[0].length * tile;
    c.height = pad * 2 + world.length * tile;

    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, c.width, c.height);

    for (let yy = 0; yy < world.length; yy++) {
      for (let xx = 0; xx < world[0].length; xx++) {
        const px = pad + xx * tile;
        const py = pad + yy * tile;
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(px, py, tile, tile);
        if (world[yy][xx] === 1) {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.18)';
          ctx.fillRect(px, py, tile, tile);
        }
      }
    }

    const ppx = pad + posX * tile;
    const ppy = pad + posY * tile;

    // player
    ctx.fillStyle = 'rgba(34, 197, 94, 0.95)';
    ctx.beginPath();
    ctx.arc(ppx, ppy, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // left/right rays for floor casting
    const leftX = posX + rowDistance * rayDir0.x;
    const leftY = posY + rowDistance * rayDir0.y;
    const rightX = posX + rowDistance * rayDir1.x;
    const rightY = posY + rowDistance * rayDir1.y;

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ppx, ppy);
    ctx.lineTo(pad + leftX * tile, pad + leftY * tile);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.55)';
    ctx.beginPath();
    ctx.moveTo(ppx, ppy);
    ctx.lineTo(pad + rightX * tile, pad + rightY * tile);
    ctx.stroke();

    // indicate that scanline moves along camera plane direction
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
    ctx.beginPath();
    ctx.moveTo(pad + leftX * tile, pad + leftY * tile);
    ctx.lineTo(pad + rightX * tile, pad + rightY * tile);
    ctx.stroke();
  }, [posX, posY, rayDir0.x, rayDir0.y, rayDir1.x, rayDir1.y, rowDistance, world]);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="space-y-1">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Floor/Ceiling casting (scanline)</div>
          <div className="text-slate-300">
            Pick a screen row (scanline). We compute the world point under the left pixel and under the right pixel, then step across x.
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <label className="text-xs text-slate-400 flex items-center gap-2">
            Angle
            <input type="range" min={-Math.PI} max={Math.PI} step={0.01} value={angle} onChange={e => setAngle(parseFloat(e.target.value))} className="w-40" />
            <span className="font-mono text-slate-200 w-12 text-right">{angle.toFixed(2)}</span>
          </label>
          <label className="text-xs text-slate-400 flex items-center gap-2">
            FOV
            <input type="range" min={0.2} max={1.0} step={0.01} value={planeLen} onChange={e => setPlaneLen(parseFloat(e.target.value))} className="w-40" />
            <span className="font-mono text-slate-200 w-12 text-right">{planeLen.toFixed(2)}</span>
          </label>
          <label className="text-xs text-slate-400 flex items-center gap-2">
            Scanline y
            <input type="range" min={0} max={screenH - 1} step={1} value={y} onChange={e => setY(parseInt(e.target.value, 10))} className="w-40" />
            <span className="font-mono text-slate-200 w-12 text-right">{y}</span>
          </label>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
          <canvas ref={canvasRef} className="w-full h-auto" />
          <div className="mt-2 text-xs text-slate-500">
            Cyan line is the chosen scanline. Horizon is the midline (division by ~0).
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
            <canvas ref={mapRef} className="w-full h-auto" />
            <div className="mt-2 text-xs text-slate-500">
              Cyan/purple rays: left and right edge of the screen for this scanline. Green segment shows interpolation direction across x.
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <div className="text-xs font-black tracking-widest uppercase text-slate-500 mb-3">Numbers</div>
            <div className="grid grid-cols-2 gap-3 text-sm font-mono">
              <div className="text-slate-400">p = y - h/2</div>
              <div className="text-slate-200">{p}</div>

              <div className="text-slate-400">rowDistance</div>
              <div className="text-emerald-300">{rowDistance.toFixed(3)}</div>

              <div className="text-slate-400">rayDir0</div>
              <div className="text-slate-200">[{rayDir0.x.toFixed(3)}, {rayDir0.y.toFixed(3)}]</div>

              <div className="text-slate-400">rayDir1</div>
              <div className="text-slate-200">[{rayDir1.x.toFixed(3)}, {rayDir1.y.toFixed(3)}]</div>

              <div className="text-slate-400">floorStep</div>
              <div className="text-slate-200">[{floorStep.x.toFixed(4)}, {floorStep.y.toFixed(4)}]</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
