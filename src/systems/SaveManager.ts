import type { GameStateData } from './GameState';

const SAVE_KEY = 'feather-flight-save';

export const SaveManager = {
  save(state: GameStateData): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {
      // localStorage might be full or unavailable
    }
  },

  load(): GameStateData | null {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (!data) return null;
      return JSON.parse(data) as GameStateData;
    } catch {
      return null;
    }
  },

  clear(): void {
    localStorage.removeItem(SAVE_KEY);
  },
};
