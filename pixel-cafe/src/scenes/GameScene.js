import Phaser from 'phaser';
import {
  bakeryItems,
  cupSizes,
  drinkTypes,
  milkTypes,
  orderFields,
  syrups,
} from '../data/menuItems.js';
import { TEXT, THEME } from '../data/theme.js';
import { OrderSystem } from '../systems/OrderSystem.js';
import { ScoringSystem } from '../systems/ScoringSystem.js';
import { SoundManager } from '../systems/SoundManager.js';
import { TextureFactory } from '../systems/TextureFactory.js';

const DAY_LENGTH_SECONDS = 90;
const DAY_TARGET_COINS = 100;

const DRINK_VISUALS = {
  Latte: { texture: 'cup-medium', scale: 0.22 },
  Cappuccino: { texture: 'cup-large', scale: 0.22 },
  Americano: { texture: 'cup-small', scale: 0.22 },
};

const SIZE_VISUALS = {
  Small: { texture: 'cup-small', scale: 0.22 },
  Medium: { texture: 'cup-medium', scale: 0.22 },
  Large: { texture: 'cup-large', scale: 0.22 },
};

const MILK_VISUALS = {
  'Whole Milk': { texture: 'milk-whole', scale: 0.16, label: 'Whole' },
  'Oat Milk': { texture: 'milk-oat', scale: 0.16, label: 'Oat' },
  'Almond Milk': { texture: 'milk-almond', scale: 0.16, label: 'Almond' },
};

const SYRUP_VISUALS = {
  Vanilla: { texture: 'syrup-vanilla', scale: 0.12 },
  Caramel: { texture: 'syrup-caramel', scale: 0.12 },
  Hazelnut: { texture: 'syrup-hazelnut', scale: 0.12 },
};

