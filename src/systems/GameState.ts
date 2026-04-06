import { SaveManager } from './SaveManager';

export interface GameStateData {
  coins: number;
  feathers: number;
  currentLevel: number; // highest unlocked level
  selectedBird: string;
  unlockedBirds: string[];
  upgrades: {
    flightDistance: number;
    speed: number;
  };
  levelStars: Record<number, number>; // levelId -> stars (1-3)
}

const DEFAULT_STATE: GameStateData = {
  coins: 0,
  feathers: 0,
  currentLevel: 1,
  selectedBird: 'sparrow',
  unlockedBirds: ['sparrow'],
  upgrades: {
    flightDistance: 0,
    speed: 0,
  },
  levelStars: {},
};

class GameStateManager {
  private state: GameStateData;

  constructor() {
    this.state = SaveManager.load() ?? { ...DEFAULT_STATE };
  }

  get(): GameStateData {
    return this.state;
  }

  addCoins(amount: number): void {
    this.state.coins += Math.round(amount);
    this.save();
  }

  addFeathers(amount: number): void {
    this.state.feathers += amount;
    this.save();
  }

  spendCoins(amount: number): boolean {
    if (this.state.coins < amount) return false;
    this.state.coins -= amount;
    this.save();
    return true;
  }

  spendFeathers(amount: number): boolean {
    if (this.state.feathers < amount) return false;
    this.state.feathers -= amount;
    this.save();
    return true;
  }

  unlockLevel(level: number): void {
    if (level > this.state.currentLevel) {
      this.state.currentLevel = level;
      this.save();
    }
  }

  setLevelStars(levelId: number, stars: number): void {
    const current = this.state.levelStars[levelId] ?? 0;
    if (stars > current) {
      this.state.levelStars[levelId] = stars;
      this.save();
    }
  }

  selectBird(birdKey: string): void {
    if (this.state.unlockedBirds.includes(birdKey)) {
      this.state.selectedBird = birdKey;
      this.save();
    }
  }

  unlockBird(birdKey: string): void {
    if (!this.state.unlockedBirds.includes(birdKey)) {
      this.state.unlockedBirds.push(birdKey);
      this.save();
    }
  }

  upgradeLevel(upgradeKey: 'flightDistance' | 'speed'): void {
    this.state.upgrades[upgradeKey]++;
    this.save();
  }

  getSpeedMultiplier(): number {
    return 1 + this.state.upgrades.speed * 0.1;
  }

  getDragMultiplier(): number {
    return 1 - this.state.upgrades.flightDistance * 0.08;
  }

  reset(): void {
    this.state = { ...DEFAULT_STATE, unlockedBirds: ['sparrow'], levelStars: {} };
    this.save();
  }

  private save(): void {
    SaveManager.save(this.state);
  }
}

export const GameState = new GameStateManager();
