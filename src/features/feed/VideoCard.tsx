import React, { useCallback, useRef, useState } from 'react';
import { Animated, Pressable, Share, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../theme';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../state/AuthContext';
import { VideoPlayer } from './players/VideoPlayer';
import { FeedOverlay } from './FeedOverlay';
import { RightRail } from './RightRail';
import type { FeedVideo } from './types';

const DOUBLE_TAP_MS = 280;

type Props = {
  video: FeedVideo;
  active: boolean;
  onOpenOptions: (video: FeedVideo) => void;
};

export function VideoCard({ video, active, onOpenOptions }: Props) {
  const { session } = useAuth();
  const [hearted, setHearted] = useState(false);
  const [heartDelta, setHeartDelta] = useState(0);
  const lastTap = useRef(0);
  const pop = useRef(new Animated.Value(0)).current;

  // Optimistic heart. The heart-toggle edge function (week 4) owns rate
  // limits and reconciliation; this writes through when the backend is live
  // and rolls back on failure.
  const toggleHeart = useCallback(
    (forceOn = false) => {
      const next = forceOn || !hearted;
      if (next === hearted) return;
      setHearted(next);
      setHeartDelta((d) => d + (next ? 1 : -1));
      const supabase = getSupabase();
      if (supabase && session) {
        const write = next
          ? supabase.from('hearts').insert({ user_id: session.userId, video_id: video.id })
          : supabase
              .from('hearts')
              .delete()
              .eq('user_id', session.userId)
              .eq('video_id', video.id);
        void write.then(({ error }) => {
          if (error) {
            setHearted(!next);
            setHeartDelta((d) => d + (next ? -1 : 1));
          }
        });
      }
    },
    [hearted, session, video.id],
  );

  const burstHeart = useCallback(() => {
    pop.setValue(0);
    Animated.sequence([
      Animated.timing(pop, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(pop, { toValue: 0, duration: 320, delay: 240, useNativeDriver: true }),
    ]).start();
    toggleHeart(true);
  }, [pop, toggleHeart]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      burstHeart();
    } else {
      lastTap.current = now;
    }
  }, [burstHeart]);

  const share = useCallback(() => {
    void Share.share({
      message: `${video.title} - ${video.artistName} on Herd`,
      url: video.playbackUrl,
    }).catch(() => {});
  }, [video]);

  return (
    <View style={styles.card}>
      <VideoPlayer
        videoId={video.id}
        playbackUrl={video.playbackUrl}
        thumbnailUrl={video.thumbnailUrl}
        active={active}
      />
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleTap}
        onLongPress={() => onOpenOptions(video)}
        delayLongPress={350}
        accessibilityLabel={`Video ${video.title} by ${video.artistName}`}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.burst,
          {
            opacity: pop,
            transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.4] }) }],
          },
        ]}
      >
        <Ionicons name="heart" size={96} color={colors.accent} />
      </Animated.View>
      <FeedOverlay video={video} />
      <RightRail
        hearted={hearted}
        heartCount={video.heartCount + heartDelta}
        onHeart={() => toggleHeart()}
        onShare={share}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: '#000' },
  burst: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
