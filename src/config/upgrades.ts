export interface UpgradeConfig {
  key: string;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number; // cost = baseCost * costMultiplier^currentLevel
}

export const UPGRADES: Record<string, UpgradeConfig> = {
  flightDistance: {
    key: 'flightDistance',
    name: 'Flight Distance',
    description: 'Reduces air drag by 8% per level',
    maxLevel: 10,
    baseCost: 50,
    costMultiplier: 2,
  },
  speed: {
    key: 'speed',
    name: 'Launch Speed',
    description: 'Increases launch power by 10% per level',
    maxLevel: 10,
    baseCost: 50,
    costMultiplier: 2,
  },
};

export function getUpgradeCost(upgrade: UpgradeConfig, currentLevel: number): number {
  return Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
}
