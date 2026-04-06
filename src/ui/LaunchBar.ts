import Phaser from 'phaser';

export class LaunchBar {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private barBg: Phaser.GameObjects.Graphics;
  private barFill: Phaser.GameObjects.Graphics;
  private angleIndicator: Phaser.GameObjects.Graphics;
  private powerText: Phaser.GameObjects.Text;

  private charging = false;
  private power = 0;
  private chargeSpeed = 80; // percent per second
  private chargeDirection = 1;

  // Angle oscillates between min and max
  private angle = Math.PI / 4; // 45 degrees
  private angleMin = Math.PI / 6; // 30 degrees
  private angleMax = Math.PI / 3; // 60 degrees
  private angleSpeed = 1.5; // radians per second
  private angleDirection = 1;
  private angleLocked = false;

  private onLaunch: ((power: number, angle: number) => void) | null = null;

  private barX: number;
  private barY: number;
  private barWidth = 30;
  private barHeight = 150;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.barX = x;
    this.barY = y;

    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(100);

    // Background bar
    this.barBg = scene.add.graphics().setScrollFactor(0);
    this.barBg.fillStyle(0x333333, 0.8);
    this.barBg.fillRoundedRect(x, y, this.barWidth, this.barHeight, 6);
    this.barBg.lineStyle(2, 0xffffff, 0.5);
    this.barBg.strokeRoundedRect(x, y, this.barWidth, this.barHeight, 6);
    this.container.add(this.barBg);

    // Fill bar (grows from bottom)
    this.barFill = scene.add.graphics().setScrollFactor(0);
    this.container.add(this.barFill);

    // Power text
    this.powerText = scene.add.text(x + this.barWidth / 2, y + this.barHeight + 15, '0%', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0);
    this.container.add(this.powerText);

    // Angle indicator
    this.angleIndicator = scene.add.graphics().setScrollFactor(0);
    this.container.add(this.angleIndicator);

    // Instruction text
    const instructionText = scene.add.text(
      scene.cameras.main.width / 2,
      scene.cameras.main.height - 40,
      'TAP & HOLD to charge, RELEASE to launch!',
      { fontSize: '20px', fontFamily: 'Arial', color: '#ffffff', stroke: '#000000', strokeThickness: 3 }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.container.add(instructionText);
  }

  setOnLaunch(callback: (power: number, angle: number) => void): void {
    this.onLaunch = callback;
  }

  startCharging(): void {
    if (this.angleLocked) return;
    this.charging = true;
    this.power = 0;
    this.chargeDirection = 1;
  }

  release(): void {
    if (!this.charging) return;

    if (!this.angleLocked) {
      // First release locks the angle, start power charging
      this.angleLocked = true;
      this.power = 0;
      return;
    }

    // Second release fires the launch
    this.charging = false;
    if (this.onLaunch) {
      this.onLaunch(this.power, this.angle);
    }
    this.container.setVisible(false);
  }

  update(delta: number): void {
    const dt = delta / 1000;

    if (!this.angleLocked) {
      // Oscillate angle
      this.angle += this.angleSpeed * this.angleDirection * dt;
      if (this.angle >= this.angleMax) {
        this.angle = this.angleMax;
        this.angleDirection = -1;
      } else if (this.angle <= this.angleMin) {
        this.angle = this.angleMin;
        this.angleDirection = 1;
      }
    }

    if (this.charging && this.angleLocked) {
      // Charge power (oscillates 0-100)
      this.power += this.chargeSpeed * this.chargeDirection * dt;
      if (this.power >= 100) {
        this.power = 100;
        this.chargeDirection = -1;
      } else if (this.power <= 0) {
        this.power = 0;
        this.chargeDirection = 1;
      }
    }

    this.drawBar();
    this.drawAngle();
  }

  private drawBar(): void {
    this.barFill.clear();
    const fillHeight = (this.power / 100) * this.barHeight;
    const fillY = this.barY + this.barHeight - fillHeight;

    // Color gradient: green -> yellow -> red
    let color: number;
    if (this.power < 50) {
      color = Phaser.Display.Color.GetColor(
        Math.round((this.power / 50) * 255),
        255,
        0
      );
    } else {
      color = Phaser.Display.Color.GetColor(
        255,
        Math.round((1 - (this.power - 50) / 50) * 255),
        0
      );
    }

    this.barFill.fillStyle(color, 1);
    this.barFill.fillRoundedRect(this.barX + 3, fillY + 3, this.barWidth - 6, fillHeight - 6, 4);

    this.powerText.setText(`${Math.round(this.power)}%`);
  }

  private drawAngle(): void {
    this.angleIndicator.clear();

    const originX = 200;
    const originY = this.scene.cameras.main.height - 100;
    const lineLength = 80;

    const endX = originX + lineLength * Math.cos(this.angle);
    const endY = originY - lineLength * Math.sin(this.angle);

    // Draw angle line
    this.angleIndicator.lineStyle(3, this.angleLocked ? 0x27ae60 : 0xf5a623, 1);
    this.angleIndicator.beginPath();
    this.angleIndicator.moveTo(originX, originY);
    this.angleIndicator.lineTo(endX, endY);
    this.angleIndicator.strokePath();

    // Arrow head
    const arrowSize = 10;
    const arrowAngle1 = this.angle + Math.PI + 0.4;
    const arrowAngle2 = this.angle + Math.PI - 0.4;
    this.angleIndicator.beginPath();
    this.angleIndicator.moveTo(endX, endY);
    this.angleIndicator.lineTo(
      endX + arrowSize * Math.cos(arrowAngle1),
      endY - arrowSize * Math.sin(arrowAngle1)
    );
    this.angleIndicator.moveTo(endX, endY);
    this.angleIndicator.lineTo(
      endX + arrowSize * Math.cos(arrowAngle2),
      endY - arrowSize * Math.sin(arrowAngle2)
    );
    this.angleIndicator.strokePath();

    this.angleIndicator.fillStyle(0xffffff, 1);
  }

  isVisible(): boolean {
    return this.container.visible;
  }
}
