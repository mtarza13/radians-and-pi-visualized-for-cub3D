import React from 'react';
import LessonEnding from '../components/LessonEnding';
import ASCIIDiagram from '../components/ASCIIDiagram';
import Tex from '../components/Math';
import FloorCastingViz from '../components/FloorCastingViz';

export default function LodeRaycastingII() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Lode Raycasting II (floor & ceiling casting)</h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          Walls are easy with vertical stripes. Floors/ceilings are different: they are drawn as <strong>scanlines</strong>
          where each pixel corresponds to a point on the floor plane.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">1) Horizon and “p” (distance from center)</h2>
        <p className="text-slate-400 leading-relaxed">
          Pick a screen row <code className="text-slate-200">y</code>. Relative to the horizon line (center of screen), define
          <code className="text-slate-200">p = y - h/2</code>. Rows below the horizon have <code className="text-slate-200">p &gt; 0</code> (floor), above have <code className="text-slate-200">p &lt; 0</code> (ceiling).
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Row distance</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>{String.raw`p = y - \frac{h}{2}\\ rowDistance = \frac{posZ}{p}`}</Tex>
          </div>
          <p className="text-slate-500 text-sm">
            Typical choice: <code className="text-slate-200">posZ = 0.5*h</code> (camera height in screen-space). The key is:
            as you go farther from the horizon, <code className="text-slate-200">rowDistance</code> gets smaller.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">2) Left/right rays for this row</h2>
        <p className="text-slate-400 leading-relaxed">
          For floor casting, we don’t cast a DDA ray per pixel. For a given scanline, we compute the world positions along the
          left and right edges of the view frustum, then interpolate across x.
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Row endpoints</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>
              {String.raw`rayDir0 = dir - plane\\ rayDir1 = dir + plane\\
left  = pos + rowDistance\cdot rayDir0\\
right = pos + rowDistance\cdot rayDir1`}
            </Tex>
          </div>
          <p className="text-slate-500 text-sm">Then you walk from <code className="text-slate-200">left</code> to <code className="text-slate-200">right</code> across the screen.</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">3) Fast interpolation across x (no per-pixel trig)</h2>
        <p className="text-slate-400 leading-relaxed">
          Instead of computing a full ray direction per pixel, compute a constant step in world space for this row.
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Step across the scanline</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>
              {String.raw`floorStep = \frac{right - left}{w}\\
floor = left + x\cdot floorStep`}
            </Tex>
          </div>
          <p className="text-slate-500 text-sm">
            That’s why floor casting is fast: one division per row, then simple additions per pixel.
          </p>
        </div>

        <ASCIIDiagram
          caption="Floor casting is per-row interpolation, not per-column DDA."
          content={`
for y in floor rows:
  p = y - h/2
  rowDistance = posZ / p
  left  = pos + rowDistance*(dir-plane)
  right = pos + rowDistance*(dir+plane)
  step  = (right-left)/w
  floor = left
  for x in 0..w-1:
    sample floor tex at floor
    floor += step
`}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">4) Texture sampling (cell + fractional part)</h2>
        <p className="text-slate-400 leading-relaxed">
          Once you have the world floor point for a pixel (<code className="text-slate-200">floorX</code>, <code className="text-slate-200">floorY</code>),
          you convert it to a texture coordinate using the fractional part inside the current cell.
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Floor tex coord</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>
              {String.raw`cellX = \lfloor floorX \rfloor\qquad cellY = \lfloor floorY \rfloor\\
tx = \left\lfloor texW\cdot(floorX - cellX)\right\rfloor\\
ty = \left\lfloor texH\cdot(floorY - cellY)\right\rfloor`}
            </Tex>
          </div>
          <p className="text-slate-500 text-sm">
            If <code className="text-slate-200">texW</code> and <code className="text-slate-200">texH</code> are powers of two, you’ll often see <code className="text-slate-200">tx & (texW-1)</code>.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 text-sm text-slate-300 leading-relaxed">
          Ceiling can be drawn symmetrically: if you draw floor at row <code className="text-slate-200">y</code>, draw ceiling at row <code className="text-slate-200">h - y</code>
          with the corresponding ceiling texture.
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">5) The visualization (pick a scanline)</h2>
        <p className="text-slate-400 leading-relaxed">
          Use the slider to choose a scanline. Watch how the left/right world points move and how the interpolation direction
          changes as you move away from the horizon.
        </p>
        <FloorCastingViz />
      </section>

      <LessonEnding
        mustRemember={[
          'Walls: one ray per column. Floors: one interpolation per row.',
          'p = y - h/2, and rowDistance = posZ / p.',
          'Compute left/right endpoints using dir ± plane, then step across x.',
        ]}
        commonMistakes={[
          'Forgetting horizon sign (ceiling vs floor).',
          'Using rowDistance incorrectly (inverting p wrong).',
          'Doing expensive per-pixel trig when interpolation works.',
        ]}
        quiz={[
          'Why is floor casting naturally “scanline-based”?',
          'What does left/right represent for a given y?',
          'Why does interpolation across x keep the result correct?',
        ]}
      />
    </div>
  );
}
