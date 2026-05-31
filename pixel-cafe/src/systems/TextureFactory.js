import { THEME } from '../data/theme.js';

export class TextureFactory {
  static create(scene) {
    if (scene.textures.exists('coffee-cup') || scene.textures.exists('cup-medium')) {
      return;
    }

    // 1. Process customer sheets if loaded
    if (scene.textures.exists('customers-sheet')) {
      this.createFromSheet(scene, 'duck-neutral', 'customers-sheet', 23, 216, 286, 382);
      this.createFromSheet(scene, 'duck-happy', 'customers-sheet', 329, 216, 287, 382);
      this.createFromSheet(scene, 'frog-neutral', 'customers-sheet', 635, 216, 290, 382);
      this.createFromSheet(scene, 'frog-happy', 'customers-sheet', 942, 216, 290, 382);
      this.createFromSheet(scene, 'cat-neutral', 'customers-sheet', 23, 641, 286, 378);
      this.createFromSheet(scene, 'cat-happy', 'customers-sheet', 329, 641, 287, 378);
      this.createFromSheet(scene, 'dog-neutral', 'customers-sheet', 635, 641, 290, 378);
      this.createFromSheet(scene, 'dog-happy', 'customers-sheet', 942, 641, 290, 378);

      // Create fallback keys so other components don't crash
      this.createFromSheet(scene, 'customer-pink', 'customers-sheet', 23, 641, 286, 378);
      this.createFromSheet(scene, 'customer-rose', 'customers-sheet', 635, 641, 290, 378);
      this.createFromSheet(scene, 'customer-blush', 'customers-sheet', 23, 216, 286, 382);
      this.createFromSheet(scene, 'customer-cream', 'customers-sheet', 635, 216, 290, 382);
    } else {
      this.createCustomer(scene, 'customer-pink', 0xd98ca3);
      this.createCustomer(scene, 'customer-rose', 0xc06d8a);
      this.createCustomer(scene, 'customer-blush', 0xf8c8dc);
      this.createCustomer(scene, 'customer-cream', 0xffd6e0);
    }

    // 2. Process shop UI sheets if loaded
    if (scene.textures.exists('ui-assets')) {
      this.createFromSheet(scene, 'syrup-vanilla', 'ui-assets', 78, 94, 151, 451);
      this.createFromSheet(scene, 'syrup-caramel', 'ui-assets', 290, 94, 150, 451);
      this.createFromSheet(scene, 'syrup-hazelnut', 'ui-assets', 485, 94, 155, 451);
      this.createFromSheet(scene, 'coffee-machine', 'ui-assets', 712, 88, 469, 471);
      this.createFromSheet(scene, 'milk-whole', 'ui-assets', 66, 605, 170, 319);
      this.createFromSheet(scene, 'milk-oat', 'ui-assets', 281, 605, 168, 319);
      this.createFromSheet(scene, 'milk-almond', 'ui-assets', 481, 604, 170, 320);
      this.createFromSheet(scene, 'cup-small', 'ui-assets', 705, 754, 120, 170);
      this.createFromSheet(scene, 'cup-medium', 'ui-assets', 848, 695, 139, 230);
      this.createFromSheet(scene, 'cup-large', 'ui-assets', 1004, 623, 178, 302);
      this.createFromSheet(scene, 'croissant', 'ui-assets', 136, 980, 291, 201);
      this.createFromSheet(scene, 'muffin', 'ui-assets', 526, 979, 194, 199);
      this.createFromSheet(scene, 'cookie', 'ui-assets', 848, 995, 229, 177);

      // Create fallback coffee-cup so existing references work
      this.createFromSheet(scene, 'coffee-cup', 'ui-assets', 848, 695, 139, 230);
    } else {
      this.createCoffeeCup(scene);
      this.createCroissant(scene);
      this.createMuffin(scene);
      this.createCookie(scene);
      this.createMilkCarton(scene, 'milk-whole', 0xfff6ee, 0xd98ca3);
      this.createMilkCarton(scene, 'milk-oat', 0xf4d0ad, 0xc06d8a);
      this.createMilkCarton(scene, 'milk-almond', 0xf1c7d2, 0xa45773);
      this.createSyrupBottle(scene, 'syrup-vanilla', 0xfff6ee);
      this.createSyrupBottle(scene, 'syrup-caramel', 0xd99a6c);
      this.createSyrupBottle(scene, 'syrup-hazelnut', 0x9b6b58);

      // Procedural fallbacks for size cup textures
      this.createCoffeeCupPlaceholder(scene, 'cup-small', 0.8);
      this.createCoffeeCupPlaceholder(scene, 'cup-medium', 1.0);
      this.createCoffeeCupPlaceholder(scene, 'cup-large', 1.2);
    }

    // 3. Shared decorative assets
    this.createClerk(scene);
    this.createCoin(scene);
    this.createTicket(scene);
    this.createPetal(scene);
    this.createCounterDetail(scene);
  }

