
import React, { useState, useEffect, useRef } from 'react';

interface UnitCircleProps {
  angle: number;
  setAngle: (val: number) => void;
}

const UnitCircle: React.FC<UnitCircleProps> = ({ angle, setAngle }) => {
  const size = 300;
  const radius = 100;
  const center = size / 2;

  const x = center + Math.cos(angle) * radius;
  const y = center - Math.sin(angle) * radius; // Inverted Y for screen coords

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.buttons !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - rect.left - center;
    const dy = e.clientY - rect.top - center;
    let newAngle = Math.atan2(-dy, dx);
    if (newAngle < 0) newAngle += Math.PI * 2;
    setAngle(newAngle);
  };

  const arcPath = () => {
    const endX = center + Math.cos(angle) * radius;
    const endY = center - Math.sin(angle) * radius;
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    return `M ${center + radius} ${center} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endX} ${endY}`;
  };

  return (
    <div className="flex flex-col items-center bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
      <h3 className="text-xl font-bold mb-4 text-emerald-400">1. The Unit Circle</h3>
      <div className="relative cursor-crosshair">
        <svg width={size} height={size} onMouseMove={handleMouseMove} onMouseDown={handleMouseMove}>
          {/* Grid lines */}
          <line x1={0} y1={center} x2={size} y2={center} stroke="#334155" strokeWidth="1" />
          <line x1={center} y1={0} x2={center} y2={size} stroke="#334155" strokeWidth="1" />
          
          {/* Base Circle */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
          
          {/* Arc Length (θ) */}
          <path d={arcPath()} fill="none" stroke="#10b981" strokeWidth="4" className="transition-all duration-75" />
          
          {/* Radius Line */}
          <line x1={center} y1={center} x2={x} y2={y} stroke="#f8fafc" strokeWidth="2" />
          
          {/* Projection Lines */}
          <line x1={x} y1={y} x2={x} y2={center} stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 3" /> {/* Sin projection */}
          <line x1={x} y1={y} x2={center} y2={y} stroke="#3b82f6" strokeWidth="2" strokeDasharray="3 3" /> {/* Cos projection */}

          {/* Point */}
          <circle cx={x} cy={y} r={6} fill="#f8fafc" />
          
          {/* Labels */}
          <text x={center + radius + 10} y={center - 5} fill="#475569" className="text-xs">r = 1</text>
        </svg>

        {/* Dynamic HUD */}
        <div className="absolute top-0 right-0 p-2 bg-slate-950/80 rounded border border-slate-800 text-xs mono">
          <div className="text-emerald-400">θ: {angle.toFixed(3)} rad</div>
          <div className="text-slate-400">Arc: {angle.toFixed(3)} units</div>
          <div className="text-blue-400">Cos(θ): {Math.cos(angle).toFixed(3)}</div>
          <div className="text-rose-400">Sin(θ): {Math.sin(angle).toFixed(3)}</div>
        </div>
      </div>
      <div className="mt-4 text-sm text-slate-400 max-w-xs text-center">
        On a circle with radius 1, the <strong>angle θ</strong> is exactly equal to the <strong>arc distance</strong> traveled.
      </div>
    </div>
  );
};

export default UnitCircle;
