
import React from 'react';
import { BoatState } from '../types';
import { Compass } from 'lucide-react';

interface BoatViewProps {
  boat: BoatState;
}

export const BoatView: React.FC<BoatViewProps> = ({ boat }) => {
  // We simulate movement by moving the background position opposite to boat coordinates
  const bgPositionX = -boat.x;
  const bgPositionY = -boat.y;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0f172a]">
      {/* Water Layer - Dark Stormy Ocean */}
      <div 
        className="absolute inset-[-500px] w-[calc(100%+1000px)] h-[calc(100%+1000px)]"
        style={{
            backgroundImage: `
                radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 100%),
                url("https://www.transparenttextures.com/patterns/water.png")
            `,
            backgroundColor: '#0f172a', // Dark slate/blue
            backgroundPosition: `${bgPositionX}px ${bgPositionY}px`,
            backgroundSize: '500px 500px',
            transition: 'background-position 0.05s linear'
        }}
      >
        {/* Stormy waves overlay */}
         <div 
            className="absolute inset-0 opacity-20 mix-blend-overlay"
            style={{
                background: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
                backgroundSize: '80px 80px',
                backgroundPosition: `${bgPositionX * 0.6}px ${bgPositionY * 0.6}px`
            }}
         />
         {/* Rain overlay in boat mode */}
         <div className="rain-layer absolute inset-0 opacity-30 pointer-events-none"></div>
      </div>

      {/* HUD */}
      <div className="absolute top-8 right-8 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white shadow-xl z-20">
        <div className="flex items-center gap-2 mb-2 text-yellow-400">
             <Compass size={20} />
             <span className="font-cinzel font-bold">NAVIGATION</span>
        </div>
        <div className="font-mono text-sm space-y-1 text-gray-300">
             <div>SPD: {(boat.speed * 10).toFixed(1)} knots</div>
             <div>HDG: {Math.round(boat.rotation)}°</div>
             <div>POS: {Math.round(boat.x)}, {Math.round(boat.y)}</div>
        </div>
        <div className="mt-4 text-xs text-gray-400 border-t border-gray-600 pt-2">
            <span className="px-1.5 py-0.5 bg-gray-700 rounded border border-gray-600 text-white">WASD</span> to Drive
            <br/>
            <span className="px-1.5 py-0.5 bg-gray-700 rounded border border-gray-600 text-white mt-1 inline-block">SPACE</span> to Fish
        </div>
      </div>
      
      {/* Prompt to fish if stopped */}
      {Math.abs(boat.speed) < 0.2 && (
         <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
             <div className="bg-yellow-500/90 text-black font-bold px-6 py-3 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.5)] border-2 border-white/20 backdrop-blur-sm uppercase tracking-widest cursor-pointer">
                 Press Space to Fish Here
             </div>
         </div>
      )}

      {/* Player Boat (Center of Screen) */}
      <div 
        className="absolute top-1/2 left-1/2 w-24 h-48 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-linear z-10"
        style={{ 
            transform: `translate(-50%, -50%) rotate(${boat.rotation}deg)` 
        }}
      >
         {/* Wake Effect behind boat */}
         {Math.abs(boat.speed) > 0.5 && (
            <div className="absolute top-[90%] left-1/2 transform -translate-x-1/2 w-full h-32 overflow-hidden opacity-60">
                 <div className="w-0 h-0 border-l-[30px] border-r-[30px] border-t-[100px] border-l-transparent border-r-transparent border-t-white/20 blur-sm"></div>
            </div>
         )}

         {/* Boat Hull - Darker for storm */}
         <div className="w-full h-full relative drop-shadow-2xl">
             {/* Main Body */}
             <div className="absolute inset-0 bg-slate-800 rounded-[50%_50%_5px_5px] clip-path-polygon border border-slate-700">
                  <div className="absolute top-0 left-0 right-0 h-16 bg-slate-700 rounded-[50%_50%_0_0] border-b border-slate-900"></div>
             </div>
             {/* Deck details */}
             <div className="absolute top-10 left-2 right-2 bottom-2 bg-[#5d4037] rounded-t-[40px] border border-black/30">
                 <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-12 bg-slate-300 rounded shadow-lg border border-slate-500">
                     {/* Seat */}
                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-8 bg-black rounded"></div>
                 </div>
                 {/* Motor */}
                 <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-black rounded border-t-4 border-gray-600"></div>
             </div>
         </div>
      </div>
    </div>
  );
};
