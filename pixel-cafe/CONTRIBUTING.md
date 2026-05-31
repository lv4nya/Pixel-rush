# Contributing

Thanks for your interest in Pixel Brew Bakery.

## Local Setup

```bash
npm install
npm run dev
```

## Before Opening a Pull Request

Run:

```bash
npm run build
```

## Project Direction

Please keep the prototype focused:

- Counter-service cafe gameplay only
- No WASD movement
- No top-down restaurant map
- No tables
- No extra order fields unless planned
- No external image dependency unless intentionally added

## Code Style

- Use ES module imports and exports.
- Keep Phaser scene code beginner-friendly.
- Prefer small systems in `src/systems/` for reusable logic.
- Keep data lists in `src/data/`.