  static createFromSheet(scene, key, sourceKey, x, y, width, height) {
    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }
    const canvas = scene.textures.createCanvas(key, width, height);
    const source = scene.textures.get(sourceKey);
    if (source) {
      const sourceImg = source.getSourceImage();
      canvas.context.drawImage(sourceImg, x, y, width, height, 0, 0, width, height);
      canvas.refresh();
    }
  }

  static createCustomer(scene, key, color) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color, 1).fillRect(10, 8, 44, 48);
    g.fillStyle(0xfff6ee, 1).fillRect(16, 16, 10, 8).fillRect(38, 16, 10, 8);
    g.fillStyle(THEME.borderDark, 1).fillRect(19, 18, 4, 4).fillRect(41, 18, 4, 4);
    g.fillStyle(0xf8c8dc, 1).fillRect(14, 30, 8, 6).fillRect(42, 30, 8, 6);
    g.fillStyle(THEME.borderDark, 1).fillRect(25, 38, 14, 4);
    g.fillStyle(THEME.buttonSelected, 1).fillRect(8, 52, 48, 14);
    g.lineStyle(3, THEME.borderDark).strokeRect(10, 8, 44, 58);
    g.generateTexture(key, 64, 72);
    g.destroy();
  }

  static createClerk(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xf8c8dc, 1).fillRect(8, 8, 40, 40);
    g.fillStyle(0xfff6ee, 1).fillRect(14, 16, 28, 18);
    g.fillStyle(THEME.borderDark, 1).fillRect(18, 22, 5, 5).fillRect(33, 22, 5, 5);
    g.fillStyle(THEME.buttonSelected, 1).fillRect(16, 36, 24, 8);
    g.fillStyle(THEME.receipt, 1).fillRect(6, 48, 44, 12);
    g.lineStyle(3, THEME.borderDark).strokeRect(8, 8, 40, 52);
    g.generateTexture('clerk', 56, 64);
    g.destroy();
  }

  static createCoffeeCup(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(THEME.receipt, 1).fillRect(12, 14, 28, 34);
    g.fillStyle(THEME.button, 1).fillRect(10, 12, 32, 8);
    g.fillStyle(THEME.counterDark, 1).fillRect(16, 24, 20, 10);
    g.lineStyle(3, THEME.borderDark).strokeRect(12, 14, 28, 34);
    g.generateTexture('coffee-cup', 52, 58);
    g.destroy();
  }

  static createCoffeeCupPlaceholder(scene, key, sizeMultiplier) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const w = 28 * sizeMultiplier;
    const h = 34 * sizeMultiplier;
    g.fillStyle(THEME.receipt, 1).fillRect(12, 14, w, h);
    g.fillStyle(THEME.button, 1).fillRect(10, 12, w + 4, 8);
    g.lineStyle(3, THEME.borderDark).strokeRect(12, 14, w, h);
    g.generateTexture(key, 52, 58);
    g.destroy();
  }

  static createCroissant(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xe7a772, 1).fillRect(8, 24, 40, 12);
    g.fillStyle(0xf5c08d, 1).fillRect(14, 16, 28, 14);
    g.fillStyle(0xc8794e, 1).fillRect(14, 32, 8, 4).fillRect(30, 32, 8, 4);
    g.lineStyle(3, THEME.borderDark).strokeRect(8, 20, 40, 18);
    g.generateTexture('croissant', 56, 52);
    g.destroy();
  }

  static createMuffin(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x8f5a48, 1).fillRect(14, 26, 30, 16);
    g.fillStyle(0xd98ca3, 1).fillRect(10, 18, 38, 14);
    g.fillStyle(0xffedf3, 1).fillRect(18, 14, 22, 8);
    g.fillStyle(THEME.borderDark, 1).fillRect(18, 32, 4, 5).fillRect(28, 32, 4, 5).fillRect(38, 32, 4, 5);
    g.lineStyle(3, THEME.borderDark).strokeRect(10, 18, 38, 24);
    g.generateTexture('muffin', 58, 54);
    g.destroy();
  }

  static createCookie(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xd99a6c, 1).fillRect(12, 14, 34, 34);
    g.fillStyle(0x7d3b53, 1).fillRect(20, 22, 5, 5).fillRect(34, 20, 5, 5).fillRect(30, 36, 5, 5);
    g.fillStyle(0xf6c189, 1).fillRect(18, 16, 22, 6);
    g.lineStyle(3, THEME.borderDark).strokeRect(12, 14, 34, 34);
    g.generateTexture('cookie', 58, 58);
    g.destroy();
  }

  static createMilkCarton(scene, key, fillColor, labelColor) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(fillColor, 1).fillRect(13, 16, 30, 38);
    g.fillStyle(labelColor, 1).fillRect(17, 32, 22, 12);
    g.fillStyle(0xffedf3, 1).fillRect(18, 20, 20, 6);
    g.lineStyle(3, THEME.borderDark).strokeRect(13, 16, 30, 38);
    g.lineBetween(13, 16, 28, 6);
    g.lineBetween(43, 16, 28, 6);
    g.lineBetween(28, 6, 28, 16);
    g.generateTexture(key, 56, 62);
    g.destroy();
  }

  static createSyrupBottle(scene, key, fillColor) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(THEME.borderDark, 1).fillRect(22, 8, 14, 8);
    g.fillStyle(fillColor, 1).fillRect(16, 16, 26, 38);
    g.fillStyle(THEME.backPanel, 1).fillRect(20, 28, 18, 12);
    g.lineStyle(3, THEME.borderDark).strokeRect(16, 16, 26, 38);
    g.generateTexture(key, 58, 62);
    g.destroy();
  }

  static createCoin(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xf6d58b, 1).fillRect(10, 10, 28, 28);
    g.fillStyle(0xfff1b8, 1).fillRect(16, 16, 16, 16);
    g.lineStyle(3, 0xa45773).strokeRect(10, 10, 28, 28);
    g.generateTexture('coin', 48, 48);
    g.destroy();
  }

  static createTicket(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(THEME.receipt, 1).fillRect(8, 6, 34, 42);
    g.fillStyle(THEME.backPanel, 1).fillRect(12, 12, 26, 6);
    g.fillStyle(THEME.border, 1).fillRect(12, 24, 22, 3).fillRect(12, 32, 18, 3);
    g.lineStyle(2, THEME.borderDark).strokeRect(8, 6, 34, 42);
    g.generateTexture('ticket-icon', 50, 56);
    g.destroy();
  }

  static createPetal(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xf8c8dc, 1).fillRect(8, 4, 10, 18);
    g.fillStyle(0xffedf3, 1).fillRect(11, 7, 4, 10);
    g.generateTexture('sakura-petal', 26, 28);
    g.destroy();
  }

  static createCounterDetail(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(THEME.counterDark, 1).fillRect(0, 0, 96, 14);
    g.fillStyle(THEME.backPanel, 1).fillRect(10, 4, 18, 6).fillRect(40, 4, 18, 6).fillRect(70, 4, 18, 6);
    g.generateTexture('counter-detail', 96, 14);
    g.destroy();
  }
}
