# Herd

TikTok-style music-video app for indie artists. Vertical feed, hearts drive a
Top 25 plus genre charts, live radio alongside. One React Native codebase
shipping to iOS and Android together.

Stack: React Native + Expo (prebuild / CNG), Supabase (Postgres, Auth, RLS,
Edge Functions), Cloudflare Stream (video), react-native-track-player (radio).

## Repo rules

- Branch and PR only. Nobody pushes to main; everything lands by PR review.
- Branch naming: `feat/<area>-<what>` (e.g. `feat/feed-spike`, `feat/auth-flow`).
- Keep changes modular: new behavior in new files under `src/features/<area>/`
  rather than edits spread through shared files.

## Layout

```
src/
  App.tsx                 providers + root navigator
  config/env.ts           EXPO_PUBLIC_* runtime config
  lib/                    supabase client, age gate
  navigation/             auth stack, onboarding stack, main tabs
  screens/                one folder per area (auth, feed, charts, radio, news, profile)
  features/feed/          the feed spike: pager, prefetch, player, cards
  features/radio/         track-player service + audio arbitration
supabase/
  migrations/             approved 14-table schema + RLS + feed_page RPC
  seed.sql                TEMP genre list (Mario's taxonomy replaces it, week 2)
```

## Run it

```sh
cp .env.example .env   # fill Supabase staging values when the project exists
npm install
npx expo start         # dev client (react-native-video/track-player need prebuild, not Expo Go)
npx expo prebuild      # generates ios/ and android/ (gitignored, CNG)
eas build --profile staging --platform android   # weekly internal build
```

The M3 gate: <400ms first frame, 60fps, <3s cold start on a Galaxy A54,
measured with Flashlight on release builds from week 3. The feed keeps its
guardrails from day one (3-video window, small buffers, cancellable preload).

## Status

Week 1 of 9. See HANDOFF.md for what is done, what is next, and what is blocked.
