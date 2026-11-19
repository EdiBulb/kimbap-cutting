import * as Phaser from 'phaser';
import { COLOR, FONT } from './config';

export function text(
  scene: Phaser.Scene,
  x: number,
  y: number,
  value: string,
  size: number,
  color = '#ffffff',
  weight = '800',
): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, value, {
      fontFamily: FONT,
      fontSize: `${size}px`,
      fontStyle: weight,
      color,
      stroke: 'rgba(40,20,5,0.65)',
      strokeThickness: Math.round(size / 7),
      align: 'center',
      resolution: 2,
    })
    .setOrigin(0.5);
}

/** 노란 알약 모양 버튼 */
export function button(scene: Phaser.Scene, x: number, y: number, label: string, onClick: () => void) {
  const w = 300;
  const h = 92;
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  const paint = (pressed: boolean) => {
    g.clear();
    if (!pressed) {
      g.fillStyle(0xb88a2a, 1);
      g.fillRoundedRect(-w / 2, -h / 2 + 8, w, h, h / 2);
    }
    g.fillStyle(COLOR.gold, 1);
    g.fillRoundedRect(-w / 2, -h / 2 + (pressed ? 6 : 0), w, h, h / 2);
  };
  paint(false);
  const t = scene.add
    .text(0, 0, label, { fontFamily: FONT, fontSize: '36px', fontStyle: '800', color: COLOR.brownCss, resolution: 2 })
    .setOrigin(0.5);
  c.add([g, t]);
  c.setSize(w, h + 8);
  c.setInteractive({ useHandCursor: true });
  c.on('pointerdown', () => {
    paint(true);
    t.y = 6;
  });
  c.on('pointerout', () => {
    paint(false);
    t.y = 0;
  });
  c.on('pointerup', () => {
    paint(false);
    t.y = 0;
    onClick();
  });
  return c;
}
