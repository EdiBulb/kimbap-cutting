import * as Phaser from 'phaser';
import { DIA_MM, GAME_H, GAME_W, ROLL_MM } from '../config';
import { drawPiece, makeSesame } from '../draw/kimbap';
import { layoutPlate } from '../logic/plate';
import { gradeFor, summarize, type Piece } from '../logic/roll';
import { button, text } from '../ui';

export class ResultScene extends Phaser.Scene {
  private pieces: Piece[] = [];

  constructor() {
    super('Result');
  }

  init(data: { pieces: Piece[] }): void {
    this.pieces = data.pieces;
  }

  create(): void {
    this.add.image(0, 0, 'wood').setOrigin(0);

    const R = GAME_W * 0.46;
    const cx = GAME_W / 2;
    const cy = 120 + R;

    // 접시
    const plate = this.add.graphics();
    plate.fillStyle(0x32190a, 0.35);
    plate.fillCircle(cx + 10, cy + 16, R * 1.01);
    plate.fillStyle(0xdcd8cf, 1);
    plate.fillCircle(cx, cy, R);
    plate.fillStyle(0xf3f1ec, 1);
    plate.fillCircle(cx, cy, R * 0.95);
    plate.fillStyle(0xffffff, 0.6);
    plate.fillCircle(cx - R * 0.15, cy - R * 0.15, R * 0.6);
    plate.lineStyle(3, 0x000000, 0.07);
    plate.strokeCircle(cx, cy, R * 0.84);

    const summary = summarize(this.pieces);
    const { scale, items } = layoutPlate(this.pieces, { cx, cy, size: R * 1.3 }, DIA_MM);
    const sesame = makeSesame(ROLL_MM);
    const g = this.add.graphics();

    // 접시에 하나씩 톡톡 놓이는 연출
    items.forEach((it, i) => {
      this.time.delayedCall(i * 35, () => {
        g.fillStyle(0x000000, 0.12);
        g.fillEllipse(it.x + (it.widthMm * scale) / 2, it.top + DIA_MM * scale + 2, it.widthMm * scale + 2, 5);
        const highlight = this.pieces.length > 2 && i === summary.thinnestIndex;
        drawPiece(g, it.piece, it.x, it.top, scale, DIA_MM, { sesame, sesameShiftMm: it.shiftMm, highlight });
        if (highlight) {
          text(this, it.x + (it.widthMm * scale) / 2, it.top - 22, `★ ${summary.minMm.toFixed(1)}mm`, 26, '#ffd66b');
        }
      });
    });

    // 결과
    const panelY = cy + R + 40;
    const shade = this.add.graphics();
    shade.fillStyle(0x1e1006, 0.55);
    shade.fillRect(0, panelY, GAME_W, GAME_H - panelY);

    text(this, GAME_W / 2, panelY + 90, `${summary.count}알`, 104);
    text(this, GAME_W / 2, panelY + 185, gradeFor(summary.count), 40, '#ffd66b');
    text(
      this,
      GAME_W / 2,
      panelY + 245,
      `평균 ${summary.avgMm.toFixed(1)}mm · 가장 얇은 알 ${summary.minMm.toFixed(1)}mm`,
      28,
      '#ffffff',
      '600',
    );

    button(this, GAME_W / 2, Math.min(GAME_H - 110, panelY + 360), '다시 썰기', () => this.scene.start('Game'));
  }
}
