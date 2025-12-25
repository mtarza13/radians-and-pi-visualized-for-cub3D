import React from 'react';
import LessonEnding from '../components/LessonEnding';
import ASCIIDiagram from '../components/ASCIIDiagram';
import Tex from '../components/Math';
import BigPictureRayViz from '../components/BigPictureRayViz';

export default function LodeRaycastingI() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Lode Raycasting I (explained for cub3D)</h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          This page re-explains the classic raycasting pipeline (like Wolfenstein-style engines) in a cub3D-friendly way.
          It’s intentionally step-by-step and visualization-first.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">1) The basic idea (vertical stripes)</h2>
        <p className="text-slate-400 leading-relaxed">
          A raycaster is fast because it doesn’t do full 3D triangles. It draws the screen as <strong>vertical columns</strong>.
          For each column, cast a ray in the 2D map, find the first wall hit, then draw one vertical slice whose height depends on distance.
        </p>

        <ASCIIDiagram
          caption="One column = one ray = one wall slice."
          content={`
[MAP TOP-DOWN]                        [SCREEN]

1111111111                             |\
1000000001                             | \\
10P----->*1   first wall hit           |  \\
1000000001                             |   ████  close => tall
1111111111                             |    ██   far   => short
`}
        />

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Core projection</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>{String.raw`lineHeight = \left\lfloor\frac{screenH}{perpWallDist}\right\rfloor`}</Tex>
          </div>
          <p className="text-slate-500 text-sm">
            Using <code className="text-slate-200">perpWallDist</code> (not raw Euclidean distance) keeps walls straight (no fish-eye).
          </p>
        </div>

        <BigPictureRayViz />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">2) Why “constant step” ray marching is wrong</h2>
        <p className="text-slate-400 leading-relaxed">
          If you advance a ray by a fixed small distance and check “am I in a wall?”, you can skip over thin walls.
          The correct approach is to step from grid boundary to grid boundary (DDA), so you never miss a wall.
        </p>

        <ASCIIDiagram
          caption="Fixed steps can miss; grid-boundary steps cannot."
          content={`
Fixed step checks:   o  o  o  o  o
Ray:               --------->
Wall tile:              [####]

Grid-boundary checks:
Check each gridline crossing => always detects entering a wall tile
`}
        />

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">DDA setup (deltaDist, step, sideDist)</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>
              {String.raw`\deltaDistX = \left|\frac{1}{rayDirX}\right|\qquad \deltaDistY = \left|\frac{1}{rayDirY}\right|\\
stepX = \begin{cases}-1&rayDirX<0\\+1&rayDirX\ge 0\end{cases}\qquad
stepY = \begin{cases}-1&rayDirY<0\\+1&rayDirY\ge 0\end{cases}\\
sideDistX = \begin{cases}(posX-mapX)\,\deltaDistX & stepX=-1\\(mapX+1-posX)\,\deltaDistX & stepX=+1\end{cases}\\
sideDistY = \begin{cases}(posY-mapY)\,\deltaDistY & stepY=-1\\(mapY+1-posY)\,\deltaDistY & stepY=+1\end{cases}`}
            </Tex>
          </div>
          <p className="text-slate-500 text-sm">You then repeatedly advance the smaller of <code className="text-slate-200">sideDistX</code> / <code className="text-slate-200">sideDistY</code> until you enter a wall cell.</p>
        </div>

        <ASCIIDiagram
          caption="DDA loop (core)"
          content={`
while hit == 0:
  if sideDistX < sideDistY:
    sideDistX += deltaDistX
    mapX += stepX
    side = 0  // hit a vertical gridline (x-side)
  else:
    sideDistY += deltaDistY
    mapY += stepY
    side = 1  // hit a horizontal gridline (y-side)
  if world[mapY][mapX] is wall:
    hit = 1
`}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">3) Vectors + camera plane (no angles needed)</h2>
        <p className="text-slate-400 leading-relaxed">
          Instead of storing an FOV angle and doing trig per ray, use two vectors: <code className="text-slate-200">dir</code> and
          a perpendicular <code className="text-slate-200">plane</code>. The plane length controls FOV.
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Compute ray direction per column</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>{String.raw`cameraX = 2\cdot\frac{x}{w} - 1\\ rayDir = dir + plane\cdot cameraX`}</Tex>
          </div>
          <p className="text-slate-500 text-sm">
            Intuition: <code className="text-slate-200">cameraX</code> picks a point along the camera plane from left(-1) to right(+1).
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">FOV relation</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>{String.raw`FOV = 2\cdot\arctan\left(\frac{\lVert plane \rVert}{\lVert dir \rVert}\right)`}</Tex>
          </div>
          <p className="text-slate-500 text-sm">
            Common default: <code className="text-slate-200">|dir|=1</code>, <code className="text-slate-200">|plane|≈0.66</code>.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">4) Untextured vs textured (what changes?)</h2>
        <p className="text-slate-400 leading-relaxed">
          The ray and distance math is the same. Texturing only changes the final “draw” step:
          instead of drawing a solid-color stripe, you pick a texture column (<code className="text-slate-200">texX</code>)
          and then sample <code className="text-slate-200">texY</code> for each pixel in the stripe.
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">perpWallDist (fish-eye fix)</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>
              {String.raw`perpWallDist = \begin{cases}
\frac{mapX - posX + \frac{1-stepX}{2}}{rayDirX} & side=0\\
\frac{mapY - posY + \frac{1-stepY}{2}}{rayDirY} & side=1
\end{cases}`}
            </Tex>
          </div>
          <p className="text-slate-500 text-sm">Many raycasters also darken one side: if <code className="text-slate-200">side==1</code>, multiply color by ~0.6.</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Wall hit position for textures</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>
              {String.raw`wallX = \begin{cases}
posY + perpWallDist\cdot rayDirY & \text{if hit x-side}\\
posX + perpWallDist\cdot rayDirX & \text{if hit y-side}
\end{cases}\\
wallX \leftarrow wallX - \lfloor wallX \rfloor`}
            </Tex>
          </div>
          <p className="text-slate-500 text-sm">Then <code className="text-slate-200">texX = floor(wallX * texW)</code> and optionally flip it based on side + ray direction.</p>
        </div>

        <ASCIIDiagram
          caption="Textured wall stripe = constant texX, varying texY." 
          content={`
for y in [drawStart..drawEnd]:
  texY = scaled from y inside the stripe
  color = texture[texY][texX]
  putPixel(x, y, color)
`}
        />
      </section>

      <LessonEnding
        mustRemember={[
          'Raycasting draws 1 wall stripe per screen column.',
          'Use DDA grid-boundary stepping to avoid missing walls.',
          'Vectors + camera plane make ray directions cheap to compute.',
          'Texturing changes only the final sampling step (texX/texY).',
        ]}
        commonMistakes={[
          'Trying to “march” the ray with a constant step size.',
          'Using Euclidean hit distance and getting fish-eye.',
          'Forgetting wallX fractional part => wrong texX selection.',
        ]}
        quiz={[
          'Why is constant-step ray marching unreliable on a grid?',
          'What does cameraX represent geometrically on the camera plane?',
          'Why does the same DDA math work for both textured and untextured walls?',
        ]}
      />
    </div>
  );
}
