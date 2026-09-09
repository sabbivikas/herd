import { useCallback, useEffect, useRef, useState } from 'react';

import { getSupabase } from '../../lib/supabase';
import { cancelPrefetches, prefetchOpeningSegments } from './prefetch';
import { MOCK_FEED } from './mockFeed';
import { mapFeedRow, type FeedPageRow, type FeedVideo } from './types';

const PAGE_SIZE = 6;

// Cursor-paginated feed over the feed_page RPC. Falls back to demo content
// until the staging backend is connected, and never leaves the feed empty
// on a network error - a blank feed is the worst state this app can show.
export function useFeedPager() {
  const supabase = getSupabase();
  const [videos, setVideos] = useState<FeedVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [ended, setEnded] = useState(false);
  const cursorRef = useRef<{ score: number; id: string } | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || ended) return;
    setLoading(true);
    try {
      if (!supabase) {
        setVideos((current) => (current.length > 0 ? current : MOCK_FEED));
        setEnded(true);
        return;
      }
      const { data, error } = await supabase.rpc('feed_page', {
        cursor_score: cursorRef.current?.score ?? null,
        cursor_id: cursorRef.current?.id ?? null,
        page_limit: PAGE_SIZE,
      });
      if (error) throw error;
      const rows = (data ?? []) as FeedPageRow[];
      setVideos((current) => [...current, ...rows.map(mapFeedRow)]);
      if (rows.length < PAGE_SIZE) setEnded(true);
      const last = rows[rows.length - 1];
      if (last) cursorRef.current = { score: last.score, id: last.id };
    } catch {
      // Backend hiccup: keep what we have; show demo data rather than nothing.
      setVideos((current) => (current.length > 0 ? current : MOCK_FEED));
      setEnded(true);
    } finally {
      setLoading(false);
    }
  }, [supabase, loading, ended]);

  useEffect(() => {
    void loadMore();
    return () => cancelPrefetches();
    // first page only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Warms the next two videos' opening segments. A fast scroll cancels
  // everything in flight - we do not pay to deliver video nobody watches.
  const prefetchAround = useCallback(
    (index: number, fastScrolling: boolean) => {
      if (fastScrolling) {
        cancelPrefetches();
        return;
      }
      prefetchOpeningSegments(
        videos.slice(index + 1, index + 3).map((v) => ({ id: v.id, playbackUrl: v.playbackUrl })),
      );
    },
    [videos],
  );

  return { videos, loading, ended, loadMore, prefetchAround };
}
