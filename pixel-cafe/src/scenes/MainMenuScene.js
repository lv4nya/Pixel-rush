import Phaser from 'phaser';
import { TEXT, THEME } from '../data/theme.js';
import { TextureFactory } from '../systems/TextureFactory.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  preload() {
    this.load.image('customers-sheet', 'assets/customers/kawaii_animal_pixel_avatars.png');
    this.load.image('ui-assets', 'assets/ui/pastel_coffee_shop_pixel_assets.png');
  }

  create() {
    TextureFactory.create(this);
    this.showMainMenu();

    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });

    this.input.keyboard.on('keydown-H', () => {
      this.showHowToPlay();
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.showMainMenu();
    });

    this.input.keyboard.on('keydown-BACKSPACE', () => {
      this.showMainMenu();
    });
  }

  showMainMenu() {
    const { width, height } = this.scale;

    this.children.removeAll(true);
    // Soft blush background
    this.add.rectangle(width / 2, height / 2, width, height, THEME.background);
    
    // Top sakura strip
    this.add.rectangle(width / 2, 88, width, 92, THEME.backPanel);
    
    // Bottom counter board (BORDER REMOVED)
    this.add.rectangle(width / 2, 438, 620, 122, THEME.panel);
    this.add.rectangle(width / 2, 498, 620, 18, THEME.counterDark);

    this.drawBlossoms();

    // Coziness visual assets on start screen
    if (this.textures.exists('coffee-machine')) {
      this.add.image(width / 2, 380, 'coffee-machine').setScale(0.32).setAlpha(0.85);
    }
    if (this.textures.exists('cat-neutral')) {
      this.add.image(width / 2 - 160, 390, 'cat-neutral').setScale(0.38);
    }
    if (this.textures.exists('duck-neutral')) {
      this.add.image(width / 2 + 160, 390, 'duck-neutral').setScale(0.38);
    }

    this.add.text(width / 2, 114, 'Pixel Brew Bakery', {
      ...this.textStyle(42, TEXT.dark, true),
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(width / 2, 174, 'A cozy cherry blossom cafe counter game', {
      ...this.textStyle(17, TEXT.muted, true),
      align: 'center',
    }).setOrigin(0.5);

    // Rounded borderless button panel
    this.add.rectangle(width / 2, 280, 340, 48, THEME.receipt);
    this.add.text(width / 2, 280, 'Press SPACE to Start', {
      ...this.textStyle(20, TEXT.dark, true),
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(width / 2, 340, 'Press H for How to Play', {
      ...this.textStyle(15, TEXT.muted, true),
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(width / 2, 438, 'soft coffee, tiny pastries, careful hands', {
      ...this.textStyle(16, TEXT.muted),
      align: 'center',
    }).setOrigin(0.5);
  }

  showHowToPlay() {
    const { width, height } = this.scale;
    const steps = [
      '1. Read the customer order ticket.',
      '2. Select Coffee Drink and Cup Size (visual cups).',
      '3. Click cartons and pumps for Milk & Syrup.',
      '4. Add a delicious treat from the Bakery Case shelf.',
      '5. Watch your recipe assemble live on the Bottom Strip.',
      '6. Click Serve Order to earn coins based on accuracy.',
      '7. Reach the daily target before time runs out!',
    ];

    this.children.removeAll(true);
    this.add.rectangle(width / 2, height / 2, width, height, THEME.background);
    this.drawBlossoms();

    // Borderless how-to box
    this.add.rectangle(width / 2, 300, 620, 420, THEME.panel);
    this.add.rectangle(width / 2, 108, 360, 42, THEME.receipt);
    this.add.text(width / 2, 108, 'How to Play', this.textStyle(24, TEXT.dark, true))
      .setOrigin(0.5);

    steps.forEach((step, index) => {
      this.add.text(110, 166 + index * 36, step, this.textStyle(15, TEXT.dark));
    });

    // Borderless bottom button
    this.add.rectangle(width / 2, 506, 430, 42, THEME.receipt);
    this.add.text(width / 2, 506, 'Press ESC or BACKSPACE to return', {
      ...this.textStyle(15, TEXT.muted, true),
      align: 'center',
    }).setOrigin(0.5);
  }

  drawBlossoms() {
    const marks = [
      [78, 74, '🌸'], [126, 128, '🌸'], [680, 74, '🌸'], [730, 138, '🌸'],
      [70, 320, '🌸'], [730, 320, '🌸'], [94, 506, '🌸'], [706, 506, '🌸'],
    ];

    marks.forEach(([x, y, symbol]) => {
      this.add.text(x, y, symbol, { fontSize: '20px' })
        .setOrigin(0.5);
    });
  }

  textStyle(size, color, bold = false) {
    return {
      fontFamily: 'Courier New',
      fontSize: `${size}px`,
      color,
      fontStyle: bold ? 'bold' : 'normal',
    };
  }
}
