import React from 'react';
import ASCIIDiagram from '../components/ASCIIDiagram';
import LessonEnding from '../components/LessonEnding';
import Math from '../components/Math';

export default function TextureMapping() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-4xl font-black text-white tracking-tight">Texture mapping (texX/texY, flipping)</h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          After you know where the ray hit the wall, you compute which column of the texture to sample.
        </p>
      </header>

      <section className="space-y-4">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <Math block>{String.raw`\text{wallX} = \begin{cases}
posY + perpWallDist\cdot rayDirY & side=0\\
posX + perpWallDist\cdot rayDirX & side=1
\end{cases}`}</Math>
          <Math block>{String.raw`wallX \leftarrow wallX - \lfloor wallX \rfloor`}</Math>
          <Math block>{String.raw`texX = \lfloor wallX \cdot texW \rfloor`}</Math>
        </div>

        <ASCIIDiagram
          caption="wallX is the fractional hit position along the wall."
          content={`
Wall tile (1x1)

|<----- wallX ----->|
+-------------------+
|                   |
|   hit point   *   |
|                   |
+-------------------+

texX chooses which texture column to sample.
`}
        />

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Flipping (common cub3D detail)</div>
          <p className="text-slate-300 leading-relaxed">
            Depending on which wall side you hit and the ray direction sign, you may flip:
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-sm text-slate-200">
            if (side == 0 && rayDirX &gt; 0) texX = texW - texX - 1;
            <br />
            if (side == 1 && rayDirY &lt; 0) texX = texW - texX - 1;
          </div>
        </div>
      </section>

      <LessonEnding
        mustRemember={[
          'Compute wallX (fractional hit position) to get texX.',
          'texY is chosen per pixel as you move along the slice.',
          'Flipping depends on side + ray direction.',
        ]}
        commonMistakes={[
          'Forgetting wallX = wallX - floor(wallX) (tex jumps).',
          'Using raw distance instead of perpWallDist for wallX.',
          'Not flipping texX → mirrored textures on some walls.',
        ]}
        quiz={[
          'What does wallX represent?',
          'Why do we take only the fractional part of wallX?',
          'When would you flip texX?',
        ]}
      />
    </div>
  );
}
