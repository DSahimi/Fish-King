
import React from 'react';

interface TensionGaugeProps {
  tension: number; // 0 to 100
}

export const TensionGauge: React.FC<TensionGaugeProps> = ({ tension }) => {
  // SVG parameters
  const size = 220;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // 240 degree arc
  const arcLength = circumference * 0.66; 
  // Ensure tension doesn't break math bounds
  const safeTension = Math.max(0, Math.min(100, tension));
  const offset = circumference - (safeTension / 100) * arcLength;
  
  // Color interpolation based on tension
  const getColor = (t: number) => {
    if (t < 40) return '#10b981'; // Green
    if (t < 70) return '#facc15'; // Yellow
    if (t < 90) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const color = getColor(safeTension);
  
  return (
    <div className="relative flex items-center justify-center drop-shadow-2xl" style={{ width: size, height: size }}>
      {/* Gauge Background - Metallic looking */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-800 to-black border-4 border-gray-700 shadow-inner"></div>
      
      {/* Inner Tick Marks / Decoration */}
      <div className="absolute inset-2 rounded-full border-2 border-dashed border-gray-700/50 opacity-50"></div>

      {/* Gauge Track (Empty) */}
      <svg className="absolute inset-0 transform -rotate-[210deg] z-10" width={size} height={size}>
         <circle
          stroke="#1f2937"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius - 10}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>

      {/* Gauge Value Bar (Filled) */}
      <svg className="absolute inset-0 transform -rotate-[210deg] z-20 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]" width={size} height={size}>
        <circle
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius - 10}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          // Removed transition class to prevent rubber-banding/bouncing effect
          style={{ transition: 'stroke 0.1s' }} 
        />
      </svg>
      
      {/* Center Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
        <div className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">Line Tension</div>
        <div className={`text-5xl font-mono font-bold tracking-tighter ${safeTension > 85 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
          {Math.round(safeTension)}<span className="text-2xl align-top opacity-50">%</span>
        </div>
      </div>
      
      {/* Critical Warning Light */}
      <div className={`absolute bottom-6 transition-all duration-100 w-12 h-1 rounded-full ${safeTension > 90 ? 'bg-red-600 shadow-[0_0_15px_#ef4444]' : 'bg-gray-800'}`}></div>
    </div>
  );
};