const BAKERY_VISUALS = {
  Croissant: { texture: 'croissant', scale: 0.18 },
  Muffin: { texture: 'muffin', scale: 0.18 },
  Cookie: { texture: 'cookie', scale: 0.18 },
};

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });

    this.coins = 0;
    this.lastScore = null;
  }

  preload() {
    SoundManager.preload(this);
    this.load.image('customers-sheet', 'assets/customers/kawaii_animal_pixel_avatars.png');
    this.load.image('ui-assets', 'assets/ui/pastel_coffee_shop_pixel_assets.png');
  }

  create() {
    TextureFactory.create(this);
    this.orderSystem = new OrderSystem();
    this.scoringSystem = new ScoringSystem();
    this.soundManager = new SoundManager();
    this.soundManager.startAmbience();

    this.restartDay();
  }

  update() {
    if (!this.isDayOver && this.timeLeft <= 0) {
      this.endDay();
    }
  }

  restartDay() {
    this.dayTimerEvent?.remove(false);
    this.nextCustomerEvent?.remove(false);
    this.nextCustomerEvent = null;

    this.day = 1;
    this.targetCoins = DAY_TARGET_COINS;
    this.timeLeft = DAY_LENGTH_SECONDS;
    this.coins = 0;
    this.lastScore = null;
    this.feedbackText = '';
    this.isDayOver = false;
    this.isAwaitingNextCustomer = false;
    this.isCustomerTransitioning = false;

    this.startNextCustomer(false);
    this.startDayTimer();
    this.drawScene();
  }

  startDayTimer() {
    this.dayTimerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.isDayOver) {
          return;
        }

        this.timeLeft -= 1;

        if (this.timeLeft <= 0) {
          this.endDay();
          return;
        }

        this.drawScene();
      },
    });
  }

  startNextCustomer(shouldRedraw = true) {
    if (this.isDayOver) {
      return;
    }

    this.customer = this.orderSystem.createCustomer();
    this.customerOrder = this.orderSystem.createCustomerOrder();
    this.preparedOrder = this.orderSystem.createBlankPreparedOrder();
    this.lastScore = null;
    this.feedbackText = '';
    this.customerPhase = 'entering';
    this.isCustomerTransitioning = true;
    this.isAwaitingNextCustomer = false;

    if (shouldRedraw && this.children) {
      this.drawScene();
    }
  }

  endDay() {
    this.timeLeft = 0;
    this.isDayOver = true;
    this.isAwaitingNextCustomer = false;
    this.isCustomerTransitioning = false;
    this.dayTimerEvent?.remove(false);
    this.nextCustomerEvent?.remove(false);
    this.nextCustomerEvent = null;
    this.drawScene();
  }

  drawScene() {
    this.children.removeAll(true);
    this.drawBackground();
    this.drawCustomerAndOrder();
    this.drawStatusBox();
    this.drawPrepSummary();
    this.drawPrepCounter();
    this.drawFeedback();

    if (this.isDayOver) {
      this.drawEndDayResult();
    }
  }

  drawBackground() {
    this.add.rectangle(400, 300, 800, 600, THEME.background);
    this.add.rectangle(400, 34, 800, 68, THEME.backPanel);
    this.add.rectangle(400, 282, 800, 28, THEME.counterDark);
    this.add.rectangle(400, 440, 800, 260, THEME.counter);
    this.add.rectangle(400, 554, 800, 84, THEME.counterDark);
    this.add.rectangle(400, 420, 748, 196, THEME.panel, 0.28);
    this.add.text(24, 16, 'Pixel Brew Bakery', this.textStyle(20, TEXT.dark, true));
    this.add.image(244, 292, 'counter-detail').setScale(1.7, 1).setAlpha(0.6);
    this.add.image(518, 292, 'counter-detail').setScale(1.7, 1).setAlpha(0.6);
    this.drawDriftingPetals();
  }

  drawDriftingPetals() {
    const petals = [
      [46, 92], [116, 58], [520, 76], [760, 92], [246, 52], [438, 34],
    ];

    petals.forEach(([x, y], index) => {
      const petal = this.add.image(x, y, 'sakura-petal')
        .setScale(0.75)
        .setAlpha(0.65)
        .setAngle(index % 2 === 0 ? -18 : 16);

      this.tweens.add({
        targets: petal,
        x: x + 18,
        y: y + 24,
        angle: petal.angle + 26,
        duration: 4200 + index * 220,
        yoyo: true,
        repeat: 0,
        ease: 'Sine.easeInOut',
      });
    });
  }

  drawCustomerAndOrder() {
    // 1. Beautiful customer window backing panel (BORDER REMOVED)
    const windowBg = this.add.graphics();
    windowBg.fillStyle(THEME.receipt, 1);
    windowBg.fillRoundedRect(74, 94, 200, 140, 12);

    // Sakura branches background details in window
    this.add.text(92, 114, '🌸', { fontSize: '18px' }).setOrigin(0.5).setAlpha(0.7);
    this.add.text(250, 194, '🌸', { fontSize: '14px' }).setOrigin(0.5).setAlpha(0.6);

    const customerX = this.customerPhase === 'entering' ? 38 : 174;
    const customer = this.add.image(customerX, 175, this.customer.textureKey)
      .setScale(0.25)
      .setDepth(2);

    if (this.customerPhase === 'entering') {
      this.tweens.add({
        targets: customer,
        x: 174,
        duration: 450,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.customerPhase = 'waiting';
          this.isCustomerTransitioning = false;
        },
      });
    } else if (this.customerPhase === 'exiting') {
      this.tweens.add({
        targets: customer,
        x: 318,
        alpha: 0,
        duration: 650,
        ease: 'Sine.easeIn',
      });
    }

    if (this.customerPhase !== 'exiting') {
      this.tweens.add({
        targets: customer,
        y: 173,
        duration: 900,
        yoyo: true,
        repeat: 0,
        ease: 'Sine.easeInOut',
      });
    }

    // Clerk & styled borderless Customer Nameplate
    this.add.image(270, 202, 'clerk').setScale(0.74).setAlpha(0.95);
    this.add.rectangle(174, 230, 120, 24, THEME.panel);
    this.add.text(174, 229, this.customer.name, this.textStyle(13, TEXT.dark, true))
      .setOrigin(0.5);

    // Speech bubble order ticket (BORDER REMOVED)
    const bubbleX = 422;
    this.add.rectangle(bubbleX, 150, 356, 202, THEME.receipt);
    this.add.triangle(250, 168, 0, 0, 36, 18, 36, -18, THEME.receipt);
    this.add.text(bubbleX, 72, 'ORDER', this.textStyle(18, TEXT.dark, true))
      .setOrigin(0.5);

    const orderLines = orderFields
      .map((field) => `${field.label}: ${this.customerOrder[field.key]}`)
      .join('\n');

    this.add.text(276, 96, orderLines, {
      ...this.textStyle(16, TEXT.dark, true),
      lineSpacing: 8,
    });

    const dialogue = this.lastScore ? this.getCustomerFeedback() : this.customer.greeting;
    this.add.text(bubbleX, 224, `"${dialogue}"`, {
      ...this.textStyle(13, TEXT.muted),
      align: 'center',
      wordWrap: { width: 310 },
    }).setOrigin(0.5);
  }

  drawStatusBox() {
    // Borderless status box panel
    this.add.rectangle(682, 62, 216, 88, THEME.panel);
    this.add.image(584, 54, 'coin').setScale(0.38);
    this.add.text(604, 22, `Day ${this.day}`, this.textStyle(13, TEXT.dark, true));
    this.add.text(678, 22, this.formatTime(this.timeLeft), this.textStyle(16, TEXT.dark, true));
    this.add.text(604, 46, `Coins ${this.coins}`, this.textStyle(12, TEXT.muted, true));
    this.add.text(678, 46, `Target ${this.targetCoins}`, this.textStyle(12, TEXT.muted, true));

    const scoreText = this.lastScore
      ? `Last ${this.lastScore.accuracy}%  +${this.lastScore.coins}`
      : 'Last score -';
    this.add.text(604, 70, scoreText, this.textStyle(12, TEXT.dark));
  }

  drawPrepSummary() {
    // 1. TOP RIGHT receipt panel (BORDER REMOVED)
    this.add.rectangle(682, 184, 216, 128, THEME.receipt);
    this.add.text(682, 128, 'YOUR PREP', this.textStyle(14, TEXT.dark, true))
      .setOrigin(0.5);

    orderFields.forEach((field, index) => {
      const value = this.preparedOrder[field.key] || 'Not selected';
      const isFilled = value !== 'Not selected';
      const y = 148 + index * 21;
      this.add.text(586, y, `${field.label}:`, this.textStyle(10, TEXT.muted, true));
      this.add.text(648, y, value, this.textStyle(10, isFilled ? TEXT.dark : THEME.missing, isFilled));
    });

    // 2. BOTTOM STRIP Live assembly layout (BORDERLESS PLATES)
    const startX = 42;
    const spacingX = 94;
    const stripY = 562;

    this.add.text(startX, stripY - 26, 'LIVE ASSEMBLY', this.textStyle(11, TEXT.cream, true));

    orderFields.forEach((field, index) => {
      const value = this.preparedOrder[field.key];
      const isSelected = !!value;
      const x = startX + 38 + index * spacingX;

      this.add.circle(x, stripY + 6, 22, 0xa45773, 0.45);

      if (isSelected) {
        let texture = 'coffee-cup';
        let scale = 0.4;

        if (field.key === 'drinkType') {
          texture = DRINK_VISUALS[value].texture;
          scale = DRINK_VISUALS[value].scale * 0.9;
        } else if (field.key === 'cupSize') {
          texture = SIZE_VISUALS[value].texture;
          scale = SIZE_VISUALS[value].scale * 0.9;
        } else if (field.key === 'milkType') {
          texture = MILK_VISUALS[value].texture;
          scale = MILK_VISUALS[value].scale * 0.9;
        } else if (field.key === 'syrup') {
          texture = SYRUP_VISUALS[value].texture;
          scale = SYRUP_VISUALS[value].scale * 0.9;
        } else if (field.key === 'bakeryItem') {
          texture = BAKERY_VISUALS[value].texture;
          scale = BAKERY_VISUALS[value].scale * 0.9;
        }

        this.add.image(x, stripY + 4, texture).setScale(scale);
        
        // Assembled heart marker
        this.add.text(x + 10, stripY - 14, '❤', {
          fontFamily: 'Courier New',
          fontSize: '11px',
          color: '#fff',
        }).setOrigin(0.5);
      } else {
        this.add.circle(x, stripY + 6, 4, THEME.borderDark);
      }

      const labelText = isSelected ? (value.length > 8 ? value.slice(0, 7) + '..' : value) : 'None';
      this.add.text(x, stripY + 25, labelText, this.textStyle(9, TEXT.cream))
        .setOrigin(0.5);
    });
  }

  drawPrepCounter() {
    this.drawLeftPrepArea();
    this.drawMachineArea();
    this.drawBakeryDisplay();
    this.drawServeArea();
  }

  drawLeftPrepArea() {
    this.add.text(166, 312, 'Cups + drinks', this.textStyle(16, TEXT.dark, true))
      .setOrigin(0.5);

    this.add.text(46, 340, 'Drink', this.textStyle(12, TEXT.muted, true));
    drinkTypes.forEach((drink, index) => {
      this.createVisualChoice({
        x: 72 + index * 90,
        y: 386,
        width: 82,
        height: 76,
        label: drink,
        fieldKey: 'drinkType',
        value: drink,
        texture: DRINK_VISUALS[drink].texture,
        iconScale: DRINK_VISUALS[drink].scale,
      });
    });

    this.add.text(46, 458, 'Size', this.textStyle(12, TEXT.muted, true));
    cupSizes.forEach((size, index) => {
      this.createVisualChoice({
        x: 72 + index * 90,
        y: 510,
        width: 82,
        height: 92,
        label: size,
        fieldKey: 'cupSize',
        value: size,
        texture: SIZE_VISUALS[size].texture,
        iconScale: SIZE_VISUALS[size].scale,
      });
    });
  }

  drawMachineArea() {
    this.add.text(404, 312, 'Coffee bar', this.textStyle(16, TEXT.dark, true))
      .setOrigin(0.5);

    // Large pink coffee machine sprite
    this.add.image(404, 350, 'coffee-machine').setScale(0.26);

    // Milk selection row (moved higher to avoid bottom strip)
    this.add.text(286, 414, 'Milk', this.textStyle(12, TEXT.muted, true));
    milkTypes.forEach((milk, index) => {
      this.createVisualChoice({
        x: 318 + index * 82,
        y: 450,
        width: 74,
        height: 70,
        label: MILK_VISUALS[milk].label,
        fieldKey: 'milkType',
        value: milk,
        texture: MILK_VISUALS[milk].texture,
        iconScale: MILK_VISUALS[milk].scale,
      });
    });

    // Syrup selection row
    this.add.text(286, 492, 'Syrup', this.textStyle(12, TEXT.muted, true));
    syrups.forEach((syrup, index) => {
      this.createVisualChoice({
        x: 318 + index * 82,
        y: 524,
        width: 74,
        height: 62,
        label: syrup,
        fieldKey: 'syrup',
        value: syrup,
        texture: SYRUP_VISUALS[syrup].texture,
        iconScale: SYRUP_VISUALS[syrup].scale,
      });
    });
  }

  drawBakeryDisplay() {
    // Beautiful glass display shelf design (BORDERLESS CONTAINER)
    this.add.rectangle(660, 428, 232, 190, THEME.receipt);
    this.add.text(660, 326, 'Bakery case', this.textStyle(16, TEXT.dark, true))
      .setOrigin(0.5);

    // Dynamic Shelves
    this.add.rectangle(660, 414, 212, 8, THEME.backPanel);
    this.add.rectangle(660, 492, 212, 8, THEME.backPanel);

    // Visual multi-shelf placement coordinates
    const bakeryPositions = {
      Croissant: { x: 614, y: 374 },
      Muffin: { x: 706, y: 374 },
      Cookie: { x: 660, y: 452 },
    };

    bakeryItems.forEach((item) => {
      const pos = bakeryPositions[item];
      this.createVisualChoice({
        x: pos.x,
        y: pos.y,
        width: 76,
        height: 70,
        label: item,
        fieldKey: 'bakeryItem',
        value: item,
        texture: BAKERY_VISUALS[item].texture,
        iconScale: BAKERY_VISUALS[item].scale,
      });
    });
  }

  drawServeArea() {
    this.add.text(660, 520, 'Serve when prep matches order.', {
      ...this.textStyle(12, TEXT.dark, true),
      align: 'center',
      wordWrap: { width: 190 },
    }).setOrigin(0.5);

    this.createButton(660, 564, 184, 46, 'Serve Order', () => {
      this.serveOrder();
    }, THEME.serve, 16, TEXT.light);
  }

  drawFeedback() {
    if (this.lastScore) {
      // Borderless feedback panel
      this.add.rectangle(400, 276, 320, 44, THEME.receipt);
      this.add.image(274, 276, 'coin').setScale(0.42);
      this.add.text(
        400,
        276,
        `${this.lastScore.accuracy}% accurate   +${this.lastScore.coins} coins`,
        this.textStyle(16, TEXT.dark, true)
      ).setOrigin(0.5);
    }

    if (this.feedbackText) {
      // Borderless feedback warning panel
      this.add.rectangle(400, 276, 350, 44, THEME.receipt);
      this.add.text(400, 276, this.feedbackText, {
        ...this.textStyle(16, TEXT.dark, true),
        align: 'center',
      }).setOrigin(0.5);
    }
  }

  drawEndDayResult() {
    const resultText = this.coins >= this.targetCoins ? 'Day Complete!' : 'Try Again!';

    // Double end day panels (BORDER REMOVED)
    this.add.rectangle(400, 312, 390, 186, THEME.receipt)
      .setDepth(30);
    this.add.rectangle(400, 242, 330, 34, THEME.backPanel)
      .setDepth(31);
    
    this.add.text(400, 242, resultText, this.textStyle(26, TEXT.dark, true))
      .setOrigin(0.5)
      .setDepth(32);
    this.add.text(400, 302, `Day ${this.day} Coins: ${this.coins} / ${this.targetCoins}`, {
      ...this.textStyle(18, TEXT.muted, true),
      align: 'center',
    }).setOrigin(0.5).setDepth(32);
    this.add.text(400, 334, 'The counter is closed for today.', {
      ...this.textStyle(15, TEXT.muted),
      align: 'center',
    }).setOrigin(0.5).setDepth(32);

    // CRITICAL FIX: Explicitly set the Restart Day button's depth above the 30-depth end panel backdrop!
    const restartBtn = this.createButton(400, 384, 170, 42, 'Restart Day', () => {
      this.restartDay();
    }, THEME.next, 15, TEXT.light);
    restartBtn.button.setDepth(32);
    restartBtn.text.setDepth(33);
  }

  createVisualChoice({ x, y, width, height, label, fieldKey, value, texture, iconScale }) {
    const isSelected = this.preparedOrder[fieldKey] === value;
    const fillColor = isSelected ? THEME.buttonSelected : THEME.receipt;
    const textColor = isSelected ? TEXT.light : TEXT.dark;
    
    // Completely borderless choice cards
    const card = this.add.rectangle(x, y, width, height, fillColor)
      .setInteractive({ useHandCursor: true });
      
    const icon = this.add.image(x, y - 10, texture).setScale(iconScale);
    const text = this.add.text(x, y + height / 2 - 17, label, {
      ...this.textStyle(11, textColor, true),
      align: 'center',
      wordWrap: { width: width - 8 },
    }).setOrigin(0.5);

    if (isSelected) {
      card.setScale(1.04);
      icon.setScale(iconScale * 1.06);
      text.setScale(1.04);
      
      // Beautiful pink/red selection heart indicator in the corner
      this.add.text(x + width / 2 - 13, y - height / 2 + 10, '❤', {
        fontFamily: 'Courier New',
        fontSize: '13px',
        color: '#fff',
      }).setOrigin(0.5);
    }

    const pressChoice = () => {
      if (this.isAwaitingNextCustomer || this.isDayOver || this.isCustomerTransitioning) {
        return;
      }

      this.soundManager?.play('click', { volume: 0.35 });

      // Satisfying Premium Squash & Stretch micro-animation!
      this.tweens.add({
        targets: [card, icon, text],
        scaleX: 1.14,
        scaleY: 0.86,
        angle: -3,
        duration: 80,
        yoyo: true,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          this.chooseOption(fieldKey, value);
        },
      });
    };

    card.on('pointerover', () => {
      if (!isSelected) {
        card.setFillStyle(THEME.panel);
      }
      icon.setY(y - 13);
    });
    card.on('pointerout', () => {
      card.setFillStyle(fillColor);
      icon.setY(y - 10);
    });
    card.on('pointerdown', pressChoice);
    icon.setInteractive({ useHandCursor: true }).on('pointerdown', pressChoice);
    text.setInteractive({ useHandCursor: true }).on('pointerdown', pressChoice);
  }

  chooseOption(fieldKey, value) {
    if (this.isAwaitingNextCustomer || this.isDayOver || this.isCustomerTransitioning) {
      return;
    }

    this.preparedOrder[fieldKey] = value;
    this.feedbackText = '';
    this.drawScene();
  }

  serveOrder() {
    if (this.isAwaitingNextCustomer || this.isDayOver || this.isCustomerTransitioning) {
      return;
    }

    if (!this.isOrderComplete()) {
      this.soundManager.play('error', { volume: 0.55 });
      this.feedbackText = 'Complete the order before serving!';
      this.drawScene();
      return;
    }

    this.soundManager.play('serve', { volume: 0.55 });
    this.lastScore = this.scoringSystem.scoreOrder(this.customerOrder, this.preparedOrder);
    this.coins += this.lastScore.coins;
    this.feedbackText = '';
    
    // Cozy reaction state change: happy portrait for good/high score!
    if (this.lastScore.accuracy >= 75) {
      this.customer.textureKey = this.customer.happyKey;
    } else {
      this.customer.textureKey = this.customer.neutralKey;
    }

    this.isAwaitingNextCustomer = true;
    this.isCustomerTransitioning = true;
    this.customerPhase = 'exiting';
    this.drawScene();
    this.showScorePopup(this.lastScore);
    this.soundManager.play('coin', { volume: 0.55 });
    this.soundManager.play('success', { volume: 0.45 });

    if (this.timeLeft > 0) {
      this.nextCustomerEvent = this.time.delayedCall(900, () => {
        this.nextCustomerEvent = null;
        this.startNextCustomer();
      });
    }
  }

  showScorePopup(score) {
    const popup = this.add.container(400, 238).setDepth(20);
    const bg = this.add.rectangle(0, 0, 190, 42, THEME.receipt);
    const coin = this.add.image(-70, 0, 'coin').setScale(0.45);
    const text = this.add.text(-42, -9, `${score.accuracy}%  +${score.coins}`, this.textStyle(17, TEXT.dark, true));
    popup.add([bg, coin, text]);

    this.tweens.add({
      targets: popup,
      y: 200,
      alpha: 0,
      duration: 1100,
      ease: 'Cubic.easeOut',
      onComplete: () => popup.destroy(),
    });
  }

  getCustomerFeedback() {
    if (this.lastScore.accuracy === 100) {
      return 'Perfect! This is exactly what I wanted!';
    }

    if (this.lastScore.accuracy >= 75) {
      return 'Pretty good, thank you!';
    }

    if (this.lastScore.accuracy >= 50) {
      return 'It is okay, but something feels a little off.';
    }

    return 'Hmm... this is not what I ordered.';
  }

  isOrderComplete() {
    return orderFields.every((field) => this.preparedOrder[field.key]);
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  createButton(
    x,
    y,
    width,
    height,
    label,
    onClick,
    fillColor = THEME.button,
    fontSize = 15,
    textColor = TEXT.dark
  ) {
    // Borderless button
    const button = this.add.rectangle(x, y, width, height, fillColor)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      ...this.textStyle(fontSize, textColor, true),
      align: 'center',
      wordWrap: { width: width - 10 },
    }).setOrigin(0.5);

    button.on('pointerover', () => {
      button.setFillStyle(THEME.buttonHover);
      text.setScale(1.03);
    });
    button.on('pointerout', () => {
      button.setFillStyle(fillColor);
      text.setScale(1);
    });

    const runClick = () => {
      this.soundManager?.play('click', { volume: 0.35 });
      this.tweens.add({
        targets: [button, text],
        scaleX: 1.06,
        scaleY: 1.06,
        duration: 70,
        yoyo: true,
        ease: 'Sine.easeInOut',
      });
      this.time.delayedCall(85, onClick);
    };

    button.on('pointerdown', runClick);
    text.setInteractive({ useHandCursor: true }).on('pointerdown', runClick);

    return { button, text };
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
