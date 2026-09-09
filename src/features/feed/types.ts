export type FeedVideo = {
  id: string;
  artistId: string;
  artistName: string;
  artistHandle: string;
  artistAvatarUrl: string | null;
  title: string;
  genreSlug: string | null;
  playbackUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  heartCount: number;
  score: number;
};

// Row shape returned by the feed_page RPC (snake_case).
export type FeedPageRow = {
  id: string;
  artist_id: string;
  title: string;
  description: string | null;
  genre_id: string | null;
  playback_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  heart_count: number;
  published_at: string | null;
  score: number;
  artist_display_name: string | null;
  artist_handle: string | null;
  artist_avatar_url: string | null;
  genre_slug: string | null;
};

export function mapFeedRow(row: FeedPageRow): FeedVideo {
  return {
    id: row.id,
    artistId: row.artist_id,
    artistName: row.artist_display_name ?? 'Unknown artist',
    artistHandle: row.artist_handle ?? '',
    artistAvatarUrl: row.artist_avatar_url,
    title: row.title,
    genreSlug: row.genre_slug,
    playbackUrl: row.playback_url,
    thumbnailUrl: row.thumbnail_url,
    durationSeconds: row.duration_seconds,
    heartCount: row.heart_count,
    score: row.score,
  };
}
