export type BiomeId = 'forest' | 'field' | 'city' | 'mountains' | 'tundra';

export interface Palette {
  skyTop: string;
  skyBottom: string;
  sun: string;
  farHill: string;
  midHill: string;
  ground: string;
  groundStripe: string;
}

export interface BiomeDef {
  id: BiomeId;
  palette: Palette;
  elementPool: ElementType[];
  density: number; // elements per 300px
}

export type ElementType =
  | 'spruce'
  | 'birch'
  | 'stump'
  | 'deer'
  | 'mushroom'
  | 'pole'
  | 'haystack'
  | 'sunflower'
  | 'cow'
  | 'house'
  | 'factory'
  | 'bridge_pillar'
  | 'rock'
  | 'snow_peak'
  | 'bare_tree'
  | 'hut'
  | 'fence';

export const BIOMES: Record<BiomeId, BiomeDef> = {
  forest: {
    id: 'forest',
    palette: {
      skyTop: '#4a90d9',
      skyBottom: '#87ceeb',
      sun: '#ffe066',
      farHill: '#3a6b3a',
      midHill: '#2e5a2e',
      ground: '#4a7c3f',
      groundStripe: '#3d6634',
    },
    elementPool: ['spruce', 'birch', 'stump', 'deer', 'mushroom', 'fence'],
    density: 5,
  },
  field: {
    id: 'field',
    palette: {
      skyTop: '#5ba3e8',
      skyBottom: '#aad4f5',
      sun: '#ffd700',
      farHill: '#8bc34a',
      midHill: '#7cb342',
      ground: '#a5c84a',
      groundStripe: '#8db03c',
    },
    elementPool: ['pole', 'haystack', 'sunflower', 'cow', 'fence'],
    density: 3,
  },
  city: {
    id: 'city',
    palette: {
      skyTop: '#607d8b',
      skyBottom: '#90a4ae',
      sun: '#ffd54f',
      farHill: '#78909c',
      midHill: '#546e7a',
      ground: '#616161',
      groundStripe: '#757575',
    },
    elementPool: ['house', 'factory', 'bridge_pillar', 'pole', 'fence'],
    density: 4,
  },
  mountains: {
    id: 'mountains',
    palette: {
      skyTop: '#1a3a5c',
      skyBottom: '#5b8db8',
      sun: '#ffe0b2',
      farHill: '#8d6e63',
      midHill: '#6d4c41',
      ground: '#5d4037',
      groundStripe: '#4e342e',
    },
    elementPool: ['rock', 'snow_peak', 'spruce', 'bare_tree'],
    density: 3,
  },
  tundra: {
    id: 'tundra',
    palette: {
      skyTop: '#263238',
      skyBottom: '#546e7a',
      sun: '#eceff1',
      farHill: '#90a4ae',
      midHill: '#78909c',
      ground: '#b0bec5',
      groundStripe: '#cfd8dc',
    },
    elementPool: ['bare_tree', 'hut', 'fence', 'pole'],
    density: 2,
  },
};

export const BIOME_ORDER: BiomeId[] = ['forest', 'field', 'city', 'mountains', 'tundra'];
