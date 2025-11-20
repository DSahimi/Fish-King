import React from 'react';
import { GameState } from '../types';

interface RodOverlayProps {
  gameState: GameState;
  tension: number;
}

export const RodOverlay: React.FC<RodOverlayProps> = ({ gameState, tension }) => {
  // Determine rod rotation/position based on state
  let rotation = 0;
  let translateX = 0;
  let translateY = 0;

  switch (gameState) {
    case GameState.IDLE:
      rotation = -5;
      break;
    case GameState.CASTING:
      rotation = -45; // Wind up
      break;
    case GameState.WAITING:
      rotation = 0;
      break;
    case GameState.REELING:
      // Rod bends based on tension
      rotation = 5 + (tension / 3); 
      translateY = tension / 1.5;
      break;
    case GameState.HOOKED:
      rotation = -25; // Jerk back
      break;
    case GameState.CAUGHT:
      rotation = -60; // Held up high
      break;
  }

  return (
    <div className="absolute bottom-0 right-0 pointer-events-none z-10 w-full h-full overflow-hidden">
        {/* Pivot wrapper */}
        <div 
            className={`absolute bottom-[-100px] right-[15%] w-[600px] h-[900px] transition-transform duration-300 ease-out origin-bottom-right ${gameState === GameState.REELING ? 'shake-element' : ''}`}
            style={{ 
                transform: `rotate(${rotation}deg) translate(${translateX}px, ${translateY}px)`,
            }}
        >
            {/* Rod Handle (Cork) */}
            <div className="absolute bottom-0 right-0 w-40 h-80 rounded-full transform rotate-6 origin-bottom-right shadow-2xl z-10 overflow-hidden border-r-2 border-black/30">
                <div className="w-full h-full bg-[#d4a373]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23b08968\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M5 0h1L0 6V5zM6 5v1H5z\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
            </div>

            {/* Rod Shaft (Carbon Fiber / Graphite) */}
            <div className="absolute bottom-48 right-24 w-3 h-[800px] bg-gradient-to-l from-gray-800 via-gray-700 to-gray-900 rounded-full transform -rotate-[12deg] origin-bottom-right shadow-xl">
                 {/* Highlights */}
                 <div className="absolute top-0 left-1 w-1 h-full bg-white/10 rounded-full"></div>
                 
                 {/* Eyelets (Guides) - Metallic */}
                <div className="absolute top-[5%] left-[-12px] w-5 h-5 border-2 border-gray-300 rounded-full shadow-sm skew-y-12 bg-transparent"></div>
                <div className="absolute top-[25%] left-[-10px] w-4 h-4 border-2 border-gray-300 rounded-full shadow-sm skew-y-12"></div>
                <div className="absolute top-[45%] left-[-8px] w-3 h-3 border-2 border-gray-300 rounded-full shadow-sm skew-y-12"></div>
                <div className="absolute top-[65%] left-[-6px] w-3 h-3 border-2 border-gray-300 rounded-full shadow-sm skew-y-12"></div>
                {/* Tip */}
                <div className="absolute top-0 left-[-2px] w-2 h-2 border-2 border-red-500 rounded-full bg-red-500 shadow-[0_0_5px_red]"></div>
            </div>
            
            {/* Reel Seat & Mechanism */}
            <div className="absolute bottom-56 right-16 w-20 h-24 z-20">
                {/* Reel Body */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-700 to-black rounded-lg border border-gray-600 shadow-2xl flex items-center justify-center">
                     <div className="w-20 h-20 rounded-full border-2 border-gray-500 bg-gray-800 relative overflow-hidden">
                        {/* Spool */}
                        <div className="absolute inset-2 bg-yellow-600/30 rounded-full border border-yellow-600/50"></div>
                        {/* Handle Arm */}
                        <div className={`absolute top-1/2 left-1/2 w-full h-2 bg-gray-400 origin-center transform -translate-y-1/2 -translate-x-1/2 ${gameState === GameState.REELING ? 'animate-spin' : ''}`} style={{ animationDuration: '0.15s' }}>
                             <div className="absolute right-0 top-1/2 w-6 h-8 bg-[#2a2a2a] rounded -translate-y-1/2 border border-gray-500"></div>
                             <div className="absolute left-0 top-1/2 w-6 h-8 bg-[#2a2a2a] rounded -translate-y-1/2 border border-gray-500"></div>
                        </div>
                     </div>
                </div>
            </div>
            
            {/* Line */}
            {gameState !== GameState.IDLE && (
               <div 
                 className="absolute top-0 left-0 w-[1px] bg-white/60 origin-bottom-right"
                 style={{ 
                    height: '1200px', 
                    transform: `rotate(${gameState === GameState.REELING || gameState === GameState.HOOKED ? 15 + (tension/5) : 25}deg) translate(10px, -50px)`,
                    opacity: 0.6
                 }}
               ></div>
            )}
        </div>
    </div>
  );
};