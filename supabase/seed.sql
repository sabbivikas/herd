-- TEMP placeholder genres so the feed/genre filters work in staging.
-- The real controlled list comes from Mario's taxonomy (needed by week 2).
insert into public.genres (name, slug, sort_order) values
  ('Hip-Hop', 'hip-hop', 1),
  ('R&B', 'rnb', 2),
  ('Pop', 'pop', 3),
  ('Electronic', 'electronic', 4),
  ('Afrobeats', 'afrobeats', 5),
  ('Latin', 'latin', 6),
  ('Country', 'country', 7),
  ('Rock', 'rock', 8)
on conflict (slug) do nothing;
