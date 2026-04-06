import Phaser from 'phaser';
import { GameState } from '../systems/GameState';
import { LEVELS } from '../config/levels';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const state = GameState.get();

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Title
    this.add.text(width / 2, 100, 'Feather Flight', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#2c3e50',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 160, 'The Epic Launcher Adventure', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ecf0f1',
    }).setOrigin(0.5);

    // Currency display
    this.add.text(width - 20, 20, `Coins: ${state.coins}`, {
      fontSize: '20px', fontFamily: 'Arial', color: '#f1c40f',
    }).setOrigin(1, 0);

    this.add.text(width - 20, 48, `Feathers: ${state.feathers}`, {
      fontSize: '20px', fontFamily: 'Arial', color: '#e67e22',
    }).setOrigin(1, 0);

    // Current level info
    const currentLevel = Math.min(state.currentLevel, LEVELS.length);
    const levelConfig = LEVELS[currentLevel - 1];

    this.add.text(width / 2, 220, `Level ${currentLevel}: ${levelConfig.name}`, {
      fontSize: '22px', fontFamily: 'Arial', color: '#95a5a6',
    }).setOrigin(0.5);

    // Progress bar (levels completed)
    const barWidth = 400;
    const barX = width / 2 - barWidth / 2;
    const barY = 255;
    this.add.graphics()
      .fillStyle(0x333333, 1)
      .fillRoundedRect(barX, barY, barWidth, 16, 8);
    this.add.graphics()
      .fillStyle(0x27ae60, 1)
      .fillRoundedRect(barX, barY, barWidth * ((currentLevel - 1) / LEVELS.length), 16, 8);
    this.add.text(width / 2, barY + 25, `${currentLevel - 1} / ${LEVELS.length} completed`, {
      fontSize: '14px', fontFamily: 'Arial', color: '#7f8c8d',
    }).setOrigin(0.5);

    // Play button
    this.createButton(width / 2, 350, 'PLAY', 0x27ae60, () => {
      this.scene.start('GameScene', { level: currentLevel });
    });

    // Level select buttons (show last 5 unlocked)
    const startLevel = Math.max(1, currentLevel - 4);
    const endLevel = currentLevel;
    const levelBtnWidth = 55;
    const totalWidth = (endLevel - startLevel + 1) * (levelBtnWidth + 10) - 10;
    let lx = width / 2 - totalWidth / 2 + levelBtnWidth / 2;

    this.add.text(width / 2, 405, 'Select Level:', {
      fontSize: '16px', fontFamily: 'Arial', color: '#95a5a6',
    }).setOrigin(0.5);

    for (let i = startLevel; i <= endLevel; i++) {
      const stars = state.levelStars[i] ?? 0;
      const lvl = i;

      const bg = this.add.graphics();
      bg.fillStyle(i === currentLevel ? 0x3498db : 0x555555, 1);
      bg.fillRoundedRect(lx - levelBtnWidth / 2, 425, levelBtnWidth, 50, 8);

      this.add.text(lx, 440, `${i}`, {
        fontSize: '18px', fontFamily: 'Arial', color: '#ffffff',
      }).setOrigin(0.5);

      // Star indicators
      const starText = stars > 0 ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '   ';
      this.add.text(lx, 462, starText, {
        fontSize: '10px', fontFamily: 'Arial', color: '#f5a623',
      }).setOrigin(0.5);

      this.add.rectangle(lx, 450, levelBtnWidth, 50)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.scene.start('GameScene', { level: lvl });
        });

      lx += levelBtnWidth + 10;
    }

    // Shop button
    this.createButton(width / 2, 530, 'SHOP', 0xe67e22, () => {
      this.scene.start('ShopScene');
    });
  }

  private createButton(x: number, y: number, text: string, color: number, onClick: () => void): void {
    const btnWidth = 200;
    const btnHeight = 55;

    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 12);

    this.add.text(x, y, text, {
      fontSize: '30px', fontFamily: 'Arial', color: '#ffffff',
    }).setOrigin(0.5);

    const hitArea = this.add.rectangle(x, y, btnWidth, btnHeight)
      .setInteractive({ useHandCursor: true });

    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(Phaser.Display.Color.ValueToColor(color).lighten(15).color, 1);
      bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 12);
    });

    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 12);
    });

    hitArea.on('pointerdown', onClick);
  }
}
