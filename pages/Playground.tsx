
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { castRay, castRayDetailed, WORLD_MAP, type RayDebugResult } from '../utils/engine';

type Player = { x: number; y: number; dir: number };

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function radToDeg(r: number) {
  return (r * 180) / Math.PI;
}

const Playground: React.FC = () => {
  const canvas2D = useRef<HTMLCanvasElement>(null);
  const canvas3D = useRef<HTMLCanvasElement>(null);

  const keysRef = useRef<Set<string>>(new Set());
  const playerRef = useRef<Player>({ x: 3.5, y: 3.5, dir: 0 });

  const planeLenRef = useRef(0.66);
  const selectedColumnRef = useRef(160);
  const ddaPlayingRef = useRef(false);
  const ddaStepRef = useRef(0);

  const [planeLen, setPlaneLen] = useState(0.66);
  const [selectedColumn, setSelectedColumn] = useState(160);

  const [ddaPlaying, setDdaPlaying] = useState(false);
  const [ddaStep, setDdaStep] = useState(0);

  const [hud, setHud] = useState(() => ({ x: 3.5, y: 3.5, dir: 0 }));
  const [selectedRay, setSelectedRay] = useState<null | (RayDebugResult & { cameraX: number })>(null);

  const fovRad = useMemo(() => 2 * Math.atan(planeLen), [planeLen]);
  const fovDeg = useMemo(() => radToDeg(fovRad), [fovRad]);

  useEffect(() => {
    planeLenRef.current = planeLen;
  }, [planeLen]);

  useEffect(() => {
    selectedColumnRef.current = selectedColumn;
  }, [selectedColumn]);

  useEffect(() => {
    ddaPlayingRef.current = ddaPlaying;
  }, [ddaPlaying]);

  useEffect(() => {
    ddaStepRef.current = ddaStep;
  }, [ddaStep]);

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
    };
    const handleUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  useEffect(() => {
    const ctx2 = canvas2D.current?.getContext('2d');
    const ctx3 = canvas3D.current?.getContext('2d');
    const c2 = canvas2D.current;
    const c3 = canvas3D.current;
    if (!ctx2 || !ctx3 || !c2 || !c3) return;

    const scale = 32;
    const mapW = WORLD_MAP[0]?.length ?? 0;
    const mapH = WORLD_MAP.length;

    let raf = 0;
    let lastHudUpdate = 0;
    let lastDdaTick = 0;

    const loop = (t: number) => {
      const keys = keysRef.current;
      const p = playerRef.current;

      // --- INPUT / UPDATE (cub3D-like) ---
      const moveSpeed = 0.05;
      const rotSpeed = 0.03;

      const rotateLeft = keys.has('ArrowLeft') || keys.has('KeyA');
      const rotateRight = keys.has('ArrowRight') || keys.has('KeyD');

      if (rotateLeft) p.dir -= rotSpeed;
      if (rotateRight) p.dir += rotSpeed;

      const dirX = Math.cos(p.dir);
      const dirY = Math.sin(p.dir);

      if (keys.has('KeyW')) {
        const nx = p.x + dirX * moveSpeed;
        const ny = p.y + dirY * moveSpeed;
        if (WORLD_MAP[Math.floor(ny)]?.[Math.floor(nx)] === 0) {
          p.x = nx;
          p.y = ny;
        }
      }
      if (keys.has('KeyS')) {
        const nx = p.x - dirX * moveSpeed;
        const ny = p.y - dirY * moveSpeed;
        if (WORLD_MAP[Math.floor(ny)]?.[Math.floor(nx)] === 0) {
          p.x = nx;
          p.y = ny;
        }
      }

      // --- RENDER (2D) ---
      ctx2.clearRect(0, 0, c2.width, c2.height);
      for (let y = 0; y < mapH; y++) {
        for (let x = 0; x < mapW; x++) {
          const cell = WORLD_MAP[y][x];
          ctx2.fillStyle = cell === 1 ? '#334155' : '#0b1220';
          ctx2.fillRect(x * scale, y * scale, scale, scale);
          ctx2.strokeStyle = '#1e293b';
          ctx2.strokeRect(x * scale, y * scale, scale, scale);
        }
      }

      // --- RENDER (3D) ---
      const w = c3.width;
      const h = c3.height;
      ctx3.fillStyle = '#1e293b';
      ctx3.fillRect(0, 0, w, h / 2);
      ctx3.fillStyle = '#0b1220';
      ctx3.fillRect(0, h / 2, w, h / 2);

      const planeLenNow = planeLenRef.current;
      const planeX = -Math.sin(p.dir) * planeLenNow;
      const planeY = Math.cos(p.dir) * planeLenNow;

      const selX = clamp(selectedColumnRef.current, 0, w - 1);
      let selectedDebug: (RayDebugResult & { cameraX: number }) | null = null;

      for (let x = 0; x < w; x++) {
        const cameraX = (2 * x) / w - 1;
        const rayDirX = dirX + planeX * cameraX;
        const rayDirY = dirY + planeY * cameraX;

        const res = castRay(p.x, p.y, rayDirX, rayDirY);

        // Shaded walls depending on side (like many cub3D solutions)
        const wallColor = res.side === 1 ? '#10b981' : '#059669';
        const lineHeight = Math.floor(h / res.dist);
        let drawStart = Math.floor(-lineHeight / 2 + h / 2);
        let drawEnd = Math.floor(lineHeight / 2 + h / 2);
        drawStart = clamp(drawStart, 0, h - 1);
        drawEnd = clamp(drawEnd, 0, h - 1);
        ctx3.fillStyle = wallColor;
        ctx3.fillRect(x, drawStart, 1, Math.max(1, drawEnd - drawStart));

        // Draw a subset of rays in 2D
        if (x % 24 === 0) {
          ctx2.strokeStyle = 'rgba(16, 185, 129, 0.20)';
          ctx2.beginPath();
          ctx2.moveTo(p.x * scale, p.y * scale);
          ctx2.lineTo((p.x + rayDirX * res.dist) * scale, (p.y + rayDirY * res.dist) * scale);
          ctx2.stroke();
        }

        if (x === selX) {
          const detailed = castRayDetailed(p.x, p.y, rayDirX, rayDirY, WORLD_MAP);
          selectedDebug = { ...detailed, cameraX };
        }
      }

      // Selected column marker (3D)
      ctx3.strokeStyle = 'rgba(244, 63, 94, 0.85)';
      ctx3.beginPath();
      ctx3.moveTo(selX + 0.5, 0);
      ctx3.lineTo(selX + 0.5, h);
      ctx3.stroke();

      // Player (2D)
      ctx2.fillStyle = '#facc15';
      ctx2.beginPath();
      ctx2.arc(p.x * scale, p.y * scale, 5, 0, Math.PI * 2);
      ctx2.fill();
      // Direction line
      ctx2.strokeStyle = 'rgba(250, 204, 21, 0.8)';
      ctx2.beginPath();
      ctx2.moveTo(p.x * scale, p.y * scale);
      ctx2.lineTo((p.x + dirX * 0.8) * scale, (p.y + dirY * 0.8) * scale);
      ctx2.stroke();

      // Selected ray overlay + DDA stepping
      if (selectedDebug) {
        const rayLen = selectedDebug.perpWallDist;
        ctx2.strokeStyle = 'rgba(244, 63, 94, 0.75)';
        ctx2.lineWidth = 2;
        ctx2.beginPath();
        ctx2.moveTo(p.x * scale, p.y * scale);
        ctx2.lineTo((p.x + selectedDebug.rayDirX * rayLen) * scale, (p.y + selectedDebug.rayDirY * rayLen) * scale);
        ctx2.stroke();
        ctx2.lineWidth = 1;

        // Step animation on grid
        const maxDrawSteps = clamp(ddaStepRef.current, 0, selectedDebug.steps.length);
        for (let i = 0; i < maxDrawSteps; i++) {
          const s = selectedDebug.steps[i];
          ctx2.fillStyle = s.took === 'x' ? 'rgba(59, 130, 246, 0.20)' : 'rgba(244, 63, 94, 0.20)';
          ctx2.fillRect(s.mapX * scale, s.mapY * scale, scale, scale);
        }

        // Sync state
        if (t - lastHudUpdate > 80) {
          lastHudUpdate = t;
          setHud({ x: p.x, y: p.y, dir: p.dir });
          setSelectedRay(selectedDebug);
        }

        // DDA auto-play ticks
        if (ddaPlayingRef.current && t - lastDdaTick > 140) {
          lastDdaTick = t;
          setDdaStep((s) => (s + 1 > selectedDebug.steps.length ? selectedDebug.steps.length : s + 1));
        }
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Reset step slider when selected ray changes significantly.
  useEffect(() => {
    setDdaStep(0);
  }, [selectedColumn]);

  const steps = selectedRay?.steps ?? [];
  const maxSteps = steps.length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-white">Raycasting Playground</h1>
        <p className="text-slate-400 max-w-4xl leading-relaxed">
          Controls: <kbd className="px-1 bg-slate-800 rounded">W</kbd>/<kbd className="px-1 bg-slate-800 rounded">S</kbd> move,
          <kbd className="px-1 bg-slate-800 rounded">A</kbd>/<kbd className="px-1 bg-slate-800 rounded">D</kbd> or
          <kbd className="px-1 bg-slate-800 rounded">←</kbd>/<kbd className="px-1 bg-slate-800 rounded">→</kbd> rotate.
          Click the 3D view to select a ray column.
        </p>
      </header>

      <div className="grid xl:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">2D Top-Down + DDA steps</span>
                <span className="text-xs text-slate-500 font-mono">step {ddaStep}/{maxSteps}</span>
              </div>
              <canvas ref={canvas2D} width={WORLD_MAP[0].length * 32} height={WORLD_MAP.length * 32} className="w-full h-auto bg-slate-950 rounded border border-slate-800" />
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">3D View (click to pick a ray)</span>
                <span className="text-xs text-rose-300 font-mono">x={selectedColumn}</span>
              </div>
              <canvas
                ref={canvas3D}
                width={320}
                height={220}
                onClick={(e) => {
                  const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
                  const x = Math.floor(((e.clientX - rect.left) / rect.width) * 320);
                  setSelectedColumn(clamp(x, 0, 319));
                }}
                className="w-full h-auto bg-slate-950 rounded border border-slate-800 cursor-crosshair"
              />
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 grid md:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <div className="text-slate-500">POS</div>
              <div className="text-emerald-300">[{hud.x.toFixed(2)}, {hud.y.toFixed(2)}]</div>
            </div>
            <div>
              <div className="text-slate-500">DIR (rad)</div>
              <div className="text-emerald-300">{hud.dir.toFixed(3)}</div>
            </div>
            <div>
              <div className="text-slate-500">FOV</div>
              <div className="text-emerald-300">{fovDeg.toFixed(1)}° (planeLen {planeLen.toFixed(2)})</div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">FOV slider (camera plane length)</span>
              <span className="text-xs font-mono text-slate-400">planeLen = tan(FOV/2)</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={1.2}
              step={0.01}
              value={planeLen}
              onChange={(e) => setPlaneLen(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">DDA stepping (selected ray)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDdaStep((s) => Math.max(0, s - 1))}
                  className="px-3 py-1 bg-slate-800 rounded-lg hover:bg-slate-700 text-xs font-bold"
                >
                  PREV
                </button>
                <button
                  onClick={() => setDdaPlaying((p) => !p)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    ddaPlaying ? 'bg-rose-500 text-slate-950 hover:bg-rose-400' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  }`}
                >
                  {ddaPlaying ? 'PAUSE' : 'PLAY'}
                </button>
                <button
                  onClick={() => setDdaStep((s) => Math.min(maxSteps, s + 1))}
                  className="px-3 py-1 bg-slate-800 rounded-lg hover:bg-slate-700 text-xs font-bold"
                >
                  NEXT
                </button>
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={maxSteps}
              step={1}
              value={ddaStep}
              onChange={(e) => setDdaStep(Number(e.target.value))}
              className="w-full mt-3"
            />

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead className="text-slate-500">
                  <tr>
                    <th className="text-left py-2">i</th>
                    <th className="text-left py-2">mapX</th>
                    <th className="text-left py-2">mapY</th>
                    <th className="text-left py-2">sideDistX</th>
                    <th className="text-left py-2">sideDistY</th>
                    <th className="text-left py-2">took</th>
                  </tr>
                </thead>
                <tbody>
                  {steps.slice(0, 64).map((s, i) => (
                    <tr key={i} className={`border-t border-slate-800 ${i + 1 === ddaStep ? 'bg-rose-500/10' : ''}`}>
                      <td className="py-1.5 text-slate-300">{s.i}</td>
                      <td className="py-1.5 text-slate-200">{s.mapX}</td>
                      <td className="py-1.5 text-slate-200">{s.mapY}</td>
                      <td className="py-1.5 text-blue-300">{s.sideDistX.toFixed(3)}</td>
                      <td className="py-1.5 text-rose-300">{s.sideDistY.toFixed(3)}</td>
                      <td className="py-1.5 text-slate-400">{s.took}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {steps.length > 64 && <div className="text-xs text-slate-500 mt-2">(Showing first 64 steps)</div>}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 self-start space-y-4">
          <h4 className="font-black text-sm uppercase tracking-widest text-slate-400">Selected ray variables</h4>

          {!selectedRay ? (
            <div className="text-sm text-slate-500">Cast a frame to populate values…</div>
          ) : (
            <div className="space-y-2 text-xs font-mono">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-slate-500">cameraX</div>
                <div className="text-emerald-300">{selectedRay.cameraX.toFixed(6)}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-500">rayDirX</div>
                  <div className="text-emerald-300">{selectedRay.rayDirX.toFixed(6)}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-500">rayDirY</div>
                  <div className="text-emerald-300">{selectedRay.rayDirY.toFixed(6)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-500">deltaDistX</div>
                  <div className="text-blue-300">{selectedRay.deltaDistX.toFixed(6)}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-500">deltaDistY</div>
                  <div className="text-rose-300">{selectedRay.deltaDistY.toFixed(6)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-500">sideDistX (start)</div>
                  <div className="text-blue-300">{selectedRay.sideDistX0.toFixed(6)}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-500">sideDistY (start)</div>
                  <div className="text-rose-300">{selectedRay.sideDistY0.toFixed(6)}</div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-slate-500">stepX / stepY</div>
                <div className="text-slate-200">{selectedRay.stepX} / {selectedRay.stepY}</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-slate-500">hit side</div>
                <div className="text-slate-200">side={selectedRay.side} ({selectedRay.side === 0 ? 'X-side wall' : 'Y-side wall'})</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-slate-500">perpWallDist</div>
                <div className="text-emerald-300">{selectedRay.perpWallDist.toFixed(6)}</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-slate-500">wallX (for texX)</div>
                <div className="text-emerald-300">{selectedRay.wallX.toFixed(6)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playground;
