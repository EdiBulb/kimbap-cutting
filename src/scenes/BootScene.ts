import * as Phaser from 'phaser';
import { GAME_H, GAME_W, ROLL_H } from '../config';

export const KNIFE_BLADE = Math.max(220, ROLL_H * 1.3);
const KNIFE_W = 36;
const BOLSTER = 14;
const HANDLE = 124;

/** 이미지 파일 없이 캔버스로 도마·칼·밥알 텍스처를 만들어 두는 씬 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    this.makeWood();
    this.makeKnife();
    this.makeRice();
    this.scene.start('Title');
  }

  private makeWood(): void {
    const tex = this.textures.createCanvas('wood', GAME_W, GAME_H)!;
    const g = tex.getContext();
    const W = GAME_W;
    const H = GAME_H;

    const base = g.createLinearGradient(0, 0, W, H);
    base.addColorStop(0, '#dcaa6f');
    base.addColorStop(1, '#b97f45');
    g.fillStyle = base;
    g.fillRect(0, 0, W, H);

    let s = 99;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 90; i++) {
      const y0 = r() * H * 1.2 - H * 0.1;
      const amp = 4 + r() * 12;
      const f = 0.0015 + r() * 0.005;
      const ph = r() * 6;
      g.strokeStyle = `rgba(110,60,25,${0.04 + r() * 0.12})`;
      g.lineWidth = 1 + r() * 3;
      g.beginPath();
      for (let x = -20; x <= W + 20; x += 10) {
        const y = y0 + Math.sin(x * f + ph) * amp + x * 0.04;
        if (x === -20) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    }
    for (let i = 0; i < 2; i++) {
      const kx = r() * W;
      const ky = r() * H;
      for (let j = 1; j <= 5; j++) {
        g.strokeStyle = `rgba(100,50,20,${0.18 - j * 0.025})`;
        g.lineWidth = 2;
        g.beginPath();
        g.ellipse(kx, ky, j * 13, j * 5, 0.05, 0, Math.PI * 2);
        g.stroke();
      }
    }
    const vig = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(40,20,5,.4)');
    g.fillStyle = vig;
    g.fillRect(0, 0, W, H);
    tex.refresh();
  }

  /** 칼끝이 텍스처 아래 가운데에 오도록 그려요 (origin 0.5, 1) */
  private makeKnife(): void {
    const H = KNIFE_BLADE + BOLSTER + HANDLE;
    const tex = this.textures.createCanvas('knife', KNIFE_W, H)!;
    const g = tex.getContext();
    const cx = KNIFE_W / 2;
    const tip = H;
    const bladeTop = tip - KNIFE_BLADE;

    const steel = g.createLinearGradient(cx - 12, 0, cx + 12, 0);
    steel.addColorStop(0, '#7f8890');
    steel.addColorStop(0.45, '#f4f7f9');
    steel.addColorStop(1, '#a9b2b9');
    g.fillStyle = steel;
    g.beginPath();
    g.moveTo(cx - 12, bladeTop);
    g.lineTo(cx + 12, bladeTop);
    g.lineTo(cx + 10, tip - 16);
    g.lineTo(cx, tip);
    g.lineTo(cx - 10, tip - 16);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(255,255,255,.9)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(cx, bladeTop + 8);
    g.lineTo(cx, tip - 4);
    g.stroke();

    g.fillStyle = '#4b4f54';
    g.fillRect(cx - 16, bladeTop - BOLSTER, 32, BOLSTER);

    const hTop = bladeTop - BOLSTER - HANDLE;
    g.fillStyle = '#4a2c19';
    g.beginPath();
    g.roundRect(cx - 16, hTop, 32, HANDLE, 12);
    g.fill();
    g.fillStyle = '#d9c9a8';
    [0.25, 0.5, 0.75].forEach((f) => {
      g.beginPath();
      g.arc(cx, hTop + HANDLE * f, 4.5, 0, Math.PI * 2);
      g.fill();
    });
    tex.refresh();
  }

  private makeRice(): void {
    const g = this.make.graphics({}, false);
    g.fillStyle(0xf6f1e4, 1);
    g.fillEllipse(5, 3, 9, 5);
    g.generateTexture('rice', 10, 6);
    g.destroy();
  }
}
