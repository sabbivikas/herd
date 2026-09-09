import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  videoId: string;
  playbackUrl: string;
  thumbnailUrl: string | null;
  active: boolean;
};

// Web fallback used for design review and screenshots. The real player is
// react-native-video (see VideoPlayer.native.tsx); browsers handle HLS only
// with a JS player, which is not worth bundling for a dev preview.
export function VideoPlayer({ playbackUrl, thumbnailUrl, active }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) {
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [active]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <video
        ref={ref}
        src={playbackUrl}
        poster={thumbnailUrl ?? undefined}
        loop
        playsInline
        muted
        style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#000' }}
      />
    </View>
  );
}
