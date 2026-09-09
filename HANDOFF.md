# Herd handoff - week 1 foundation

Built to "Herd - Build Plan (week by week)", "Herd - Architecture",
"Herd - Database Schema v1", "Herd - Screen Map" (all in Vikas's Drive).

## Done

- Expo SDK 57 + TypeScript scaffold, dark theme, EAS profiles
  (development / staging / production). `eas.json` ready for weekly builds.
- Auth flow: Welcome -> email sign up / sign in -> 13+ age gate (blocked
  outright under 13, no child flow) -> email verification. Apple Sign-In is
  a placed, disabled button (wired week 2).
- Onboarding: profile setup (display name, @handle, listener/artist) ->
  country/region + genre multi-select -> artist extras (bio, location, links)
  -> lands on feed.
- Full approved schema as one migration: 14 tables, RLS on every table,
  heart-count and hearts-total triggers, published_at trigger, status-change
  guard (functions only), charts materialized view + chart_refresh(),
  feed_page(cursor) RPC with keyset pagination.
- Feed spike: full-screen snap scroll, autoplay on focus / pause on blur,
  overlay (artist, @handle, title, genre tag), right rail (heart + count,
  share), double-tap heart with optimistic count + write-through, long-press
  options sheet (share, report with fixed reason codes), cursor pagination,
  lookahead prefetch of the next two manifests, cancel-on-fast-scroll,
  first-frame perf logging hooks for M3.
- Radio spike: track-player service with lock-screen capabilities, playback
  service registered natively, audio arbitration (radio pauses feed, feed
  pauses radio).
- CI workflow (typecheck on every PR).

## Conventions for whoever picks this up (Claude Code / Codex included)

- Branch + PR only, never main. Branch names `feat/<area>-<what>`.
- New behavior goes in new files under `src/features/<area>/`. Shared files
  (navigation, theme, AuthContext) change rarely and in small diffs.
- The schema is the signed contract. Do not add tables silently - gaps go
  back to Vikas/Mario first. Known gap: user genre preferences have no table
  (stored in AsyncStorage for now, flagged).
- Demo mode: with no Supabase env vars the app runs on demo content
  (Welcome > "Preview the app") so screens can be reviewed without a backend.

## Blocked (needs Vikas)

1. GitHub repo: the connected token cannot create repos. Create a private
   `herd` repo and this tree pushes as-is (`main` + this branch).
2. Supabase staging project + env vars in .env (see supabase/README.md).
3. Mario's genre taxonomy (week 2) replaces supabase/seed.sql.
4. GitHub Actions: the token lacks Workflows permission - either regenerate
   it with Workflows or push .github/workflows/ci.yml manually once.
5. EAS project: run `eas init` with Expo account access, fill projectId in
   app.json.

## Next (build plan order)

- Week 2: Apple Sign-In for real, device fingerprint row at signup, upload
  pipeline (upload-sign edge function, direct-to-Cloudflare, transcode
  webhook, thumbnail picker).
- Week 3: Flashlight harness on a Galaxy A54, iterate until the feed numbers
  hold. Feed perf logging hooks are already in place.
