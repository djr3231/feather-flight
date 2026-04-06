import Phaser from 'phaser';

export interface BirdStats {
  baseSpeed: number;
  baseDrag: number;
  bounce: number;
}

const DEFAULT_STATS: BirdStats = {
  baseSpeed: 600,
  baseDrag: 50,
  bounce: 0.3,
};

export class Bird extends Phaser.GameObjects.Container {
  declare body: Phaser.Physics.Arcade.Body;
  private launched = false;
  private stats: BirdStats;

  constructor(scene: Phaser.Scene, x: number, y: number, stats?: Partial<BirdStats>) {
    super(scene, x, y);

    this.stats = { ...DEFAULT_STATS, ...stats };

    // Draw the bird using graphics (placeholder)
    // Body
    const body = scene.add.circle(0, 0, 18, 0x8B4513);
    this.add(body);

    // Wing
    const wing = scene.add.triangle(-5, -10, 0, 5, -18, -5, -5, -15, 0xA0522D);
    this.add(wing);

    // Eye
    const eye = scene.add.circle(8, -5, 4, 0xFFFFFF);
    this.add(eye);
    const pupil = scene.add.circle(10, -5, 2, 0x000000);
    this.add(pupil);

    // Beak
    const beak = scene.add.triangle(20, 2, 0, -4, 12, 0, 0, 4, 0xFFA000);
    this.add(beak);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics setup
    this.body.setSize(36, 36);
    this.body.setOffset(-18, -18);
    this.body.setAllowGravity(false); // Disabled until launch
    this.body.setBounce(this.stats.bounce, this.stats.bounce);
  }

  launch(power: number, angle: number): void {
    if (this.launched) return;
    this.launched = true;

    const speed = (power / 100) * this.stats.baseSpeed;
    const vx = speed * Math.cos(angle);
    const vy = -speed * Math.sin(angle);

    this.body.setAllowGravity(true);
    this.body.setVelocity(vx, vy);
    this.body.setDamping(true);
    this.body.setDrag(1 - this.stats.baseDrag / 1000, 0.99);
  }

  isLaunched(): boolean {
    return this.launched;
  }

  isStopped(): boolean {
    if (!this.launched) return false;
    return Math.abs(this.body.velocity.x) < 5 && this.body.blocked.down;
  }

  getDistance(startX: number): number {
    return Math.max(0, Math.round((this.x - startX) / 5));
  }

  getAltitude(groundY: number): number {
    return Math.max(0, Math.round((groundY - this.y) / 5));
  }
}
