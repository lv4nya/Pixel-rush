# Pixel Brew Bakery

Pixel Brew Bakery is a cozy counter-service cafe game prototype built with Vite, vanilla JavaScript, and Phaser 3.

The player reads a customer order, prepares a coffee and bakery item using visual counter controls, serves the order, earns coins based on accuracy, and tries to hit the day target before time runs out.

## Current Features

- Side-on cafe counter layout
- Customer sprite with entry, idle, and exit animations
- Large customer order speech bubble
- Visual prep controls for drink, cup size, milk, syrup, and bakery item
- Live `YOUR PREP` checklist
- Serve Order scoring and coin rewards
- Customer reactions based on order accuracy
- 90-second Day 1 timer with target coins
- End-of-day result and restart flow
- Runtime-generated pixel-style textures
- Safe optional sound support
- Main menu and How to Play screen
- Sakura pink and blush theme with outer butter-yellow page background

## Tech Stack

- [Vite](https://vitejs.dev/)
- [Phaser 3](https://phaser.io/)
- Vanilla JavaScript ES modules

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Controls

- `SPACE`: Start the game from the main menu
- `H`: Open How to Play from the main menu
- `ESC` or `BACKSPACE`: Return from How to Play to the main menu
- Mouse / touch: Select prep items and serve orders

## Gameplay Loop

1. A customer appears at the counter.
2. Read the order in the speech bubble.
3. Select the matching visual prep items:
   - Drink
   - Size
   - Milk
   - Syrup
   - Bakery
4. Check `YOUR PREP`.
5. Click `Serve Order`.
6. Earn coins based on accuracy.
7. Serve enough accurate orders to reach the daily coin target.

## Optional Audio

The game safely checks for these optional files:

```text
public/assets/audio/click.mp3
public/assets/audio/serve.mp3
public/assets/audio/coin.mp3
public/assets/audio/success.mp3
public/assets/audio/error.mp3
public/assets/audio/ambience.mp3
```

If the files are missing, the game runs silently and does not crash.

## Project Structure

```text
src/
  main.js
  style.css
  data/
    customers.js
    menuItems.js
    theme.js
  scenes/
    MainMenuScene.js
    GameScene.js
  systems/
    OrderSystem.js
    ScoringSystem.js
    SoundManager.js
    TextureFactory.js
```

## Notes

- The project does not require external image assets.
- Pixel-style game textures are generated at runtime in `TextureFactory`.
- Audio support is optional and handled by `SoundManager`.
- The game intentionally avoids top-down movement, WASD controls, tables, upgrades, inventory, and drag-and-drop for now.

## License

No license has been selected yet. Add a license before publishing if you want others to use, modify, or distribute the project.
