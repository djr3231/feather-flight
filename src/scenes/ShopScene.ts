import Phaser from 'phaser';
import { GameState } from '../systems/GameState';
import { BIRDS } from '../config/birds';
import { UPGRADES, getUpgradeCost } from '../config/upgrades';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const state = GameState.get();

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Title
    this.add.text(width / 2, 40, 'SHOP', {
      fontSize: '42px', fontFamily: 'Arial', color: '#f5a623',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    // Currency display
    this.add.text(width / 2, 85, `Coins: ${state.coins}  |  Feathers: ${state.feathers}`, {
      fontSize: '20px', fontFamily: 'Arial', color: '#f1c40f',
    }).setOrigin(0.5);

    // === UPGRADES SECTION ===
    this.add.text(120, 130, 'Upgrades', {
      fontSize: '28px', fontFamily: 'Arial', color: '#3498db',
    });

    let y = 175;
    for (const key of Object.keys(UPGRADES)) {
      const upgrade = UPGRADES[key];
      const currentLevel = state.upgrades[key as keyof typeof state.upgrades];
      const maxed = currentLevel >= upgrade.maxLevel;
      const cost = maxed ? 0 : getUpgradeCost(upgrade, currentLevel);

      // Upgrade row
      this.add.text(60, y, upgrade.name, {
        fontSize: '20px', fontFamily: 'Arial', color: '#ffffff',
      });

      this.add.text(60, y + 25, upgrade.description, {
        fontSize: '14px', fontFamily: 'Arial', color: '#95a5a6',
      });

      // Level bar
      for (let i = 0; i < upgrade.maxLevel; i++) {
        const barColor = i < currentLevel ? 0x27ae60 : 0x555555;
        this.add.rectangle(350 + i * 22, y + 12, 18, 18, barColor).setOrigin(0);
      }

      if (!maxed) {
        const canAfford = state.coins >= cost;
        const btnColor = canAfford ? 0x27ae60 : 0x7f8c8d;
        this.createSmallButton(width - 120, y + 15, `${cost} coins`, btnColor, () => {
          if (GameState.spendCoins(cost)) {
            GameState.upgradeLevel(key as 'flightDistance' | 'speed');
            this.scene.restart();
          }
        });
      } else {
        this.add.text(width - 120, y + 15, 'MAX', {
          fontSize: '18px', fontFamily: 'Arial', color: '#27ae60',
        }).setOrigin(0.5);
      }

      y += 70;
    }

    // === BIRDS SECTION ===
    this.add.text(120, y + 10, 'Birds', {
      fontSize: '28px', fontFamily: 'Arial', color: '#e67e22',
    });
    y += 55;

    for (const bird of BIRDS) {
      const unlocked = state.unlockedBirds.includes(bird.key);
      const selected = state.selectedBird === bird.key;

      // Bird circle preview
      this.add.circle(80, y + 15, 18, bird.color);

      this.add.text(120, y, bird.name, {
        fontSize: '20px', fontFamily: 'Arial',
        color: unlocked ? '#ffffff' : '#7f8c8d',
      });

      this.add.text(120, y + 25, `Speed: ${bird.baseSpeed}  Drag: ${bird.baseDrag}`, {
        fontSize: '14px', fontFamily: 'Arial', color: '#95a5a6',
      });

      if (!unlocked) {
        const canAfford = state.feathers >= bird.unlockCost;
        const btnColor = canAfford ? 0xe67e22 : 0x7f8c8d;
        this.createSmallButton(width - 120, y + 15, `${bird.unlockCost} feathers`, btnColor, () => {
          if (GameState.spendFeathers(bird.unlockCost)) {
            GameState.unlockBird(bird.key);
            GameState.selectBird(bird.key);
            this.scene.restart();
          }
        });
      } else if (selected) {
        this.add.text(width - 120, y + 15, 'SELECTED', {
          fontSize: '16px', fontFamily: 'Arial', color: '#27ae60',
        }).setOrigin(0.5);
      } else {
        this.createSmallButton(width - 120, y + 15, 'SELECT', 0x3498db, () => {
          GameState.selectBird(bird.key);
          this.scene.restart();
        });
      }

      y += 65;
    }

    // Back button
    this.createButton(width / 2, height - 50, 'BACK', 0x7f8c8d, () => {
      this.scene.start('MenuScene');
    });
  }

  private createSmallButton(x: number, y: number, text: string, color: number, onClick: () => void): void {
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(x - 60, y - 15, 120, 30, 6);

    this.add.text(x, y, text, {
      fontSize: '14px', fontFamily: 'Arial', color: '#ffffff',
    }).setOrigin(0.5);

    this.add.rectangle(x, y, 120, 30).setInteractive({ useHandCursor: true })
      .on('pointerdown', onClick);
  }

  private createButton(x: number, y: number, text: string, color: number, onClick: () => void): void {
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(x - 80, y - 22, 160, 44, 10);

    this.add.text(x, y, text, {
      fontSize: '22px', fontFamily: 'Arial', color: '#ffffff',
    }).setOrigin(0.5);

    this.add.rectangle(x, y, 160, 44).setInteractive({ useHandCursor: true })
      .on('pointerdown', onClick);
  }
}
