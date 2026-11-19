import * as Phaser from 'phaser';
import {
  CHOP_SEC,
  DIA_MM,
  GAME_W,
  MAX_SLOPE,
  MIN_SWIPE_PX,
  PX,
  ROLL_BOT,
  ROLL_CY,
  ROLL_H,
  ROLL_MM,
  ROLL_TOP,
  SPEED_MM,
  VIEW_MM,
} from '../config';
import { drawPiece, makeSesame, type Sesame } from '../draw/kimbap';
import { Roll, swipeToLine } from '../logic/roll';
import { text } from '../ui';
import * as sfx from '../audio/sfx';

type State = 'count' | 'play' | 'ending';

interface Drag {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const KNIFE_IDLE_Y = ROLL_TOP - 30;

export class GameScene extends Phaser.Scene {
  private roll!: Roll;
  private sesame: Sesame[] = makeSesame(ROLL_MM);
  private state: State = 'count';
  private offMm = 0; // 화면 왼쪽 기준 김밥 왼쪽 끝 위치
  private countT = 0;

  private rollG!: Phaser.GameObjects.Graphics;
  private shadowG!: Phaser.GameObjects.Graphics;
  private guideG!: Phaser.GameObjects.Graphics;
  private knife!: Phaser.GameObjects.Image;
  private knifeShadow!: Phaser.GameObjects.Image;
  private rice!: Phaser.GameObjects.Particles.ParticleEmitter;
  private countText!: Phaser.GameObjects.Text;
  private countdownText!: Phaser.GameObjects.Text;

  private drag: Drag | null = null;
  private knifeX = GAME_W / 2;
  private knifeK = 0;
  private chopT = 0;
  private chopXc = 0;
  private chopK = 0;

  constructor() {
    super('Game');
  }

  create(): void {
    this.roll = new Roll(ROLL_MM);
    this.state = 'count';
    this.countT = 3;
    this.offMm = VIEW_MM * 0.62;
    this.drag = null;
    this.chopT = 0;
    this.knifeX = GAME_W / 2;
    this.knifeK = 0;

    this.add.image(0, 0, 'wood').setOrigin(0);
    this.shadowG = this.add.graphics();
    this.shadowG.fillStyle(0x3c1e0a, 0.28);
    this.shadowG.fillEllipse((ROLL_MM * PX) / 2, ROLL_BOT + 8, ROLL_MM * PX + 12, 16);
    this.rollG = this.add.graphics();
    this.redrawRoll();

    this.rice = this.add.particles(0, 0, 'rice', {
      speed: { min: 120, max: 340 },
      angle: { min: 200, max: 340 },
      gravityY: 1000,
      lifespan: 700,
      rotate: { min: 0, max: 360 },
      alpha: { start: 1, end: 0 },
      emitting: false,
    });

    this.guideG = this.add.graphics();
    this.knifeShadow = this.add.image(0, 0, 'knife').setOrigin(0.5, 1).setTint(0x000000).setAlpha(0.25);
    this.knife = this.add.image(0, 0, 'knife').setOrigin(0.5, 1);

    this.countText = text(this, GAME_W / 2, ROLL_BOT + 200, '1알', 96).setVisible(false);
    this.countdownText = text(this, GAME_W / 2, ROLL_BOT + 220, '3', 160, '#ffd66b', '900');

    this.input.on('pointerdown', this.onDown, this);
    this.input.on('pointermove', this.onMove, this);
    this.input.on('pointerup', this.onUp, this);
    this.input.on('pointerupoutside', this.onUp, this);
  }

  // ---------- 입력 ----------
  private onDown(p: Phaser.Input.Pointer): void {
    sfx.unlock();
    this.drag = { x0: p.x, y0: p.y, x1: p.x, y1: p.y };
    this.knifeX = p.x;
    this.knifeK = 0;
  }

  private onMove(p: Phaser.Input.Pointer): void {
    if (!this.drag) {
      this.knifeX = p.x; // 데스크톱 마우스 호버
      this.knifeK = 0;
      return;
    }
    this.drag.x1 = p.x;
    this.drag.y1 = p.y;
    const line = this.currentLine();
    this.knifeX = line ? line.xc : p.x;
    this.knifeK = line ? line.k : 0;
  }

  private onUp(): void {
    if (this.drag && this.state === 'play') this.cut();
    this.drag = null;
    this.knifeK = 0;
  }

  private currentLine() {
    const d = this.drag;
    if (!d) return null;
    return swipeToLine(d.x0, d.y0, d.x1, d.y1, ROLL_CY, MIN_SWIPE_PX, MAX_SLOPE);
  }

