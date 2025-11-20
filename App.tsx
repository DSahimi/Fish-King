
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, FishSpecies, CatchResult, GameMode, BoatState } from './types';
import { 
  FISH_SPECIES, 
  TENSION_DECAY_RATE, 
  TENSION_GAIN_RATE, 
  PROGRESS_GAIN_RATE, 
  CAST_DISTANCE, 
  FISH_FIGHT_CHANCE,
  BOAT_PHYSICS 
} from './constants';
import { TensionGauge } from './components/TensionGauge';
import { RodOverlay } from './components/RodOverlay';
import { Notification } from './components/Notifications';
import { BoatView } from './components/BoatView';
import { generateCatchAnalysis } from './services/geminiService';
import { playVictorySound, playSplashSound } from './services/audioService';
import confetti from 'canvas-confetti';
import { X, Anchor, Map as MapIcon, Camera, CloudRain, Wind } from 'lucide-react';

export default function App() {
  // --- State Management ---
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.BOATING);
  
  // Fishing Mechanics State
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [tension, setTension] = useState(0); // 0-100 scale
  const [distance, setDistance] = useState(CAST_DISTANCE); 
  const [currentFish, setCurrentFish] = useState<FishSpecies | null>(null);
  const [lastCatch, setLastCatch] = useState<CatchResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  
  // Boat Physics State
  const [boat, setBoat] = useState<BoatState>({ x: 0, y: 0, rotation: 0, speed: 0 });

  // --- Refs for Game Loop (Single Source of Truth) ---
  // We use refs to store the game state inside the requestAnimationFrame loop.
  // This avoids "stale closure" issues common in React useEffect hooks.
  const inputRef = useRef({ 
    space: false, 
    up: false, 
    down: false, 
    left: false, 
    right: false 
  });
  const gameLoopRef = useRef<number>();
  const gameStateRef = useRef(gameState);
  const distanceRef = useRef(distance);
  const tensionRef = useRef(tension);
  const boatRef = useRef(boat);
  const gameModeRef = useRef(gameMode);
  const currentFishRef = useRef<FishSpecies | null>(null);

  // Sync refs with React state for rendering
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { distanceRef.current = distance; }, [distance]);
  useEffect(() => { tensionRef.current = tension; }, [tension]);
  useEffect(() => { boatRef.current = boat; }, [boat]);
  useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);
  // Note: currentFishRef is updated manually where setCurrentFish is called to ensure instant availability

  // --- Game Logic Helpers ---

  const getRandomFish = () => {
    const roll = Math.random();
    let pool = FISH_SPECIES.filter(f => f.rarity === 'Common');
    if (roll > 0.6) pool = FISH_SPECIES.filter(f => f.rarity === 'Uncommon');
    if (roll > 0.85) pool = FISH_SPECIES.filter(f => f.rarity === 'Rare');
    if (roll > 0.95) pool = FISH_SPECIES.filter(f => f.rarity === 'Legendary');
    
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleCast = () => {
    if (gameState !== GameState.IDLE) return;
    
    setGameState(GameState.CASTING);
    setTimeout(() => {
      setGameState(GameState.WAITING);
      playSplashSound();
      const waitTime = Math.random() * 3000 + 2000;
      
      // Set a timeout to trigger bite, but check state before executing
      setTimeout(() => {
        if (gameStateRef.current === GameState.WAITING) {
           triggerBite();
        }
      }, waitTime);
    }, 800); 
  };

  const triggerBite = () => {
    setGameState(GameState.HOOKED);
    const fish = getRandomFish();
    setCurrentFish(fish);
    currentFishRef.current = fish; // CRITICAL: Update ref immediately for loop
    
    // Auto-fail if not hooked in time
    setTimeout(() => {
      if (gameStateRef.current === GameState.HOOKED) {
        setGameState(GameState.LOST);
        setTimeout(() => setGameState(GameState.IDLE), 2000);
      }
    }, 1500);
  };

  const startReeling = () => {
    const newTension = 30;
    const newDist = CAST_DISTANCE;
    
    // Update State
    setGameState(GameState.REELING);
    setDistance(newDist);
    setTension(newTension);

    // Update Refs immediately for the loop
    gameStateRef.current = GameState.REELING;
    tensionRef.current = newTension;
    distanceRef.current = newDist;
  };

  const finishGame = async (success: boolean) => {
    const fish = currentFishRef.current; // Use ref
    
    if (success && fish) {
      setGameState(GameState.CAUGHT);
      gameStateRef.current = GameState.CAUGHT;
      
      playVictorySound();
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, gravity: 0.8 });
      
      const weightRange = fish.maxWeight - fish.minWeight;
      const randomWeight = fish.minWeight + (Math.random() * weightRange);
      const sizeRatio = (randomWeight - fish.minWeight) / weightRange;
      const score = Math.max(1, Math.round(sizeRatio * 100));

      setLastCatch({
        species: fish,
        weight: randomWeight,
        score: score
      });
      setShowModal(true);
      
      setLoadingAnalysis(true);
      const analysis = await generateCatchAnalysis(fish.name, randomWeight, score, fish.rarity);
      setAiAnalysis(analysis);
      setLoadingAnalysis(false);

    } else {
      setGameState(GameState.LOST);
      gameStateRef.current = GameState.LOST;
      
      setTimeout(() => {
        // Reset Logic
        setGameState(GameState.IDLE);
        setTension(0);
        setDistance(CAST_DISTANCE);
        
        // Reset Refs
        gameStateRef.current = GameState.IDLE;
        tensionRef.current = 0;
        distanceRef.current = CAST_DISTANCE;
      }, 2000);
    }
  };

  const handleMoveLocation = () => {
    setShowModal(false);
    setGameMode(GameMode.BOATING);
    setGameState(GameState.IDLE);
    setTension(0);
  };

  // --- Input Handling ---
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Movement keys
    if (e.code === 'ArrowUp' || e.code === 'KeyW') inputRef.current.up = true;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') inputRef.current.down = true;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') inputRef.current.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') inputRef.current.right = true;
    
    if (e.code === 'Space') {
      if (!inputRef.current.space) {
        inputRef.current.space = true;
        
        if (gameModeRef.current === GameMode.BOATING) {
            if (Math.abs(boatRef.current.speed) < 1.0) {
                setGameMode(GameMode.FISHING);
                setGameState(GameState.IDLE);
            }
        } else if (gameModeRef.current === GameMode.FISHING) {
            if (gameStateRef.current === GameState.IDLE) handleCast();
            else if (gameStateRef.current === GameState.HOOKED) startReeling();
        }
      }
    }

    if (e.code === 'Escape' && gameModeRef.current === GameMode.FISHING && !showModal) {
        setGameMode(GameMode.BOATING);
    }

  }, [showModal]); // Dependencies

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') inputRef.current.up = false;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') inputRef.current.down = false;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') inputRef.current.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') inputRef.current.right = false;
    if (e.code === 'Space') inputRef.current.space = false;
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // --- Physics Engine Loop ---
  // Runs continuously on animation frames. 
  // Uses refs to read inputs/state and write new state to prevent closure staleness.
  const gameLoop = useCallback(() => {
    const mode = gameModeRef.current;
    const state = gameStateRef.current;

    // --- Boating Physics ---
    if (mode === GameMode.BOATING) {
        let { x, y, rotation, speed } = boatRef.current;
        const { ACCEL, MAX_SPEED, TURN_SPEED, FRICTION } = BOAT_PHYSICS;

        if (inputRef.current.up) speed += ACCEL;
        if (inputRef.current.down) speed -= ACCEL;
        
        // Clamp Speed
        if (speed > MAX_SPEED) speed = MAX_SPEED;
        if (speed < -MAX_SPEED / 2) speed = -MAX_SPEED / 2;

        speed *= FRICTION;

        // Turn only if moving
        if (Math.abs(speed) > 0.1) {
            if (inputRef.current.left) rotation -= TURN_SPEED * (speed > 0 ? 1 : -1);
            if (inputRef.current.right) rotation += TURN_SPEED * (speed > 0 ? 1 : -1);
        }

        const rad = (rotation - 90) * (Math.PI / 180); 
        const vx = Math.cos(rad) * speed;
        const vy = Math.sin(rad) * speed;

        x += vx;
        y += vy;

        const newBoatState = { x, y, rotation, speed };
        boatRef.current = newBoatState;
        setBoat(newBoatState);
    }

    // --- Fishing Physics ---
    else if (mode === GameMode.FISHING) {
        // Check if we are reeling and have a fish
        if (state === GameState.REELING && currentFishRef.current) {
            let newTension = tensionRef.current;
            let newDistance = distanceRef.current;
            const difficulty = currentFishRef.current.baseDifficulty;

            // Input Physics
            if (inputRef.current.space) {
                // Holding Space: Tension UP, Distance DOWN (Good)
                const tensionPenalty = newTension > 85 ? 0.2 : 1.0; // Pull less effectively if tension is too high
                newTension += TENSION_GAIN_RATE * difficulty; 
                newDistance -= PROGRESS_GAIN_RATE * tensionPenalty;
            } else {
                // Releasing Space: Tension DOWN, Distance UP (Bad)
                newTension -= TENSION_DECAY_RATE;
                newDistance += (PROGRESS_GAIN_RATE * 0.2); // Fish swims away slower than before
            }

            // Random Fish Struggle Physics
            if (Math.random() < FISH_FIGHT_CHANCE * difficulty) {
                newTension += 5 + (Math.random() * 5); // Reduced jerk intensity
            }

            // Clamping
            newTension = Math.max(0, Math.min(100, newTension));
            newDistance = Math.max(0, Math.min(100, newDistance));

            // Check Win/Loss
            let roundOver = false;
            if (newTension >= 100) {
                finishGame(false); // Snap
                roundOver = true;
            } else if (newDistance <= 0) {
                finishGame(true); // Catch
                roundOver = true;
            }

            // Apply updates if round isn't over
            if (!roundOver) {
                tensionRef.current = newTension;
                distanceRef.current = newDistance;
                setTension(newTension);
                setDistance(newDistance);
            }
        }
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, []); // No dependencies ensures loop never restarts and always uses refs

  // Initialize loop
  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameLoop]);

  // --- Render ---

  if (gameMode === GameMode.BOATING) {
      return <BoatView boat={boat} />;
  }

  // Fallback background gradient in case image fails
  const oceanGradient = "radial-gradient(circle at center, #1a2b3c 0%, #000000 100%)";
  const bgImage = "url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070&auto=format&fit=crop')";

  return (
    <div 
        className="relative w-full h-screen bg-black overflow-hidden text-white select-none font-sans"
        style={{ background: oceanGradient }}
    >
      {/* Dynamic Background Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-in-out"
        style={{ 
            backgroundImage: bgImage, 
            opacity: 0.8,
            transform: gameState === GameState.REELING ? 'scale(1.05)' : 'scale(1)' 
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      
      {/* Animated Storm Waves CSS */}
      <div className="absolute inset-0 opacity-30 mix-blend-overlay" 
           style={{ 
             backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, #fff 20px, #fff 40px)',
             animation: 'wave 10s linear infinite',
             filter: 'blur(10px)'
           }}>
      </div>

      {/* Rain Effect */}
      <div className="rain-layer absolute inset-0 pointer-events-none z-10 opacity-40"></div>

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/80 pointer-events-none z-10" />

      {/* BOAT DECK (The player's feet) */}
      <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 w-[120vw] h-[200px] z-10 pointer-events-none overflow-hidden">
          <div 
            className={`w-full h-full bg-[#5d4037] rounded-[50%_50%_0_0] border-t-[8px] border-gray-600 shadow-2xl flex justify-center relative ${gameState === GameState.REELING ? 'shake-element' : 'animate-pulse'}`}
            style={{ animationDuration: '3s' }}
           >
              {/* Wood Planks Pattern */}
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 48px, #000 50px)' }}></div>
              
              {/* Stern Cleats */}
              <div className="absolute top-4 left-[20%] w-16 h-6 bg-gray-400 rounded shadow-lg"></div>
              <div className="absolute top-4 right-[20%] w-16 h-6 bg-gray-400 rounded shadow-lg"></div>
              
              {/* Water sloshing near boat */}
              <div className="absolute -bottom-10 left-0 w-full h-20 bg-white/10 blur-xl animate-pulse"></div>
          </div>
      </div>

      {/* Weather HUD */}
      <div className="absolute top-6 left-6 flex flex-col gap-1 z-20">
        <div className="flex items-center gap-2 text-blue-200 bg-black/60 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
            <CloudRain size={18} className="text-blue-400" />
            <span className="text-xs font-bold tracking-widest uppercase">Storm Front</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400 bg-black/60 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
            <Wind size={18} className="text-gray-400" />
            <span className="text-xs font-bold tracking-widest uppercase">Wind: 24kn</span>
        </div>
      </div>

      {/* Notifications System */}
      <Notification message="CASTING..." visible={gameState === GameState.CASTING} type="info" />
      <Notification message="WAITING..." visible={gameState === GameState.WAITING} type="info" />
      <Notification message="FISH ON! HOLD SPACE!" visible={gameState === GameState.HOOKED} type="warning" />
      <Notification message="LINE SNAPPED!" visible={gameState === GameState.LOST && tensionRef.current >= 99} type="danger" />
      <Notification message="FISH ESCAPED!" visible={gameState === GameState.LOST && tensionRef.current < 99} type="danger" />
      <Notification message="CAUGHT!" visible={gameState === GameState.CAUGHT} type="success" />

      {/* Main HUD (Bottom) */}
      <div className="absolute bottom-0 left-0 w-full p-8 flex items-end justify-between pointer-events-none z-40">
        
        {/* Left: Tension & Distance */}
        <div className="flex items-end gap-8 pointer-events-auto">
          {/* Tension Gauge */}
          <div className={`transition-all duration-300 ${gameState === GameState.REELING ? 'opacity-100 scale-110' : 'opacity-80 scale-90'}`}>
            <TensionGauge tension={tension} />
          </div>
          
          {/* Distance Meter */}
          {gameState === GameState.REELING && (
             <div className="mb-12 flex flex-col gap-2 animate-in slide-in-from-bottom-10 duration-300">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-blue-300 drop-shadow-md px-1">
                    <span>Distance to Boat</span>
                    <span>{(distance / 3).toFixed(1)}m</span>
                </div>
                {/* Bar container */}
                <div className="w-80 h-4 bg-gray-900/90 rounded-full backdrop-blur-sm overflow-hidden border border-gray-600 shadow-xl">
                    {/* Bar Fill */}
                    <div 
                        className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-white shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                        style={{ width: `${Math.max(0, 100 - distance)}%`, transition: 'width 0.1s linear' }}
                    />
                </div>
             </div>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex flex-col items-end gap-4">
            {gameState === GameState.IDLE && (
                <button 
                    onClick={() => setGameMode(GameMode.BOATING)}
                    className="pointer-events-auto flex items-center gap-2 bg-blue-900/30 hover:bg-blue-900/50 backdrop-blur-md px-6 py-3 rounded-lg text-blue-100 font-cinzel font-bold border border-blue-500/30 transition-all shadow-lg hover:shadow-blue-500/20"
                >
                    <Anchor size={18} />
                    Return to Boat
                </button>
            )}

            <div className="bg-black/80 backdrop-blur-xl p-6 rounded-xl border border-white/10 text-right shadow-2xl">
               <h2 className="text-lg font-bold text-yellow-500 mb-3 font-cinzel tracking-wider border-b border-white/10 pb-2">CONTROLS</h2>
               <div className="flex items-center justify-end gap-3">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">
                    {gameState === GameState.REELING ? "Hold to Reel / Release to Rest" : "Press to Cast / Hook"}
                  </span>
                  <div className={`px-4 py-2 rounded border transition-all duration-100 ${inputRef.current.space ? 'bg-white text-black border-white scale-95' : 'bg-gray-800 text-white border-gray-600'}`}>
                      <span className="font-bold font-mono">SPACE</span>
                  </div>
               </div>
            </div>
        </div>
      </div>

      {/* Rod Overlay */}
      <RodOverlay gameState={gameState} tension={tension} />

      {/* Catch Result Modal */}
      {showModal && lastCatch && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-700 w-full max-w-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden rounded-lg">
                
                {/* Fish Photo */}
                <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-gray-900">
                    <img 
                        src={lastCatch.species.image} 
                        alt={lastCatch.species.name}
                        className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4">
                        <span className={`text-xs font-bold px-3 py-1 uppercase tracking-widest rounded shadow-lg text-black ${
                            lastCatch.species.rarity === 'Legendary' ? 'bg-yellow-500' :
                            lastCatch.species.rarity === 'Rare' ? 'bg-purple-500' :
                            lastCatch.species.rarity === 'Uncommon' ? 'bg-blue-400' : 'bg-gray-300'
                        }`}>
                            {lastCatch.species.rarity}
                        </span>
                    </div>
                </div>

                {/* Details Panel */}
                <div className="w-full md:w-1/2 p-8 flex flex-col border-l border-gray-800">
                    <button 
                        onClick={() => { setShowModal(false); setGameState(GameState.IDLE); setTension(0); }}
                        className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="mb-8">
                        <h2 className="text-green-500 text-xs font-bold tracking-[0.3em] uppercase mb-2">Successfully Caught</h2>
                        <h1 className="text-4xl font-cinzel font-bold text-white drop-shadow-lg leading-tight">
                            {lastCatch.species.name}
                        </h1>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-800/50 p-4 rounded border border-white/5">
                            <div className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Weight</div>
                            <div className="text-3xl font-bold text-white font-mono">{lastCatch.weight.toFixed(2)}<span className="text-lg text-gray-500 ml-1">lbs</span></div>
                        </div>
                        <div className="bg-gray-800/50 p-4 rounded border border-white/5">
                             <div className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Score</div>
                             <div className="text-3xl font-bold text-yellow-500 font-mono">{lastCatch.score}<span className="text-lg text-gray-600 ml-1">/100</span></div>
                        </div>
                    </div>

                    <div className="bg-blue-900/20 p-5 rounded border border-blue-500/20 flex-grow mb-8">
                        <div className="flex items-center gap-2 mb-3 text-blue-400">
                             <Camera size={16} />
                             <span className="text-xs font-bold uppercase tracking-widest">AI Analysis</span>
                        </div>
                        <p className="text-gray-300 text-sm font-serif italic leading-relaxed">
                            {loadingAnalysis ? (
                                <span className="animate-pulse text-gray-500">Consulting the fishing almanac...</span>
                            ) : (
                                `"${aiAnalysis}"`
                            )}
                        </p>
                    </div>

                    <div className="flex gap-4 mt-auto">
                         <button 
                            onClick={() => { setShowModal(false); setGameState(GameState.IDLE); setTension(0); }}
                            className="flex-1 bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-4 rounded transition-all shadow-lg uppercase tracking-widest text-xs"
                        >
                            Cast Again
                        </button>
                        <button 
                            onClick={handleMoveLocation}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded transition-all shadow-lg uppercase tracking-widest text-xs border border-gray-600 flex items-center justify-center gap-2"
                        >
                            <MapIcon size={16} />
                            Move Boat
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
