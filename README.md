# Kimbap Slice (김밥 썰기)

A mobile web mini-game: a kimbap roll slides across a wooden cutting board, and you swipe down to slice it. The knife follows your finger, and each slice is cut at the angle you swipe. Your score is the number of pieces you cut from one roll. At the end, every piece is laid out on a plate so you can see exactly how you cut it.

Built with **Phaser 4 + TypeScript + Vite**. All graphics and sounds are generated in code; there are no image or audio files.

## Gameplay

- The roll enters from the right at a constant speed (20 cm roll, about 15 s per round)
- Swipe from top to bottom to cut. A diagonal swipe gives a diagonal cut (up to about 50°)
- A dashed guide shows where the cut will land while you swipe
- Each cut shows the slice thickness in mm. Very thin slices get a bonus "얇다!" sound
- Cuts that cross an earlier cut, or miss the roll, are rejected

## Project structure

```
src/
  config.ts            Game constants (sizes in mm, speed, angle limits)
  logic/roll.ts        Pure cutting logic: Roll, swipe → line, summary, grades
  logic/plate.ts       Pure layout for the result plate (binary-searched scale)
  draw/kimbap.ts       Draws a kimbap piece (seaweed shading, sesame, cut faces)
  audio/sfx.ts         Web Audio chop / ding sounds + vibration
  scenes/              Boot (generates textures) → Title → Game → Result
tests/roll.test.ts     Vitest unit tests for the game logic
```

The cutting rules are kept separate from Phaser in `logic/`, so they can be unit-tested without a browser.

## Scripts

```bash
npm install
npm run dev      # local dev server (--host, so you can open it on your phone over Wi-Fi)
npm test         # unit tests
npm run build    # type-check + production build to dist/
```

## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` runs the tests, builds the game and deploys it on every push to `main`.
In the repo, go to **Settings → Pages → Source** and select **GitHub Actions**.

## Roadmap

- Asynchronous 1:1 challenge: invite a friend. Results stay hidden until both players finish (Supabase)
- Minimum-thickness rule (pieces that are too thin crumble and don't count)
