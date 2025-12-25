import React from 'react';
import LessonEnding from '../components/LessonEnding';
import ASCIIDiagram from '../components/ASCIIDiagram';
import Tex from '../components/Math';
import SpriteCastingViz from '../components/SpriteCastingViz';

export default function LodeRaycastingIII() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Lode Raycasting III (sprites + ZBuffer)</h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          Sprites are billboards in a raycaster: they always face the camera. The trick is projecting them into screen space
          and hiding them behind walls using the 1D ZBuffer (per column).
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">1) Sprite position in camera space</h2>
        <p className="text-slate-400 leading-relaxed">
          Convert the sprite position from world space into camera space using the inverse of the 2×2 matrix made by
          <code className="text-slate-200">dir</code> and <code className="text-slate-200">plane</code>. This avoids trig and matches the wall pipeline.
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Inverse camera transform</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>
              {String.raw`\Delta = spritePos - pos\\
invDet = \frac{1}{plane_x\cdot dir_y - dir_x\cdot plane_y}\\
transformX = invDet\,(dir_y\,\Delta_x - dir_x\,\Delta_y)\\
transformY = invDet\,(-plane_y\,\Delta_x + plane_x\,\Delta_y)`}
            </Tex>
          </div>
          <p className="text-slate-500 text-sm">
            <code className="text-slate-200">transformY</code> is the depth in camera space. If it’s ≤ 0, the sprite is behind you.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">2) Project to screen X, compute draw bounds</h2>
        <p className="text-slate-400 leading-relaxed">
          After transforming, the sprite behaves like a vertical rectangle in screen space. Its screen X depends on
          <code className="text-slate-200">transformX/transformY</code>, and its height scales with <code className="text-slate-200">1/transformY</code>.
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Screen projection</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>
              {String.raw`spriteScreenX = \left\lfloor \frac{w}{2}\left(1 + \frac{transformX}{transformY}\right) \right\rfloor\\
 spriteH = \left\lfloor \frac{h}{transformY} \right\rfloor`}
            </Tex>
          </div>
          <p className="text-slate-500 text-sm">
            The draw rectangle is centered around <code className="text-slate-200">spriteScreenX</code> and clamped to the screen.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">3) ZBuffer occlusion (the cub3D “magic”)</h2>
        <p className="text-slate-400 leading-relaxed">
          When drawing walls, store a 1D ZBuffer: <code className="text-slate-200">zBuffer[x] = perpWallDist</code> for each column.
          When drawing sprites, draw each vertical stripe only if the sprite depth is closer than the wall depth in that column.
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Stripe visibility rule</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>{String.raw`\text{draw stripe }x\text{ if } transformY > 0 \text{ and } transformY < zBuffer[x]`}</Tex>
          </div>
          <p className="text-slate-500 text-sm">
            This works because walls are already drawn from closest to farthest per column, and ZBuffer stores the wall depth.
          </p>
        </div>

        <ASCIIDiagram
          caption="Walls fill zBuffer; sprites test against it."
          content={`
// after wall loop:
for x in 0..w-1:
  zBuffer[x] = perpWallDist(x)

// sprite loop:
for stripe in spriteLeft..spriteRight:
  if spriteDepth < zBuffer[stripe]:
    draw sprite tex column
`}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">4) Sort sprites (far → near), then draw stripes</h2>
        <p className="text-slate-400 leading-relaxed">
          If you have multiple sprites, you usually sort them by distance so closer sprites overwrite farther sprites.
          The wall ZBuffer still decides whether each stripe is hidden behind a wall.
        </p>

        <ASCIIDiagram
          caption="Sprite order"
          content={`
for each sprite:
  dist2 = (posX-sx)^2 + (posY-sy)^2
sort sprites by dist2 descending
for each sprite in sorted order:
  project + draw stripes with zBuffer test
`}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">5) Sprite texture mapping (texX per stripe, texY per pixel)</h2>
        <p className="text-slate-400 leading-relaxed">
          The sprite is a screen-space rectangle. Each vertical stripe chooses a texture column, and each pixel chooses a texture row.
          Most raycasters skip transparent pixels (color key).
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Typical tex coord</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>
              {String.raw`texX = \left\lfloor \frac{(stripe - (-spriteW/2 + spriteScreenX))\cdot texW}{spriteW} \right\rfloor\\
texY = \left\lfloor \frac{(y - drawStartY)\cdot texH}{spriteH} \right\rfloor`}
            </Tex>
          </div>
          <p className="text-slate-500 text-sm">
            Then <code className="text-slate-200">color = spriteTex[texY][texX]</code>; if it’s “transparent”, don’t draw.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">6) The visualization (projection + ZBuffer)</h2>
        <p className="text-slate-400 leading-relaxed">
          This demo shows the sprite rectangle in screen space and a fake ZBuffer.
          Move the sprite and watch which stripes get hidden.
        </p>
        <SpriteCastingViz />
      </section>

      <LessonEnding
        mustRemember={[
          'Sprite casting uses the inverse dir/plane transform (2×2 inverse).',
          'transformY is sprite depth; it must be > 0.',
          'Use the wall zBuffer to hide sprite stripes behind walls.',
        ]}
        commonMistakes={[
          'Forgetting to store zBuffer during wall rendering.',
          'Testing against the wrong distance (use perp wall dist and transformY).',
          'Not clamping sprite draw bounds to the screen.',
        ]}
        quiz={[
          'Why is a 1D zBuffer sufficient in a raycaster?',
          'What does transformY represent physically?',
          'Why do we test per-stripe instead of once per sprite?',
        ]}
      />
    </div>
  );
}
