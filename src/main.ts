import * as Phaser from 'phaser';
import { GAME_H, GAME_W } from './config';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import { ResultScene } from './scenes/ResultScene';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME_W,
  height: GAME_H,
  backgroundColor: '#2b1d14',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: { activePointers: 1 },
  scene: [BootScene, TitleScene, GameScene, ResultScene],
});
