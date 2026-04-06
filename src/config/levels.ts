export interface ObstacleConfig {
  type: 'air_current' | 'plane' | 'hurricane';
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  targetDistance: number; // in "meters" (pixels / 5)
  backgroundTier: 'forest' | 'mountain' | 'desert' | 'city';
  obstacles: ObstacleConfig[];
  coinsPerMeter: number; // coins earned per meter traveled
  hasFeather: boolean;
  featherDistance?: number; // meters from start where feather appears
  featherAltitude?: number; // altitude in meters for feather
  starThresholds: [number, number, number]; // % of target distance for 1/2/3 stars
}

export const LEVELS: LevelConfig[] = [
  // FOREST (Levels 1-5) - Easy, learning the basics
  {
    id: 1, name: 'Gentle Meadow', targetDistance: 400,
    backgroundTier: 'forest', obstacles: [],
    coinsPerMeter: 0.5, hasFeather: false,
    starThresholds: [50, 80, 100],
  },
  {
    id: 2, name: 'Green Valley', targetDistance: 600,
    backgroundTier: 'forest', obstacles: [],
    coinsPerMeter: 0.5, hasFeather: false,
    starThresholds: [50, 80, 100],
  },
  {
    id: 3, name: 'Deep Forest', targetDistance: 800,
    backgroundTier: 'forest', obstacles: [],
    coinsPerMeter: 0.6, hasFeather: true,
    featherDistance: 500, featherAltitude: 40,
    starThresholds: [50, 80, 100],
  },
  {
    id: 4, name: 'Windy Woods', targetDistance: 900,
    backgroundTier: 'forest',
    obstacles: [
      { type: 'air_current', x: 2000, y: 300, width: 200, height: 300 },
    ],
    coinsPerMeter: 0.6, hasFeather: false,
    starThresholds: [50, 80, 100],
  },
  {
    id: 5, name: 'Forest Edge', targetDistance: 1000,
    backgroundTier: 'forest',
    obstacles: [
      { type: 'air_current', x: 1500, y: 250, width: 200, height: 350 },
      { type: 'air_current', x: 3000, y: 300, width: 250, height: 300 },
    ],
    coinsPerMeter: 0.7, hasFeather: false,
    starThresholds: [50, 80, 100],
  },

  // MOUNTAIN (Levels 6-10)
  {
    id: 6, name: 'Mountain Pass', targetDistance: 1200,
    backgroundTier: 'mountain',
    obstacles: [
      { type: 'air_current', x: 2000, y: 200, width: 300, height: 400 },
    ],
    coinsPerMeter: 0.8, hasFeather: true,
    featherDistance: 800, featherAltitude: 60,
    starThresholds: [50, 80, 100],
  },
  {
    id: 7, name: 'Eagle Peak', targetDistance: 1500,
    backgroundTier: 'mountain',
    obstacles: [
      { type: 'air_current', x: 2500, y: 200, width: 250, height: 350 },
      { type: 'plane', x: 4000, y: 300 },
    ],
    coinsPerMeter: 0.8, hasFeather: false,
    starThresholds: [50, 80, 100],
  },
  {
    id: 8, name: 'Frozen Ridge', targetDistance: 1700,
    backgroundTier: 'mountain',
    obstacles: [
      { type: 'air_current', x: 2000, y: 250, width: 200, height: 300 },
      { type: 'plane', x: 3500, y: 250 },
      { type: 'air_current', x: 5000, y: 200, width: 300, height: 400 },
    ],
    coinsPerMeter: 0.9, hasFeather: false,
    starThresholds: [50, 80, 100],
  },
  {
    id: 9, name: 'Summit Trail', targetDistance: 2000,
    backgroundTier: 'mountain',
    obstacles: [
      { type: 'plane', x: 2500, y: 350 },
      { type: 'air_current', x: 4000, y: 200, width: 300, height: 350 },
      { type: 'plane', x: 6000, y: 250 },
    ],
    coinsPerMeter: 1.0, hasFeather: true,
    featherDistance: 1500, featherAltitude: 70,
    starThresholds: [50, 80, 100],
  },
  {
    id: 10, name: 'Avalanche Alley', targetDistance: 2200,
    backgroundTier: 'mountain',
    obstacles: [
      { type: 'air_current', x: 1500, y: 200, width: 250, height: 400 },
      { type: 'plane', x: 3000, y: 300 },
      { type: 'air_current', x: 5000, y: 250, width: 200, height: 300 },
      { type: 'plane', x: 7000, y: 200 },
    ],
    coinsPerMeter: 1.0, hasFeather: false,
    starThresholds: [50, 80, 100],
  },

  // DESERT (Levels 11-15)
  {
    id: 11, name: 'Desert Entry', targetDistance: 2500,
    backgroundTier: 'desert',
    obstacles: [
      { type: 'air_current', x: 2000, y: 200, width: 300, height: 400 },
      { type: 'hurricane', x: 5000, y: 300, width: 200, height: 200 },
    ],
    coinsPerMeter: 1.1, hasFeather: false,
    starThresholds: [50, 80, 100],
  },
  {
    id: 12, name: 'Sand Storm', targetDistance: 2800,
    backgroundTier: 'desert',
    obstacles: [
      { type: 'hurricane', x: 3000, y: 250, width: 250, height: 250 },
      { type: 'plane', x: 5000, y: 300 },
      { type: 'air_current', x: 7000, y: 200, width: 300, height: 350 },
    ],
    coinsPerMeter: 1.2, hasFeather: true,
    featherDistance: 2200, featherAltitude: 80,
    starThresholds: [50, 80, 100],
  },
  {
    id: 13, name: 'Canyon Run', targetDistance: 3200,
    backgroundTier: 'desert',
    obstacles: [
      { type: 'air_current', x: 2000, y: 150, width: 200, height: 450 },
      { type: 'hurricane', x: 4000, y: 300, width: 200, height: 200 },
      { type: 'plane', x: 6000, y: 250 },
      { type: 'air_current', x: 8000, y: 200, width: 250, height: 350 },
    ],
    coinsPerMeter: 1.2, hasFeather: false,
    starThresholds: [50, 80, 100],
  },
  {
    id: 14, name: 'Oasis Mirage', targetDistance: 3500,
    backgroundTier: 'desert',
    obstacles: [
      { type: 'plane', x: 2500, y: 350 },
      { type: 'hurricane', x: 4500, y: 250, width: 250, height: 250 },
      { type: 'air_current', x: 6500, y: 200, width: 300, height: 400 },
      { type: 'plane', x: 9000, y: 200 },
    ],
    coinsPerMeter: 1.3, hasFeather: false,
    starThresholds: [50, 80, 100],
  },
  {
    id: 15, name: 'Scorching Winds', targetDistance: 3800,
    backgroundTier: 'desert',
    obstacles: [
      { type: 'hurricane', x: 2000, y: 200, width: 300, height: 300 },
      { type: 'plane', x: 4000, y: 300 },
      { type: 'hurricane', x: 6000, y: 250, width: 250, height: 250 },
      { type: 'air_current', x: 8000, y: 150, width: 350, height: 450 },
      { type: 'plane', x: 10000, y: 250 },
    ],
    coinsPerMeter: 1.4, hasFeather: true,
    featherDistance: 3000, featherAltitude: 90,
    starThresholds: [50, 80, 100],
  },

  // CITY (Levels 16-20)
  {
    id: 16, name: 'Suburbs', targetDistance: 4000,
    backgroundTier: 'city',
    obstacles: [
      { type: 'air_current', x: 2000, y: 200, width: 250, height: 400 },
      { type: 'plane', x: 4000, y: 250 },
      { type: 'hurricane', x: 6000, y: 300, width: 200, height: 200 },
      { type: 'plane', x: 8500, y: 200 },
    ],
    coinsPerMeter: 1.5, hasFeather: false,
    starThresholds: [50, 80, 100],
  },
  {
    id: 17, name: 'Downtown', targetDistance: 4500,
    backgroundTier: 'city',
    obstacles: [
      { type: 'plane', x: 2000, y: 300 },
      { type: 'hurricane', x: 3500, y: 200, width: 300, height: 300 },
      { type: 'air_current', x: 5500, y: 150, width: 300, height: 450 },
      { type: 'plane', x: 7500, y: 250 },
      { type: 'hurricane', x: 10000, y: 300, width: 250, height: 250 },
    ],
    coinsPerMeter: 1.6, hasFeather: false,
    starThresholds: [50, 80, 100],
  },
  {
    id: 18, name: 'Skyscraper Alley', targetDistance: 5000,
    backgroundTier: 'city',
    obstacles: [
      { type: 'hurricane', x: 2000, y: 250, width: 250, height: 250 },
      { type: 'plane', x: 3500, y: 200 },
      { type: 'air_current', x: 5000, y: 150, width: 350, height: 450 },
      { type: 'hurricane', x: 7000, y: 200, width: 300, height: 300 },
      { type: 'plane', x: 9500, y: 300 },
      { type: 'air_current', x: 12000, y: 200, width: 300, height: 400 },
    ],
    coinsPerMeter: 1.7, hasFeather: true,
    featherDistance: 4000, featherAltitude: 100,
    starThresholds: [50, 80, 100],
  },
  {
    id: 19, name: 'Rooftop Chase', targetDistance: 5500,
    backgroundTier: 'city',
    obstacles: [
      { type: 'plane', x: 1500, y: 350 },
      { type: 'hurricane', x: 3000, y: 200, width: 300, height: 300 },
      { type: 'plane', x: 5000, y: 250 },
      { type: 'air_current', x: 7000, y: 150, width: 400, height: 450 },
      { type: 'hurricane', x: 9000, y: 250, width: 250, height: 250 },
      { type: 'plane', x: 11000, y: 200 },
    ],
    coinsPerMeter: 1.8, hasFeather: false,
    starThresholds: [50, 80, 100],
  },
  {
    id: 20, name: 'Sky\'s the Limit', targetDistance: 6000,
    backgroundTier: 'city',
    obstacles: [
      { type: 'hurricane', x: 2000, y: 200, width: 300, height: 300 },
      { type: 'plane', x: 3500, y: 300 },
      { type: 'air_current', x: 5000, y: 150, width: 350, height: 450 },
      { type: 'plane', x: 7000, y: 200 },
      { type: 'hurricane', x: 9000, y: 250, width: 300, height: 300 },
      { type: 'air_current', x: 11000, y: 200, width: 300, height: 400 },
      { type: 'plane', x: 13000, y: 250 },
    ],
    coinsPerMeter: 2.0, hasFeather: true,
    featherDistance: 5000, featherAltitude: 110,
    starThresholds: [50, 80, 100],
  },
];
