-- Herd - initial schema (v1, 14 tables + charts materialized view)
-- Mirrors "Herd - Database Schema v1" (approved). Every table ships with RLS on.
-- Apply with: supabase db push  (or paste into the SQL editor on a fresh project)

create extension if not exists pgcrypto;

-- ---------- helpers ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  user_type text not null default 'listener' check (user_type in ('listener', 'artist')),
  display_name text,
  handle text unique check (handle is null or handle ~ '^[a-z0-9_]{3,24}$'),
  avatar_url text,
  country text,
  region text,
  date_of_birth date,
  phone text,
  suspended boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.artist_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  bio text,
  banner_url text,
  location_text text,
  external_links jsonb not null default '[]'::jsonb,
  hearts_total integer not null default 0
);

create table public.genres (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order integer not null default 0,
  active boolean not null default true
);

-- ---------- videos ----------
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  genre_id uuid references public.genres (id),
  external_links jsonb,
  status text not null default 'processing' check (status in ('processing', 'live', 'rejected', 'taken_down')),
  cloudflare_uid text,
  playback_url text,
  thumbnail_url text,
  duration_seconds integer check (duration_seconds is null or duration_seconds <= 180),
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes <= 524288000),
  heart_count integer not null default 0,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create index videos_status_published_idx on public.videos (status, published_at desc);
create index videos_genre_idx on public.videos (genre_id) where status = 'live';
create index videos_artist_idx on public.videos (artist_id);

-- published_at is set when status flips to live
create or replace function public.set_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'live' and old.status is distinct from 'live' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger videos_set_published_at
  before update on public.videos
  for each row execute function public.set_published_at();

-- status changes go through edge functions (service role) only, never the client
create or replace function public.guard_video_status()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'video status changes via functions only';
  end if;
  return new;
end;
$$;

create trigger videos_guard_status
  before update on public.videos
  for each row execute function public.guard_video_status();

-- ---------- hearts ----------
create table public.hearts (
  user_id uuid not null references public.profiles (id) on delete cascade,
  video_id uuid not null references public.videos (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create index hearts_video_idx on public.hearts (video_id);
create index hearts_created_idx on public.hearts (video_id, created_at desc);

create or replace function public.sync_heart_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update videos set heart_count = heart_count + 1 where id = new.video_id;
    return new;
  elsif tg_op = 'DELETE' then
    update videos set heart_count = greatest(heart_count - 1, 0) where id = old.video_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger hearts_sync_counts
  after insert or delete on public.hearts
  for each row execute function public.sync_heart_counts();

-- keep artist_profiles.hearts_total in step with video heart counts
create or replace function public.sync_artist_hearts_total()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update artist_profiles
     set hearts_total = hearts_total + (new.heart_count - old.heart_count)
   where user_id = new.artist_id;
  return new;
end;
$$;

create trigger videos_sync_artist_hearts
  after update of heart_count on public.videos
  for each row execute function public.sync_artist_hearts_total();

-- ---------- follows ----------
create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  artist_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, artist_id),
  check (follower_id <> artist_id)
);

-- ---------- charts ----------
create materialized view public.charts as
with scored as (
  select
    v.id as video_id,
    v.genre_id,
    (
      coalesce((
        select count(*) from public.hearts h
         where h.video_id = v.id and h.created_at > now() - interval '7 days'
      ), 0)::numeric * 1.0
      + v.heart_count::numeric * 0.1
      + greatest(0, 72 - extract(epoch from (now() - v.published_at)) / 3600) * 0.05
    ) as score
  from public.videos v
  where v.status = 'live'
),
overall as (
  select 'overall'::text as scope, null::uuid as genre_id, video_id, score,
         row_number() over (order by score desc, video_id) as rank
    from scored
   limit 25
),
by_genre as (
  select 'genre'::text as scope, genre_id, video_id, score,
         row_number() over (partition by genre_id order by score desc, video_id) as rank
    from scored
   where genre_id is not null
)
select scope, genre_id, video_id, rank, score, now() as computed_at from overall where rank <= 25
union all
select scope, genre_id, video_id, rank, score, now() as computed_at from by_genre where rank <= 10;

create unique index charts_unique_idx
  on public.charts (scope, coalesce(genre_id, '00000000-0000-0000-0000-000000000000'::uuid), video_id);

create table public.chart_history (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos (id) on delete cascade,
  scope text not null check (scope in ('overall', 'genre')),
  genre_id uuid references public.genres (id),
  rank integer not null,
  score numeric not null,
  computed_at timestamptz not null default now()
);

create index chart_history_video_idx on public.chart_history (video_id, scope, computed_at desc);

-- hourly job (wired via Supabase cron in the chart-refresh edge function, week 4):
-- rebuilds the materialized view and appends history rows. chart_overrides are
-- applied by that same job before "you entered a chart" pushes go out.
create or replace function public.chart_refresh()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  refresh materialized view public.charts;
  insert into public.chart_history (video_id, scope, genre_id, rank, score, computed_at)
  select video_id, scope, genre_id, rank, score, computed_at from public.charts;
end;
$$;

create table public.chart_overrides (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('overall', 'genre')),
  genre_id uuid references public.genres (id),
  video_id uuid not null references public.videos (id) on delete cascade,
  action text not null check (action in ('pin', 'remove')),
  pin_position integer,
  actor_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ---------- moderation ----------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id),
  video_id uuid not null references public.videos (id) on delete cascade,
  reason_code text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'resolved')),
  resolved_by uuid references public.profiles (id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index reports_status_idx on public.reports (status, created_at desc);

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles (id),
  action text not null check (action in ('approve', 'reject', 'takedown', 'suspend_user', 'chart_override')),
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  artist_name text not null,
  email text not null,
  links jsonb not null default '[]'::jsonb,
  message text,
  status text not null default 'new' check (status in ('new', 'reviewed', 'invited')),
  created_at timestamptz not null default now()
);

