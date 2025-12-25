import React from 'react';
import ASCIIDiagram from '../components/ASCIIDiagram';
import LessonEnding from '../components/LessonEnding';
import Tex from '../components/Math';
import MapValidationMini from '../components/MapValidationMini';
import BigPictureRayViz from '../components/BigPictureRayViz';
import DDAVisualizer from '../components/DDAVisualizer';
import MemoryVisualizer from '../components/MemoryVisualizer';
import MovementSim from '../components/MovementSim';
import UnitCircle from '../components/UnitCircle';

export default function BigPicture() {
  const [angle, setAngle] = React.useState(Math.PI / 4);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Big Picture: 2D → fake 3D</h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          cub3D is a trick: we never build real 3D geometry.
          We stay in a 2D grid and draw <strong>vertical slices</strong> whose height depends on distance.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">The “flashlight” idea</h2>
        <p className="text-slate-400 leading-relaxed">
          Imagine you’re in a maze with a flashlight. For each screen column, you shine a ray and ask:
          <strong> where is the first wall hit?</strong> That distance becomes the wall slice height.
        </p>

        <ASCIIDiagram
          caption="One ray (one screen column)."
          content={`
[TOP-DOWN GRID]                         [SCREEN]

1111111111                               ^ y
1000000001                               |
10P----->*1   ray hits wall              |        ████
1000000001                               |        ████  close = tall
1111111111                               |         ██
                                         +--------------> x
                                                  far = short
`}
        />

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Core formula</div>
          <p className="text-slate-300 leading-relaxed">
            In classic raycasters, wall slice height is inversely proportional to distance:
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>{String.raw`\text{lineHeight} = \left\lfloor \frac{\text{screenH}}{\text{perpWallDist}} \right\rfloor`}</Tex>
          </div>
          <p className="text-slate-500 text-sm">
            Key word: <code className="text-slate-200">perpWallDist</code> (distance corrected to avoid fish-eye).
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Map parsing & validation (why closed maps matter)</h2>
        <p className="text-slate-400 leading-relaxed">
          Raycasting assumes the world is a closed grid. If a walkable tile touches <strong>void</strong> (a space or out-of-bounds),
          your DDA can “escape the map” and crash (or draw garbage).
        </p>
        <MapValidationMini />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Direction vector + camera plane (FOV)</h2>
        <p className="text-slate-400 leading-relaxed">
          Your view is defined by two perpendicular vectors:
          <strong> dir</strong> (where you look) and <strong>plane</strong> (the camera plane). The plane length controls FOV.
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">One ray per column</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>
              {String.raw`cameraX = 2\cdot\frac{x}{w} - 1\\ rayDir = dir + plane\cdot cameraX`}
            </Tex>
          </div>
          <p className="text-slate-500 text-sm">In the visualizer: slide “Column” to pick which ray you’re computing.</p>
        </div>

        <ASCIIDiagram
          caption="dir and camera plane (perpendicular)."
          content={`
              plane (FOV)
        left <----+----> right
                 |
                 |  dir (look)
                 v
                (player)
`}
        />

        <BigPictureRayViz />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">DDA algorithm: “walk the grid”</h2>
        <p className="text-slate-400 leading-relaxed">
          DDA doesn’t move pixel-by-pixel. It jumps from one grid boundary to the next, always taking the nearest next intersection.
          That’s why we track <code className="text-slate-200">sideDistX</code>/<code className="text-slate-200">sideDistY</code>
          and add <code className="text-slate-200">deltaDistX</code>/<code className="text-slate-200">deltaDistY</code>.
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">The two key deltas</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>{String.raw`\Delta_x = \left|\frac{1}{rayDir_x}\right|\qquad\Delta_y = \left|\frac{1}{rayDir_y}\right|`}</Tex>
          </div>
          <p className="text-slate-500 text-sm">
            Intuition: <code className="text-slate-200">\Delta_x</code> is “how much ray length to cross one vertical gridline”.
          </p>
        </div>

        <DDAVisualizer />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Fish-eye fix: perpendicular distance</h2>
        <p className="text-slate-400 leading-relaxed">
          Using the raw hit distance makes edge rays look farther (curved walls). The fix is to use the distance projected onto
          the camera direction (classic <code className="text-slate-200">perpWallDist</code>).
        </p>
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Classic formula from DDA</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>{String.raw`perpWallDist = \begin{cases} sideDistX - \Delta_x & \text{if hit on x-side}\\ sideDistY - \Delta_y & \text{if hit on y-side}\end{cases}`}</Tex>
          </div>
          <p className="text-slate-500 text-sm">The chart inside the ray visualizer shows fish-eye (red) vs corrected (green).</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">MLX images: 2D pixels stored as 1D memory</h2>
        <p className="text-slate-400 leading-relaxed">
          Even though you think in (x,y), MLX gives you a pointer to a flat byte buffer. You compute an offset and write bytes.
        </p>
        <MemoryVisualizer />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Movement & rotation (unit circle → rotation matrix)</h2>
        <p className="text-slate-400 leading-relaxed">
          Movement uses <code className="text-slate-200">cos</code>/<code className="text-slate-200">sin</code> from the unit circle.
          Rotation applies the same matrix to both the direction vector and the camera plane.
        </p>

        <div className="grid lg:grid-cols-2 gap-6">
          <UnitCircle angle={angle} setAngle={setAngle} />
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="text-xs font-black tracking-widest uppercase text-slate-500">Rotation matrix</div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
              <Tex block>{String.raw`\begin{bmatrix}x'\\y'\end{bmatrix} = \begin{bmatrix}\cos a & -\sin a\\ \sin a & \cos a\end{bmatrix}\begin{bmatrix}x\\y\end{bmatrix}`}</Tex>
            </div>
            <p className="text-slate-500 text-sm">
              In cub3D: rotate <code className="text-slate-200">dir</code> and <code className="text-slate-200">plane</code> by the same angle each frame.
            </p>
          </div>
        </div>

        <MovementSim />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">What is the “engine”, really?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
            <div className="text-xs font-black tracking-widest uppercase text-emerald-400 mb-2">2D engine</div>
            <ul className="text-slate-300 space-y-2">
              <li>Parse map into a grid</li>
              <li>Player position + direction</li>
              <li>For each column: cast ray (DDA)</li>
              <li>Get hit distance + wall side</li>
            </ul>
          </div>
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
            <div className="text-xs font-black tracking-widest uppercase text-blue-400 mb-2">Rendering output</div>
            <ul className="text-slate-300 space-y-2">
              <li>Compute slice height</li>
              <li>Draw ceiling + floor</li>
              <li>Draw wall strip (color/texture)</li>
              <li>Repeat for all columns</li>
            </ul>
          </div>
        </div>
      </section>

      <LessonEnding
        mustRemember={[
          'One ray per screen column (vertical strip rendering).',
          'Rays walk on grid lines (tile boundaries), not pixels.',
          'Slice height uses the corrected distance: perpWallDist.',
        ]}
        commonMistakes={[
          'Using the raw Euclidean hit distance → fish-eye distortion.',
          'Mixing up map indexing: map[y][x] (row first).',
          'Forgetting to handle spaces/void properly → open maps and crashes.',
        ]}
        quiz={[
          'Why do we cast one ray per screen column (not per pixel)?',
          'What does perpWallDist fix compared to the raw hit distance?',
          'In C, why is the map accessed as map[y][x]?',
        ]}
      />
    </div>
  );
}
