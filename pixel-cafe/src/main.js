import Phaser from 'phaser';
import './style.css';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { GameScene } from './scenes/GameScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#ffe4ec',
  scene: [MainMenuScene, GameScene],
  pixelArt: false,
  roundPixels: true,
};

new Phaser.Game(config);
