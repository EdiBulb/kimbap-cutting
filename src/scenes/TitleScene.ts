import * as Phaser from 'phaser';
import { DIA_MM, GAME_H, GAME_W } from '../config';
import { drawPiece, makeSesame } from '../draw/kimbap';
import { Roll } from '../logic/roll';
import { button, text } from '../ui';
import { unlock } from '../audio/sfx';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    this.add.image(0, 0, 'wood').setOrigin(0);

    // 장식용으로 몇 번 썰어 둔 김밥
    const demo = new Roll(120);
    [[22, 22], [44, 38], [60, 60], [78, 84], [96, 96]].forEach(([t, b]) => demo.tryCut(t, b));
    const s = 4.4;
    const g = this.add.graphics();
    const x0 = GAME_W / 2 - (120 * s) / 2;
    const top = 250;
    g.fillStyle(0x3c1e0a, 0.28);
    g.fillEllipse(GAME_W / 2, top + DIA_MM * s + 8, 120 * s + 20, 22);
    const sesame = makeSesame(120, 100);
    demo.pieces().forEach((p) => drawPiece(g, p, x0, top, s, DIA_MM, { sesame }));

    text(this, GAME_W / 2, 150, '김밥 썰기', 92);
    text(this, GAME_W / 2, 470, '한 줄을 몇 알로 썰 수 있을까?', 32, '#fff4dd', '700');

    const panel = this.add.graphics();
    panel.fillStyle(0x2b1608, 0.55);
    panel.fillRoundedRect(GAME_W / 2 - 290, 540, 580, 300, 32);
    const rules = [
      '김밥이 오른쪽에서 계속 들어와요',
      '위에서 아래로 쓱 그으면 썰려요',
      '비스듬히 그으면 그 각도대로 썰려요',
      '최대한 얇게, 많이 썰어 보세요!',
    ];
    rules.forEach((r, i) => text(this, GAME_W / 2, 600 + i * 62, r, 30, i === 3 ? '#ffd66b' : '#ffffff', '700'));

    button(this, GAME_W / 2, GAME_H - 300, '시작하기', () => {
      unlock();
      this.scene.start('Game');
    });
  }
}
