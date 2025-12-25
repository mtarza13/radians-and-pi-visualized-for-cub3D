
import React from 'react';

const MemoryVisualizer: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
           <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Logical 2D View</h4>
           <div className="grid grid-cols-4 gap-1">
             {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="aspect-square bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] font-mono">
                  {Math.floor(i/4)},{i%4}
                </div>
             ))}
           </div>
           <p className="mt-4 text-sm text-slate-500">How we think about pixels: X and Y.</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
           <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">MLX Memory Layout (1D)</h4>
           <div className="flex flex-wrap gap-1">
             {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[10px] font-mono text-emerald-400">
                  {i}
                </div>
             ))}
           </div>
           <p className="mt-4 text-sm text-slate-500 italic">"Flat" memory array of integers.</p>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl font-mono">
        <h4 className="text-slate-400 text-xs mb-4">// THE PIXEL WRITE FORMULA</h4>
        <div className="text-blue-400 text-lg">
          char *dst = img.addr + (y * img.line_len + x * (img.bpp / 8));
        </div>
        <div className="text-emerald-500 text-lg">
          *(unsigned int*)dst = color;
        </div>
        
        <div className="mt-8 grid md:grid-cols-3 gap-6 text-xs leading-relaxed">
          <div className="space-y-2">
            <strong className="text-white block">line_len</strong>
            <p className="text-slate-500">The total number of bytes used to store one row of pixels. It might be larger than screen width due to alignment.</p>
          </div>
          <div className="space-y-2">
            <strong className="text-white block">bpp</strong>
            <p className="text-slate-500">Bits Per Pixel. Usually 32 (8 red, 8 green, 8 blue, 8 alpha).</p>
          </div>
          <div className="space-y-2">
            <strong className="text-white block">endian</strong>
            <p className="text-slate-500">Order of bytes. Big endian (RGB) vs Little endian (BGR). Check this if your colors look swapped!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryVisualizer;
