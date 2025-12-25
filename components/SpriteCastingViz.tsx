import React, { useMemo, useState } from 'react';
import Tex from './Math';

type Sprite = { id: string; x: number; y: number; color: string };

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export default function SpriteCastingViz() {
  const [angle, setAngle] = useState(0.0);
  const [planeLen, setPlaneLen] = useState(0.66);
  const [spriteIndex, setSpriteIndex] = useState(0);

  const posX = 3.5;
  const posY = 3.5;
  const w = 240;
  const h = 160;

  const dir = useMemo(() => ({ x: Math.cos(angle), y: Math.sin(angle) }), [angle]);
  const plane = useMemo(() => ({ x: -dir.y * planeLen, y: dir.x * planeLen }), [dir.x, dir.y, planeLen]);

  const sprites: Sprite[] = useMemo(
    () => [
      { id: 'barrel', x: 5.5, y: 3.5, color: '#22c55e' },
      { id: 'pillar', x: 6.5, y: 5.0, color: '#a855f7' },
      { id: 'light', x: 4.5, y: 6.5, color: '#f59e0b' },
    ],
    []
  );

  const s = sprites[clamp(spriteIndex, 0, sprites.length - 1)] ?? sprites[0];

  // Camera matrix (2D): [ planeX dirX ; planeY dirY ]
  // We need inverse to transform world->camera.
  const invDet = 1.0 / (plane.x * dir.y - dir.x * plane.y);

  const rel = useMemo(() => ({ x: s.x - posX, y: s.y - posY }), [s.x, s.y]);

  const transform = useMemo(() => {
    const transformX = invDet * (dir.y * rel.x - dir.x * rel.y);
    const transformY = invDet * (-plane.y * rel.x + plane.x * rel.y);
    return { x: transformX, y: transformY };
  }, [dir.x, dir.y, invDet, plane.x, plane.y, rel.x, rel.y]);

  const spriteScreenX = Math.floor((w / 2) * (1 + transform.x / Math.max(1e-6, transform.y)));
  const spriteH = Math.abs(Math.floor(h / Math.max(1e-6, transform.y)));
  const spriteW = spriteH;

  const drawStartY = clamp(Math.floor(-spriteH / 2 + h / 2), 0, h - 1);
  const drawEndY = clamp(Math.floor(spriteH / 2 + h / 2), 0, h - 1);
  const drawStartX = clamp(Math.floor(-spriteW / 2 + spriteScreenX), 0, w - 1);
  const drawEndX = clamp(Math.floor(spriteW / 2 + spriteScreenX), 0, w - 1);

  // Fake ZBuffer (walls) just to visualize the rule. Lower = closer.
  const zBuffer = useMemo(() => {
    const arr = Array.from({ length: w }, (_, x) => {
      const t = (x / (w - 1)) * Math.PI * 2;
      // make a bump near the center to simulate a closer wall
      return 2.2 + 0.7 * Math.sin(t) + 0.6 * Math.exp(-Math.pow((x - w / 2) / 36, 2));
    });
    return arr;
  }, [w]);

  const spriteDepth = transform.y;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="space-y-1">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Sprite casting (ZBuffer + inverse camera)</div>
          <div className="text-slate-300">
            Walls fill a 1D ZBuffer (per column). A sprite stripe draws only if it’s in front of the wall at that column.
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
            Sprite
            <select value={spriteIndex} onChange={e => setSpriteIndex(parseInt(e.target.value, 10))} className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200">
              {sprites.map((sp, idx) => (
                <option key={sp.id} value={idx}>
                  {sp.id}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500 mb-3">Screen-space</div>
          <svg width={w} height={h} className="w-full h-auto block">
            {/* background */}
            <rect x={0} y={0} width={w} height={h} fill="#020617" />

            {/* zbuffer as wall silhouette (higher bar means closer wall) */}
            {zBuffer.map((z, x) => {
              const wallH = clamp(Math.floor(h / z), 0, h);
              const y0 = Math.floor(h / 2 - wallH / 2);
              return <rect key={x} x={x} y={y0} width={1} height={wallH} fill="rgba(148,163,184,0.22)" />;
            })}

            {/* sprite rect */}
            {transform.y > 0 ? (
              <>
                <rect
                  x={drawStartX}
                  y={drawStartY}
                  width={Math.max(1, drawEndX - drawStartX)}
                  height={Math.max(1, drawEndY - drawStartY)}
                  fill={s.color}
                  opacity={0.22}
                  stroke={s.color}
                />

                {/* show which stripes pass the ZBuffer test */}
                {Array.from({ length: Math.max(0, drawEndX - drawStartX) }).map((_, i) => {
                  const stripe = drawStartX + i;
                  const ok = spriteDepth < zBuffer[stripe];
                  if (!ok) return null;
                  return <rect key={stripe} x={stripe} y={drawStartY} width={1} height={Math.max(1, drawEndY - drawStartY)} fill={s.color} opacity={0.65} />;
                })}
              </>
            ) : null}

            {/* center line */}
            <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke="rgba(56,189,248,0.25)" />
          </svg>
          <div className="mt-2 text-xs text-slate-500">
            Grey bars = wall ZBuffer (per column). Colored stripes draw only where <code className="text-slate-200">spriteDepth &lt; ZBuffer[x]</code>.
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <div className="text-xs font-black tracking-widest uppercase text-slate-500 mb-3">Math (camera-space transform)</div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
              <Tex block>
                {String.raw`invDet = \frac{1}{plane_x\cdot dir_y - dir_x\cdot plane_y}\\
\begin{aligned}
transformX &= invDet\cdot(dir_y\cdot rel_x - dir_x\cdot rel_y)\\
transformY &= invDet\cdot(-plane_y\cdot rel_x + plane_x\cdot rel_y)
\end{aligned}`}
              </Tex>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <div className="text-xs font-black tracking-widest uppercase text-slate-500 mb-3">Numbers</div>
            <div className="grid grid-cols-2 gap-3 text-sm font-mono">
              <div className="text-slate-400">rel</div>
              <div className="text-slate-200">[{rel.x.toFixed(3)}, {rel.y.toFixed(3)}]</div>

              <div className="text-slate-400">transform</div>
              <div className="text-slate-200">[{transform.x.toFixed(3)}, {transform.y.toFixed(3)}]</div>

              <div className="text-slate-400">screenX</div>
              <div className="text-slate-200">{spriteScreenX}</div>

              <div className="text-slate-400">sprite depth</div>
              <div className="text-emerald-300">{spriteDepth.toFixed(3)}</div>

              <div className="text-slate-400">sprite size</div>
              <div className="text-slate-200">{spriteW}×{spriteH}</div>

              <div className="text-slate-400">draw X</div>
              <div className="text-slate-200">[{drawStartX}, {drawEndX}]</div>

              <div className="text-slate-400">draw Y</div>
              <div className="text-slate-200">[{drawStartY}, {drawEndY}]</div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300 leading-relaxed">
            Depth sorting rule: draw sprites from far → near so nearer sprites overwrite.
            But visibility is still checked per stripe using the wall ZBuffer.
          </div>
        </div>
      </div>
    </div>
  );
}
