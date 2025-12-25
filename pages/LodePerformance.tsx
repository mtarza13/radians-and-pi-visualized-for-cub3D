import React from 'react';
import LessonEnding from '../components/LessonEnding';
import ASCIIDiagram from '../components/ASCIIDiagram';
import Tex from '../components/Math';

export default function LodePerformance() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Lode Performance Notes (practical cub3D)</h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          cub3D performance is mostly about doing the same math fewer times, touching memory linearly, and avoiding expensive
          operations in the inner loops.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">1) Per-frame vs per-column vs per-pixel</h2>
        <p className="text-slate-400 leading-relaxed">
          Structure your work by frequency:
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Budget rules of thumb</div>
          <ul className="text-slate-300 space-y-2 list-disc pl-5">
            <li><span className="text-slate-100 font-semibold">Per frame</span>: input, move/rotate, precompute constants.</li>
            <li><span className="text-slate-100 font-semibold">Per column</span>: compute rayDir, DDA loop, store zBuffer[x].</li>
            <li><span className="text-slate-100 font-semibold">Per pixel</span>: only cheap ops (add, array index, write pixel).</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">2) Avoid trig in the inner loops</h2>
        <p className="text-slate-400 leading-relaxed">
          You can rotate <code className="text-slate-200">dir</code> and <code className="text-slate-200">plane</code> once per frame using a 2D rotation.
          Then each ray is <code className="text-slate-200">dir + plane*cameraX</code> (no per-ray sine/cosine).
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Rotation once per frame</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>
              {String.raw`\begin{bmatrix}x'\\y'\end{bmatrix}=
\begin{bmatrix}\cos\theta & -\sin\theta\\ \sin\theta & \cos\theta\end{bmatrix}
\begin{bmatrix}x\\y\end{bmatrix}`}
            </Tex>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">3) Use perpendicular wall distance</h2>
        <p className="text-slate-400 leading-relaxed">
          Fish-eye correction is not just about visuals; it also stabilizes texture sampling (less wobble) because
          the projected line heights are consistent.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">4) Memory writes: write contiguous pixels</h2>
        <p className="text-slate-400 leading-relaxed">
          In MLX you usually write into an image buffer (RGBA) and then blit.
          Cache likes linear writes. Prefer iterating <code className="text-slate-200">y</code> for a fixed <code className="text-slate-200">x</code> only if your buffer is column-major.
          If your buffer is row-major (most common), a row loop writes linearly.
        </p>

        <ASCIIDiagram
          caption="Row-major buffer (typical): index = y*stride + x*bpp."
          content={`
// row-major
for y in 0..h-1:
  for x in 0..w-1:
    putPixel(x,y)

// a vertical stripe is strided writes (slower):
for y in drawStart..drawEnd:
  putPixel(x,y)
`}
        />

        <p className="text-slate-400 leading-relaxed">
          In practice: cub3D is fine with vertical stripes because the screen is small, but it’s good to understand why
          floor casting (scanlines) can be very cache-friendly.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">5) Common micro-optimizations (only if needed)</h2>
        <ul className="text-slate-300 space-y-2 list-disc pl-5">
          <li>Precompute <code className="text-slate-200">2*x/w - 1</code> for all columns if you want.</li>
          <li>Use ints when indexing textures; keep floats only for world math.</li>
          <li>Clamp draw bounds early; avoid branches inside the inner pixel loop.</li>
          <li>Store textures in contiguous arrays; avoid per-pixel function calls.</li>
        </ul>
      </section>

      <LessonEnding
        mustRemember={[
          'Move trig out of inner loops (rotate once per frame).',
          'Minimize expensive operations in per-pixel loops.',
          'Understand memory layout: contiguous writes are faster.',
        ]}
        commonMistakes={[
          'Trying to optimize before correctness (hard to debug).',
          'Recomputing cos/sin for every ray.',
          'Writing pixels via slow helpers in tight loops.',
        ]}
        quiz={[
          'Which computations belong “per frame” vs “per column”?',
          'Why can scanline loops be cache-friendlier than vertical stripes?',
          'What’s the first optimization you would do after correctness?',
        ]}
      />
    </div>
  );
}
