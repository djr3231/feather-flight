import Phaser from 'phaser';
import { GameState } from '../systems/GameState';
import { LEVELS } from '../config/levels';

interface LevelCompleteData {
  levelId: number;
  distance: number;
  coinsEarned: number;
  featherCollected: boolean;
}

export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelCompleteScene' });
  }

  create(data: LevelCompleteData): void {
    const { width, height } = this.cameras.main;
    const level = LEVELS[data.levelId - 1];
    const passed = data.distance >= level.targetDistance;

    // Calculate stars
    let stars = 0;
    const percent = (data.distance / level.targetDistance) * 100;
    for (const threshold of level.starThresholds) {
      if (percent >= threshold) stars++;
    }

    // Award rewards
    const coins = Math.round(data.distance * level.coinsPerMeter);
    GameState.addCoins(coins);

    if (data.featherCollected) {
      GameState.addFeathers(1);
    }

    if (passed) {
      GameState.setLevelStars(data.levelId, stars);
      GameState.unlockLevel(data.levelId + 1);
    }

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Title
    const titleColor = passed ? '#f5a623' : '#e74c3c';
    const titleText = passed ? 'Level Complete!' : 'Flight Over!';
    this.add.text(width / 2, 80, titleText, {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Level name
    this.add.text(width / 2, 130, level.name, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#95a5a6',
    }).setOrigin(0.5);

    // Stars
    const starY = 180;
    for (let i = 0; i < 3; i++) {
      const starColor = i < stars ? 0xf5a623 : 0x555555;
      const starX = width / 2 - 60 + i * 60;
      this.add.star(starX, starY, 5, 12, 24, starColor);
    }

    // Stats
    const statsY = 240;
    this.add.text(width / 2, statsY, `Distance: ${data.distance}m / ${level.targetDistance}m`, {
      fontSize: '24px', fontFamily: 'Arial', color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(width / 2, statsY + 40, `Coins earned: ${coins}`, {
      fontSize: '22px', fontFamily: 'Arial', color: '#f1c40f',
    }).setOrigin(0.5);

    if (data.featherCollected) {
      this.add.text(width / 2, statsY + 75, 'Feather collected!', {
        fontSize: '22px', fontFamily: 'Arial', color: '#e67e22',
      }).setOrigin(0.5);
    }

    // Total coins/feathers
    const state = GameState.get();
    this.add.text(width / 2, statsY + 115, `Total: ${state.coins} coins | ${state.feathers} feathers`, {
      fontSize: '18px', fontFamily: 'Arial', color: '#95a5a6',
    }).setOrigin(0.5);

    // Buttons
    const btnY = height - 180;

    // Retry button
    this.createButton(width / 2, btnY, 'RETRY', 0x3498db, () => {
      this.scene.start('GameScene', { level: data.levelId });
    });

    if (passed && data.levelId < LEVELS.length) {
      // Next level button
      this.createButton(width / 2, btnY + 65, 'NEXT LEVEL', 0x27ae60, () => {
        this.scene.start('GameScene', { level: data.levelId + 1 });
      });
    }

    // Menu button
    this.createButton(width / 2, btnY + 130, 'MENU', 0x7f8c8d, () => {
      this.scene.start('MenuScene');
    });
  }

  private createButton(x: number, y: number, text: string, color: number, onClick: () => void): void {
    const btnWidth = 200;
    const btnHeight = 50;

    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 10);

    this.add.text(x, y, text, {
      fontSize: '22px', fontFamily: 'Arial', color: '#ffffff',
    }).setOrigin(0.5);

    const hitArea = this.add.rectangle(x, y, btnWidth, btnHeight)
      .setInteractive({ useHandCursor: true });

    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(Phaser.Display.Color.ValueToColor(color).lighten(20).color, 1);
      bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 10);
    });

    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 10);
    });

    hitArea.on('pointerdown', onClick);
  }
}
