import Phaser from 'phaser';
import { Bird } from '../objects/Bird';
import { LaunchBar } from '../ui/LaunchBar';
import { GameState } from '../systems/GameState';
import { LEVELS, type LevelConfig, type ObstacleConfig } from '../config/levels';
import { BIRDS } from '../config/birds';

type GamePhase = 'aiming' | 'flying' | 'ended';

export class GameScene extends Phaser.Scene {
  private readonly GROUND_Y = 620;
  private readonly START_X = 200;

  private bird!: Bird;
  private launchBar!: LaunchBar;
  private ground!: Phaser.GameObjects.Rectangle;
  private phase: GamePhase = 'aiming';
  private levelConfig!: LevelConfig;
  private worldWidth = 50000;

  // HUD
  private distanceText!: Phaser.GameObjects.Text;
  private altitudeText!: Phaser.GameObjects.Text;
  // HUD target display is set once in create()

  // Obstacles
  private obstacleZones: { zone: Phaser.GameObjects.Rectangle; config: ObstacleConfig }[] = [];
  private planeSprites: Phaser.GameObjects.Rectangle[] = [];

  // Rewards
  // coins are calculated from distance at flight end
  private featherCollected = false;
  private featherSprite: Phaser.GameObjects.Container | null = null;

  // Finish line
  private finishLineX = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { level: number }): void {
    const levelId = data.level ?? 1;
    this.levelConfig = LEVELS[Math.min(levelId, LEVELS.length) - 1];
    this.worldWidth = this.levelConfig.targetDistance * 7; // extra space beyond target
    this.finishLineX = this.START_X + this.levelConfig.targetDistance * 5;
  }

  create(): void {
    this.phase = 'aiming';
    this.featherCollected = false;
    this.obstacleZones = [];
    this.planeSprites = [];
    this.featherSprite = null;

    // World bounds
    this.physics.world.setBounds(0, 0, this.worldWidth, 720);

    // Background
    this.drawBackground();

    // Ground
    this.ground = this.add.rectangle(
      this.worldWidth / 2, this.GROUND_Y + 50,
      this.worldWidth, 100,
      0x4CAF50
    );
    this.physics.add.existing(this.ground, true);

    // Grass line
    this.add.rectangle(this.worldWidth / 2, this.GROUND_Y + 2, this.worldWidth, 4, 0x388E3C);

    // Finish line
    this.drawFinishLine();

    // Create bird based on selected bird config
    const selectedBirdConfig = BIRDS.find(b => b.key === GameState.get().selectedBird) ?? BIRDS[0];
    const speedMult = GameState.getSpeedMultiplier();
    const dragMult = GameState.getDragMultiplier();

    this.bird = new Bird(this, this.START_X, this.GROUND_Y - 20, {
      baseSpeed: selectedBirdConfig.baseSpeed * speedMult,
      baseDrag: selectedBirdConfig.baseDrag * dragMult,
      bounce: selectedBirdConfig.bounce,
    });
    this.bird.body.setCollideWorldBounds(true);

    // Bird-ground collision
    this.physics.add.collider(this.bird, this.ground);

    // Spawn obstacles
    this.spawnObstacles();

    // Spawn feather
    if (this.levelConfig.hasFeather && this.levelConfig.featherDistance) {
      this.spawnFeather();
    }

    // Launch bar
    this.launchBar = new LaunchBar(this, 50, 400);
    this.launchBar.setOnLaunch((power, angle) => {
      this.bird.launch(power, angle);
      this.phase = 'flying';
      this.cameras.main.startFollow(this.bird, false, 0.1, 0.05);
      this.cameras.main.setFollowOffset(-200, 100);
    });

    // Input
    this.input.on('pointerdown', () => {
      if (this.phase === 'aiming') this.launchBar.startCharging();
    });
    this.input.on('pointerup', () => {
      if (this.phase === 'aiming') this.launchBar.release();
    });

    // HUD
    this.distanceText = this.add.text(20, 20, 'Distance: 0m', {
      fontSize: '22px', fontFamily: 'Arial', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3,
    }).setScrollFactor(0).setDepth(100);

    this.altitudeText = this.add.text(20, 50, 'Altitude: 0m', {
      fontSize: '22px', fontFamily: 'Arial', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3,
    }).setScrollFactor(0).setDepth(100);

    this.add.text(20, 80, `Target: ${this.levelConfig.targetDistance}m`, {
      fontSize: '18px', fontFamily: 'Arial', color: '#f5a623',
      stroke: '#000000', strokeThickness: 2,
    }).setScrollFactor(0).setDepth(100);

    // Level title
    this.add.text(this.cameras.main.width / 2, 20,
      `Level ${this.levelConfig.id} - ${this.levelConfig.name}`, {
      fontSize: '24px', fontFamily: 'Arial', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);
  }

  update(_time: number, delta: number): void {
    if (this.phase === 'aiming') {
      this.launchBar.update(delta);
    }

    if (this.phase === 'flying') {
      const distance = this.bird.getDistance(this.START_X);
      const altitude = this.bird.getAltitude(this.GROUND_Y);
      this.distanceText.setText(`Distance: ${distance}m`);
      this.altitudeText.setText(`Altitude: ${altitude}m`);

      // Rotate bird
      if (this.bird.body.velocity.x > 0) {
        this.bird.setRotation(Math.atan2(this.bird.body.velocity.y, this.bird.body.velocity.x));
      }

      // Check obstacle overlaps
      this.checkObstacles();

      // Check feather collection
      this.checkFeather();

      // Check if bird stopped
      if (this.bird.isStopped()) {
        this.phase = 'ended';
        this.onFlightEnded();
      }
    }
  }

  private spawnObstacles(): void {
    for (const obs of this.levelConfig.obstacles) {
      const w = obs.width ?? 100;
      const h = obs.height ?? 100;

      if (obs.type === 'plane') {
        // Plane: solid rectangle moving left
        const plane = this.add.rectangle(obs.x, obs.y, 80, 20, 0xBDBDBD);
        this.add.rectangle(obs.x + 30, obs.y - 8, 20, 8, 0x9E9E9E); // tail
        this.add.triangle(obs.x - 40, obs.y, 0, -5, -15, 5, 0, 5, 0xBDBDBD); // nose
        this.planeSprites.push(plane);

        // Physics zone for plane
        const zone = this.add.rectangle(obs.x, obs.y, 90, 25, 0xBDBDBD, 0);
        this.physics.add.existing(zone, true);
        this.obstacleZones.push({ zone, config: obs });
      } else {
        // Air current / Hurricane: semi-transparent zone
        const color = obs.type === 'air_current' ? 0x42A5F5 : 0x7E57C2;
        const alpha = 0.2;
        const zone = this.add.rectangle(obs.x, obs.y, w, h, color, alpha);

        // Visual indicator lines
        const gfx = this.add.graphics();
        gfx.lineStyle(1, color, 0.3);
        for (let i = 0; i < 5; i++) {
          const ly = obs.y - h / 2 + (h / 5) * i + 20;
          gfx.beginPath();
          gfx.moveTo(obs.x - w / 2 + 10, ly);
          for (let lx = obs.x - w / 2 + 10; lx < obs.x + w / 2 - 10; lx += 20) {
            gfx.lineTo(lx + 10, ly + (obs.type === 'hurricane' ? Math.sin(lx * 0.05) * 8 : -5));
          }
          gfx.strokePath();
        }

        // Label
        const label = obs.type === 'air_current' ? 'WIND' : 'STORM';
        this.add.text(obs.x, obs.y - h / 2 - 10, label, {
          fontSize: '12px', fontFamily: 'Arial', color: obs.type === 'air_current' ? '#42A5F5' : '#7E57C2',
        }).setOrigin(0.5);

        this.obstacleZones.push({ zone, config: obs });
      }
    }
  }

  private checkObstacles(): void {
    const birdBounds = this.bird.getBounds();

    for (const { zone, config } of this.obstacleZones) {
      const zoneBounds = zone.getBounds();

      if (Phaser.Geom.Rectangle.Overlaps(birdBounds, zoneBounds)) {
        switch (config.type) {
          case 'air_current':
            this.bird.body.velocity.x -= 3;
            this.bird.body.velocity.y += 1.5;
            break;
          case 'plane':
            this.bird.body.velocity.x *= 0.1;
            this.bird.body.velocity.y *= 0.5;
            break;
          case 'hurricane':
            this.bird.body.velocity.x += Phaser.Math.Between(-5, 5);
            this.bird.body.velocity.y += Phaser.Math.Between(-5, 5);
            break;
        }
      }
    }
  }

  private spawnFeather(): void {
    const fx = this.START_X + (this.levelConfig.featherDistance ?? 0) * 5;
    const fy = this.GROUND_Y - (this.levelConfig.featherAltitude ?? 50) * 5;

    this.featherSprite = this.add.container(fx, fy);

    // Feather shape (simple elongated shape)
    const featherGfx = this.add.graphics();
    featherGfx.fillStyle(0xF5A623, 1);
    featherGfx.fillEllipse(0, 0, 12, 30);
    featherGfx.lineStyle(1, 0xE67E22, 1);
    featherGfx.lineBetween(0, -15, 0, 15);
    this.featherSprite.add(featherGfx);

    // Glow effect
    const glow = this.add.circle(0, 0, 20, 0xF5A623, 0.2);
    this.featherSprite.add(glow);

    // Floating animation
    this.tweens.add({
      targets: this.featherSprite,
      y: fy - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private checkFeather(): void {
    if (this.featherCollected || !this.featherSprite) return;

    const birdBounds = this.bird.getBounds();
    const featherBounds = new Phaser.Geom.Rectangle(
      this.featherSprite.x - 15, this.featherSprite.y - 20, 30, 40
    );

    if (Phaser.Geom.Rectangle.Overlaps(birdBounds, featherBounds)) {
      this.featherCollected = true;
      this.featherSprite.destroy();
      this.featherSprite = null;

      // Flash effect
      this.cameras.main.flash(200, 245, 166, 35);
    }
  }

  private drawFinishLine(): void {
    const gfx = this.add.graphics();
    const x = this.finishLineX;
    const squareSize = 20;
    const rows = 20;
    const cols = 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const color = (r + c) % 2 === 0 ? 0x000000 : 0xFFFFFF;
        gfx.fillStyle(color, 0.8);
        gfx.fillRect(x + c * squareSize, this.GROUND_Y - rows * squareSize + r * squareSize, squareSize, squareSize);
      }
    }

    // Flag pole
    gfx.fillStyle(0x888888, 1);
    gfx.fillRect(x + cols * squareSize, 100, 4, this.GROUND_Y - 100);

    // Flag
    gfx.fillStyle(0xE74C3C, 1);
    gfx.fillTriangle(x + cols * squareSize + 4, 100, x + cols * squareSize + 60, 130, x + cols * squareSize + 4, 160);

    // "FINISH" text
    this.add.text(x + 20, this.GROUND_Y - rows * squareSize - 25, 'FINISH', {
      fontSize: '16px', fontFamily: 'Arial', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 1);
  }

  private onFlightEnded(): void {
    const distance = this.bird.getDistance(this.START_X);
    this.cameras.main.stopFollow();

    // Brief delay then show results
    this.time.delayedCall(500, () => {
      this.scene.start('LevelCompleteScene', {
        levelId: this.levelConfig.id,
        distance,
        coinsEarned: Math.round(distance * this.levelConfig.coinsPerMeter),
        featherCollected: this.featherCollected,
      });
    });
  }

  private drawBackground(): void {
    const tileWidth = 1280;
    const numTiles = Math.ceil(this.worldWidth / tileWidth);
    const tier = this.levelConfig.backgroundTier;

    const skyColors: Record<string, [number, number]> = {
      forest: [0x87CEEB, 0xB8E6F0],
      mountain: [0x6CA6CD, 0xA8D8EA],
      desert: [0xFFA726, 0xFFCC80],
      city: [0x546E7A, 0x90A4AE],
    };

    const [skyTop, skyBottom] = skyColors[tier] ?? skyColors.forest;
    const groundColor: Record<string, number> = {
      forest: 0x4CAF50,
      mountain: 0x78909C,
      desert: 0xD2B48C,
      city: 0x616161,
    };

    // Update ground color
    this.ground?.setFillStyle(groundColor[tier] ?? 0x4CAF50);

    for (let i = 0; i < numTiles; i++) {
      const offsetX = i * tileWidth;

      // Sky
      const sky = this.add.graphics();
      sky.fillGradientStyle(skyTop, skyTop, skyBottom, skyBottom, 1);
      sky.fillRect(offsetX, 0, tileWidth, this.GROUND_Y);

      // Background elements based on tier
      this.drawTierElements(tier, offsetX, i);
    }
  }

  private drawTierElements(tier: string, offsetX: number, tileIndex: number): void {
    switch (tier) {
      case 'forest':
        // Hills and trees
        for (let j = 0; j < 3; j++) {
          const hx = offsetX + 200 + j * 400 + (tileIndex % 3) * 100;
          this.add.circle(hx, this.GROUND_Y, 80 + j * 20, 0x66BB6A, 0.4);
        }
        for (let t = 0; t < 4; t++) {
          const tx = offsetX + 100 + t * 300 + (tileIndex % 2) * 50;
          this.add.rectangle(tx, this.GROUND_Y - 20, 8, 40, 0x795548);
          this.add.circle(tx, this.GROUND_Y - 50, 25, 0x2E7D32, 0.7);
        }
        break;

      case 'mountain':
        // Snow-capped mountains
        for (let m = 0; m < 2; m++) {
          const mx = offsetX + 300 + m * 600 + (tileIndex % 2) * 200;
          const my = this.GROUND_Y;
          this.add.triangle(mx, my, -120, 0, 0, -200 - m * 50, 120, 0, 0x546E7A, 0.6);
          this.add.triangle(mx, my - 150 - m * 50, -30, 50, 0, 0, 30, 50, 0xFFFFFF, 0.8);
        }
        break;

      case 'desert':
        // Sand dunes and cacti
        for (let d = 0; d < 3; d++) {
          const dx = offsetX + 200 + d * 400;
          this.add.ellipse(dx, this.GROUND_Y + 10, 300, 60, 0xC19A6B, 0.5);
        }
        if (tileIndex % 3 === 0) {
          const cx = offsetX + 500;
          this.add.rectangle(cx, this.GROUND_Y - 30, 10, 60, 0x2E7D32);
          this.add.rectangle(cx - 15, this.GROUND_Y - 40, 10, 30, 0x2E7D32).setAngle(45);
          this.add.rectangle(cx + 15, this.GROUND_Y - 35, 10, 25, 0x2E7D32).setAngle(-45);
        }
        break;

      case 'city':
        // Buildings
        for (let b = 0; b < 5; b++) {
          const bx = offsetX + 100 + b * 250 + (tileIndex % 2) * 80;
          const bh = 100 + Phaser.Math.Between(50, 200);
          const bw = 40 + Phaser.Math.Between(20, 60);
          this.add.rectangle(bx, this.GROUND_Y - bh / 2, bw, bh, 0x37474F, 0.7);
          // Windows
          for (let wy = 0; wy < bh - 20; wy += 25) {
            for (let wx = 0; wx < bw - 15; wx += 15) {
              this.add.rectangle(
                bx - bw / 2 + 10 + wx,
                this.GROUND_Y - bh + 15 + wy,
                8, 12, 0xFFF176, Math.random() > 0.3 ? 0.6 : 0.1
              );
            }
          }
        }
        break;
    }
  }
}