-- ---------- news ----------
create table public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body_md text not null,
  hero_image_url text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- devices / abuse ----------
create table public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null check (platform in ('ios', 'android')),
  device_fingerprint text not null,
  push_token text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (user_id, device_fingerprint)
);

-- one account per device fingerprint, enforced at the database too
create unique index devices_one_account_per_fingerprint on public.devices (device_fingerprint);

create table public.abuse_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id),
  video_id uuid references public.videos (id) on delete set null,
  flag_type text not null check (flag_type in ('vote_velocity_spike', 'rate_limit', 'multi_account')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- feed RPC ----------
-- One entry point for the feed. Keyset pagination, no offsets. Ranking is
-- recency weighted by heart velocity, computed here so it can be swapped
-- server-side without an app release.
create or replace function public.feed_page(
  cursor_score numeric default null,
  cursor_id uuid default null,
  page_limit integer default 10
)
returns table (
  id uuid,
  artist_id uuid,
  title text,
  description text,
  genre_id uuid,
  playback_url text,
  thumbnail_url text,
  duration_seconds integer,
  heart_count integer,
  published_at timestamptz,
  score numeric,
  artist_display_name text,
  artist_handle text,
  artist_avatar_url text,
  genre_slug text
)
language sql
stable
security definer
set search_path = public
as $$
  with scored as (
    select
      v.*,
      (
        coalesce((
          select count(*) from hearts h
           where h.video_id = v.id and h.created_at > now() - interval '7 days'
        ), 0)::numeric * 1.0
        + v.heart_count::numeric * 0.1
        + greatest(0, 72 - extract(epoch from (now() - v.published_at)) / 3600) * 0.05
      ) as score
    from videos v
    where v.status = 'live'
  )
  select
    s.id, s.artist_id, s.title, s.description, s.genre_id, s.playback_url,
    s.thumbnail_url, s.duration_seconds, s.heart_count, s.published_at, s.score,
    p.display_name, p.handle, p.avatar_url, g.slug
  from scored s
  join profiles p on p.id = s.artist_id and not p.suspended
  left join genres g on g.id = s.genre_id
  where cursor_score is null
     or (s.score, s.id) < (cursor_score, cursor_id)
  order by s.score desc, s.id desc
  limit page_limit;
$$;

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.artist_profiles enable row level security;
alter table public.genres enable row level security;
alter table public.videos enable row level security;
alter table public.hearts enable row level security;
alter table public.follows enable row level security;
alter table public.chart_history enable row level security;
alter table public.chart_overrides enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.submissions enable row level security;
alter table public.news_posts enable row level security;
alter table public.devices enable row level security;
alter table public.abuse_flags enable row level security;

create policy profiles_read on public.profiles for select using (true);
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy artist_profiles_read on public.artist_profiles for select using (true);
create policy artist_profiles_insert_own on public.artist_profiles for insert with check (auth.uid() = user_id);
create policy artist_profiles_update_own on public.artist_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy genres_read on public.genres for select using (true);
create policy genres_admin_write on public.genres for all using (public.is_admin()) with check (public.is_admin());

create policy videos_read on public.videos for select
  using (status = 'live' or auth.uid() = artist_id or public.is_admin());
create policy videos_insert_own on public.videos for insert
  with check (auth.uid() = artist_id);
create policy videos_update_own on public.videos for update
  using (auth.uid() = artist_id or public.is_admin())
  with check (auth.uid() = artist_id or public.is_admin());
create policy videos_delete_own on public.videos for delete
  using (auth.uid() = artist_id or public.is_admin());

create policy hearts_read_own on public.hearts for select using (auth.uid() = user_id);
create policy hearts_insert_own on public.hearts for insert with check (auth.uid() = user_id);
create policy hearts_delete_own on public.hearts for delete using (auth.uid() = user_id);

create policy follows_read on public.follows for select
  using (auth.uid() = follower_id or auth.uid() = artist_id);
create policy follows_insert_own on public.follows for insert with check (auth.uid() = follower_id);
create policy follows_delete_own on public.follows for delete using (auth.uid() = follower_id);

create policy chart_history_read on public.chart_history for select using (true);

create policy chart_overrides_admin on public.chart_overrides for all
  using (public.is_admin()) with check (public.is_admin());

create policy reports_read on public.reports for select
  using (auth.uid() = reporter_id or public.is_admin());
create policy reports_insert on public.reports for insert
  with check (auth.uid() = reporter_id);
create policy reports_update_admin on public.reports for update
  using (public.is_admin()) with check (public.is_admin());

create policy moderation_actions_admin on public.moderation_actions for all
  using (public.is_admin()) with check (public.is_admin());

create policy submissions_public_insert on public.submissions for insert with check (true);
create policy submissions_admin_read on public.submissions for select using (public.is_admin());
create policy submissions_admin_update on public.submissions for update
  using (public.is_admin()) with check (public.is_admin());

create policy news_posts_read on public.news_posts for select
  using (published_at is not null or public.is_admin());
create policy news_posts_admin_write on public.news_posts for all
  using (public.is_admin()) with check (public.is_admin());

create policy devices_read_own on public.devices for select using (auth.uid() = user_id);
create policy devices_insert_own on public.devices for insert with check (auth.uid() = user_id);
create policy devices_update_own on public.devices for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy devices_delete_own on public.devices for delete using (auth.uid() = user_id);

create policy abuse_flags_admin_read on public.abuse_flags for select using (public.is_admin());

-- charts is a materialized view (no RLS); grant read directly
grant select on public.charts to anon, authenticated;
grant execute on function public.feed_page(numeric, uuid, integer) to anon, authenticated;
