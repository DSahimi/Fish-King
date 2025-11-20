
export enum GameState {
  IDLE = 'IDLE',         // Player is standing still
  CASTING = 'CASTING',   // Animation of casting
  WAITING = 'WAITING',   // Line is in water, waiting for bite
  HOOKED = 'HOOKED',     // Fish bit, player needs to press space to hook
  REELING = 'REELING',   // The mini-game battle
  CAUGHT = 'CAUGHT',     // Success screen
  LOST = 'LOST'          // Fail screen
}

export enum GameMode {
  BOATING = 'BOATING',
  FISHING = 'FISHING'
}

export interface BoatState {
  x: number;
  y: number;
  rotation: number; // degrees
  speed: number;
}

export interface FishSpecies {
  id: string;
  name: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  baseDifficulty: number; // 1.0 to 3.0 multiplier for tension rise
  minWeight: number;
  maxWeight: number;
  color: string;
  description: string;
  image: string; // URL to photo
}

export interface CatchResult {
  species: FishSpecies;
  weight: number;
  score: number; // 1-100
  aiAnalysis?: string;
}