  // ---------- 썰기 ----------
  private cut(): void {
    const line = this.currentLine();
    if (!line) return;
    this.chopT = CHOP_SEC;
    this.chopXc = line.xc;
    this.chopK = line.k;

    const hh = ROLL_H / 2;
    const t = (line.xc - line.k * hh) / PX - this.offMm;
    const b = (line.xc + line.k * hh) / PX - this.offMm;
    const res = this.roll.tryCut(t, b);
    const y = ROLL_TOP - 70;

    switch (res.kind) {
      case 'outside':
        return;
      case 'miss':
        this.float(line.xc, y, '빗나감', '#ffe1d6');
        return;
      case 'overlap':
        this.float(line.xc, y, '겹쳤어요!', '#ffb3a1');
        return;
      case 'ok': {
        this.redrawRoll();
        sfx.chop();
        sfx.vibrate(12);
        this.rice.explode(12, line.xc, ROLL_CY - hh * 0.3);
        const mm = res.thicknessMm;
        if (mm === null) {
          this.float(line.xc, y, '꼬다리', '#ffffff');
        } else {
          const color = mm < 4 ? '#ffd66b' : mm < 8 ? '#ffffff' : '#ffe1d6';
          this.float(line.xc, y, `${mm.toFixed(1)}mm`, color);
          if (mm < 3) {
            this.float(line.xc, y - 52, '얇다!', '#ffd66b');
            sfx.ding();
          }
        }
        this.countText.setText(`${this.roll.count}알`);
        this.tweens.add({ targets: this.countText, scale: { from: 1.18, to: 1 }, duration: 160 });
      }
    }
  }

  private float(x: number, y: number, value: string, color: string): void {
    const t = text(this, x, y, value, 36, color).setDepth(10);
    this.tweens.add({ targets: t, y: y - 80, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }

  private redrawRoll(): void {
    this.rollG.clear();
    for (const p of this.roll.pieces()) drawPiece(this.rollG, p, 0, ROLL_TOP, PX, DIA_MM, { sesame: this.sesame });
  }

  // ---------- 루프 ----------
  update(_time: number, deltaMs: number): void {
    const dt = Math.min(0.05, deltaMs / 1000);

    if (this.state === 'count') {
      this.countT -= dt;
      this.countdownText.setText(String(Math.ceil(this.countT)));
      if (this.countT <= 0) {
        this.state = 'play';
        this.countdownText.setVisible(false);
        this.countText.setVisible(true);
      }
    } else if (this.state === 'play') {
      this.offMm -= SPEED_MM * dt;
      if (this.offMm + ROLL_MM < VIEW_MM * 0.04) {
        this.state = 'ending';
        this.drag = null;
        this.time.delayedCall(900, () => this.scene.start('Result', { pieces: this.roll.pieces() }));
      }
    }

    const x = this.offMm * PX;
    this.rollG.x = x;
    this.shadowG.x = x;

    if (this.chopT > 0) this.chopT = Math.max(0, this.chopT - dt);
    this.drawKnife();
  }

  private drawKnife(): void {
    let anchor = this.knifeX;
    let k = this.knifeK;
    let depth = 0;
    if (this.chopT > 0) {
      anchor = this.chopXc;
      k = this.chopK;
      const p = 1 - this.chopT / CHOP_SEC;
      depth = p < 0.4 ? p / 0.4 : 1 - (p - 0.4) / 0.6;
    }
    const tipY = KNIFE_IDLE_Y + depth * (ROLL_BOT + 8 - KNIFE_IDLE_Y);
    const tipX = anchor + k * (tipY - ROLL_CY);
    const rot = -Math.atan(k);
    const visible = this.state !== 'ending';
    this.knife.setPosition(tipX, tipY).setRotation(rot).setVisible(visible);
    this.knifeShadow.setPosition(tipX + 8, tipY + 8).setRotation(rot).setVisible(visible);

    // 어디가 잘릴지 미리 보여주는 점선
    this.guideG.clear();
    if (this.drag && this.chopT <= 0 && this.currentLine()) {
      const hh = ROLL_H / 2 + 20;
      const x0 = anchor - k * hh;
      const x1 = anchor + k * hh;
      const y0 = ROLL_CY - hh;
      const len = Math.hypot(x1 - x0, 2 * hh);
      this.guideG.lineStyle(4, 0xffffff, 0.75);
      for (let d = 0; d < len; d += 22) {
        const a = d / len;
        const e = Math.min(1, (d + 12) / len);
        this.guideG.lineBetween(x0 + (x1 - x0) * a, y0 + 2 * hh * a, x0 + (x1 - x0) * e, y0 + 2 * hh * e);
      }
    }
  }
}

