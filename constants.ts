
import { FishSpecies } from './types';

export const FISH_SPECIES: FishSpecies[] = [
  {
    id: 'bluegill',
    name: 'Bluegill',
    rarity: 'Common',
    baseDifficulty: 0.8, // Slightly harder base to balance easy mechanics
    minWeight: 0.5,
    maxWeight: 2.0,
    color: '#a8dadc',
    description: "A small, common freshwater fish. Good for beginners.",
    image: "https://images.unsplash.com/photo-1576515652031-fc429bab6503?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 'bass',
    name: 'Largemouth Bass',
    rarity: 'Common',
    baseDifficulty: 1.0,
    minWeight: 2.0,
    maxWeight: 12.0,
    color: '#457b9d',
    description: "The most popular game fish. Puts up a decent fight.",
    image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 'trout',
    name: 'Rainbow Trout',
    rarity: 'Uncommon',
    baseDifficulty: 1.2,
    minWeight: 3.0,
    maxWeight: 18.0,
    color: '#e63946',
    description: "Known for its colorful pattern and energetic leaps.",
    image: "https://images.unsplash.com/photo-1516683037151-9a6660c92e03?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 'pike',
    name: 'Northern Pike',
    rarity: 'Rare',
    baseDifficulty: 1.5,
    minWeight: 10.0,
    maxWeight: 35.0,
    color: '#1d3557',
    description: "An aggressive predator with sharp teeth. Handles tension poorly.",
    image: "https://images.unsplash.com/photo-1604325303621-2e9066532198?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 'catfish',
    name: 'Giant Catfish',
    rarity: 'Rare',
    baseDifficulty: 1.8,
    minWeight: 20.0,
    maxWeight: 70.0,
    color: '#6d6875',
    description: "A bottom dweller that uses its massive weight to snap lines.",
    image: "https://images.unsplash.com/photo-1575540325855-0054e469761d?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 'legendary_carp',
    name: 'Golden Carp',
    rarity: 'Legendary',
    baseDifficulty: 2.2,
    minWeight: 40.0,
    maxWeight: 100.0,
    color: '#ffd700',
    description: "The guardian of the river. Only the best anglers can reel this in.",
    image: "https://images.unsplash.com/photo-1507153655669-6729c1c81714?q=80&w=1000&auto=format&fit=crop"
  }
];

// Game mechanics constants - Tuned for easier, smoother feel
export const TENSION_DECAY_RATE = 2.5; // Drops very fast when released (Good for saving)
export const TENSION_GAIN_RATE = 0.4;  // Rises slower (Easier to manage)
export const PROGRESS_GAIN_RATE = 0.6; // Fish comes in much faster
export const FISH_FIGHT_CHANCE = 0.008; // Very rare random jerks to prevent "bouncing"
export const CAST_DISTANCE = 100;
