// Week-1 instrumentation hooks for the M3 gate (<400ms first frame on a
// Galaxy A54). The Flashlight harness (week 3) owns the formal numbers;
// these samples make the timing visible from day one.

type PerfSample = { videoId: string; firstFrameMs: number; at: number };

const samples: PerfSample[] = [];

export function markFirstFrame(videoId: string, loadStartedAt: number): number {
  const firstFrameMs = Date.now() - loadStartedAt;
  samples.push({ videoId, firstFrameMs, at: Date.now() });
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[feed-perf] first frame ${firstFrameMs}ms video=${videoId}`);
  }
  return firstFrameMs;
}

export function getPerfSamples(): readonly PerfSample[] {
  return samples;
}
