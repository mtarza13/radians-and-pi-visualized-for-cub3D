import React from 'react';
import LessonEnding from '../components/LessonEnding';
import Math from '../components/Math';
import MemoryVisualizer from '../components/MemoryVisualizer';
import ASCIIDiagram from '../components/ASCIIDiagram';

export default function MlxMemoryLayout() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-4xl font-black text-white tracking-tight">MLX memory layout (bpp, line_length)</h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          In MiniLibX, your image is a flat byte buffer. The famous formula converts (x, y) into a byte address.
        </p>
      </header>

      <MemoryVisualizer />

      <section className="space-y-4">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <Math block>{String.raw`\text{addr} = base + y\cdot line\_length + x\cdot \frac{bpp}{8}`}</Math>
        </div>

        <ASCIIDiagram
          caption="Why line_length matters."
          content={`
line_length is bytes-per-row.
It can be > screenW * (bpp/8)

Reasons:
- padding / alignment
- internal MLX stride

If you ignore line_length:
- diagonal artifacts
- memory corruption
`}
        />
      </section>

      <LessonEnding
        mustRemember={[
          'Pixels are stored line-by-line with a stride (line_length).',
          'bpp is bits-per-pixel; divide by 8 to get bytes-per-pixel.',
          'Endianness can swap color channels.',
        ]}
        commonMistakes={[
          'Assuming line_length == width * (bpp/8).',
          'Writing ints into an unaligned addr without casting carefully.',
          'Forgetting endian when colors look wrong.',
        ]}
        quiz={[
          'Why can line_length be bigger than width*(bpp/8)?',
          'What does bpp/8 represent?',
          'What symptom do you see if you ignore line_length?',
        ]}
      />
    </div>
  );
}
