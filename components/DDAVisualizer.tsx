
import React, { useState, useEffect } from 'react';

const DDAVisualizer: React.FC = () => {
  const [step, setStep] = useState(0);
  const gridSize = 40;
  const width = 320;
  const height = 240;

  // Static Ray Config for Demo
  const start = { x: 1.2, y: 1.8 };
  const dir = { x: 0.8, y: -0.6 };
  
  // Math for DDA steps
  const deltaDistX = Math.abs(1 / dir.x);
  const deltaDistY = Math.abs(1 / dir.y);
  
  const mapX = Math.floor(start.x);
  const mapY = Math.floor(start.y);
  
  const stepX = dir.x < 0 ? -1 : 1;
  const stepY = dir.y < 0 ? -1 : 1;
  
  const initialSideDistX = dir.x < 0 ? (start.x - mapX) * deltaDistX : (mapX + 1.0 - start.x) * deltaDistX;
  const initialSideDistY = dir.y < 0 ? (start.y - mapY) * deltaDistY : (mapY + 1.0 - start.y) * deltaDistY;

  // Simulated steps
  const stepsData = [
    { mapX, mapY, sideX: initialSideDistX, sideY: initialSideDistY, hit: false },
    { mapX: mapX + 1, mapY: mapY, sideX: initialSideDistX + deltaDistX, sideY: initialSideDistY, hit: false },
    { mapX: mapX + 2, mapY: mapY, sideX: initialSideDistX + 2 * deltaDistX, sideY: initialSideDistY, hit: false },
    { mapX: mapX + 2, mapY: mapY - 1, sideX: initialSideDistX + 2 * deltaDistX, sideY: initialSideDistY + deltaDistY, hit: true },
  ];

  const currentData = stepsData[step];

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
        <svg width={width} height={height} className="mx-auto overflow-visible">
          {/* Grid */}
          {Array.from({ length: 9 }).map((_, i) => (
            <React.Fragment key={i}>
              <line x1={i * gridSize} y1={0} x2={i * gridSize} y2={height} stroke="#1e293b" />
              <line x1={0} y1={i * gridSize} x2={width} y2={i * gridSize} stroke="#1e293b" />
            </React.Fragment>
          ))}
          
          {/* The Wall at (3, 0) */}
          <rect x={3 * gridSize} y={0 * gridSize} width={gridSize} height={gridSize} fill="#f43f5e" fillOpacity="0.4" stroke="#f43f5e" />

          {/* DDA Steps */}
          {stepsData.slice(0, step + 1).map((s, i) => (
             <rect 
              key={i} 
              x={s.mapX * gridSize} 
              y={s.mapY * gridSize} 
              width={gridSize} 
              height={gridSize} 
              fill={s.hit ? "#f43f5e" : "#10b981"} 
              fillOpacity="0.2" 
              className="animate-pulse"
            />
          ))}

          {/* The Ray */}
          <line 
            x1={start.x * gridSize} 
            y1={start.y * gridSize} 
            x2={(start.x + dir.x * 2.5) * gridSize} 
            y2={(start.y + dir.y * 2.5) * gridSize} 
            stroke="#f8fafc" 
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Player Start */}
          <circle cx={start.x * gridSize} cy={start.y * gridSize} r={5} fill="#10b981" />
        </svg>

        <div className="absolute bottom-4 left-4 flex gap-2">
          <button 
            onClick={() => setStep(Math.max(0, step - 1))}
            className="px-3 py-1 bg-slate-800 rounded-lg hover:bg-slate-700 text-xs font-bold"
          >
            PREV
          </button>
          <button 
            onClick={() => setStep(Math.min(stepsData.length - 1, step + 1))}
            className="px-3 py-1 bg-emerald-500 text-slate-950 rounded-lg hover:bg-emerald-400 text-xs font-bold"
          >
            NEXT STEP
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest text-emerald-400">Step Data</h4>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">mapX:</span>
              <span>{currentData.mapX}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">mapY:</span>
              <span>{currentData.mapY}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">sideDistX:</span>
              <span className="text-blue-400">{currentData.sideX.toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">sideDistY:</span>
              <span className="text-rose-400">{currentData.sideY.toFixed(3)}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-sm text-slate-400 leading-relaxed">
          <p>
            <strong>The Algorithm:</strong><br/>
            If <span className="text-blue-400">sideDistX</span> &lt; <span className="text-rose-400">sideDistY</span>, 
            jump one unit on X and increment <code>sideDistX</code> by <code>deltaDistX</code>.
          </p>
          <p className="mt-2">
            Otherwise, jump one unit on Y. This guarantees we always check the <strong>closest next intersection</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DDAVisualizer;
