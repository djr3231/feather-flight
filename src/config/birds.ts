export interface BirdConfig {
  key: string;
  name: string;
  baseSpeed: number;
  baseDrag: number;
  bounce: number;
  unlockCost: number; // in feathers, 0 = free
  color: number; // placeholder color
}

export const BIRDS: BirdConfig[] = [
  {
    key: 'sparrow',
    name: 'Sparrow',
    baseSpeed: 600,
    baseDrag: 50,
    bounce: 0.3,
    unlockCost: 0,
    color: 0x8B4513,
  },
  {
    key: 'eagle',
    name: 'Eagle',
    baseSpeed: 800,
    baseDrag: 35,
    bounce: 0.4,
    unlockCost: 5,
    color: 0x4A2800,
  },
  {
    key: 'albatross',
    name: 'Albatross',
    baseSpeed: 1000,
    baseDrag: 20,
    bounce: 0.5,
    unlockCost: 15,
    color: 0xCCCCCC,
  },
];
