// Feed lookahead. Only the manifest and first variant playlist of the next
// videos get warmed - never whole segments - so a fast scroll past a video
// costs almost nothing. Everything here is cancellable and best-effort.
//
// Segment-level preload through the player's buffer lands with the M3 perf
// harness (week 3); this module is the cheap half of the guardrail.

const inflight = new Map<string, AbortController>();

export function prefetchOpeningSegments(
  videos: ReadonlyArray<{ id: string; playbackUrl: string }>,
): void {
  for (const video of videos) {
    if (inflight.has(video.id)) continue;
    const controller = new AbortController();
    inflight.set(video.id, controller);
    fetch(video.playbackUrl, { signal: controller.signal })
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then(async (manifest) => {
        const variant = manifest
          .split('\n')
          .map((line) => line.trim())
          .find((line) => line.length > 0 && !line.startsWith('#'));
        if (!variant) return;
        const variantUrl = new URL(variant, video.playbackUrl).toString();
        const res = await fetch(variantUrl, { signal: controller.signal });
        await res.arrayBuffer();
      })
      .catch(() => {
        // aborted or network hiccup - prefetch is opportunistic, ignore
      })
      .finally(() => {
        inflight.delete(video.id);
      });
  }
}

export function cancelPrefetches(exceptIds: ReadonlyArray<string> = []): void {
  for (const [id, controller] of Array.from(inflight.entries())) {
    if (!exceptIds.includes(id)) {
      controller.abort();
      inflight.delete(id);
    }
  }
}
