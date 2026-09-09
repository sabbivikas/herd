import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import Video from 'react-native-video';

import { markFirstFrame } from '../perfLog';

type Props = {
  videoId: string;
  playbackUrl: string;
  thumbnailUrl: string | null;
  active: boolean;
};

// react-native-video over standard HLS. The buffer config is the A54
// guardrail: small buffers buy fast first frames on low-end devices and
// keep memory flat across a long scroll.
export function VideoPlayer({ videoId, playbackUrl, thumbnailUrl, active }: Props) {
  const loadStartedAt = useRef<number>(Date.now());

  return (
    <Video
      source={{ uri: playbackUrl }}
      style={StyleSheet.absoluteFill}
      resizeMode="cover"
      repeat
      paused={!active}
      poster={thumbnailUrl ?? undefined}
      posterResizeMode="cover"
      bufferConfig={{
        minBufferMs: 1500,
        maxBufferMs: 5000,
        bufferForPlaybackMs: 500,
        bufferForPlaybackAfterRebufferMs: 1000,
      }}
      onLoadStart={() => {
        loadStartedAt.current = Date.now();
      }}
      onReadyForDisplay={() => markFirstFrame(videoId, loadStartedAt.current)}
    />
  );
}
