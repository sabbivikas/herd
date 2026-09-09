import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View, type ViewToken } from 'react-native';

import { colors } from '../../theme';
import { useFeedPager } from '../../features/feed/useFeedPager';
import { VideoCard } from '../../features/feed/VideoCard';
import { OptionsSheet } from '../../features/feed/OptionsSheet';
import { claimAudio, onAudioOwnerChange } from '../../features/radio/audioArbiter';
import type { FeedVideo } from '../../features/feed/types';

// The feed is the product. One full-screen video per viewport, snap scroll,
// autoplay on focus, pause on blur, lookahead preload of the next two.
export function FeedScreen() {
  const { height } = useWindowDimensions();
  const pager = useFeedPager();
  const [activeIndex, setActiveIndex] = useState(0);
  const [optionsFor, setOptionsFor] = useState<FeedVideo | null>(null);
  const [radioOwnsAudio, setRadioOwnsAudio] = useState(false);

  const fastScrolling = useRef(false);
  const lastScroll = useRef({ y: 0, t: 0 });

  // One audio owner at a time: a playing feed video pauses the radio,
  // and starting the radio pauses the feed.
  useEffect(() => {
    claimAudio('feed');
    return onAudioOwnerChange((owner) => setRadioOwnsAudio(owner === 'radio'));
  }, []);

  const prefetchRef = useRef(pager.prefetchAround);
  useEffect(() => {
    prefetchRef.current = pager.prefetchAround;
  }, [pager.prefetchAround]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const index = viewableItems[0]?.index;
      if (index != null) {
        setActiveIndex(index);
        prefetchRef.current(index, fastScrolling.current);
      }
    },
  ).current;

  const onScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const y = event.nativeEvent.contentOffset.y;
      const now = Date.now();
      const { y: lastY, t: lastT } = lastScroll.current;
      if (lastT > 0) {
        const screensPerMs = Math.abs(y - lastY) / Math.max(now - lastT, 1) / height;
        fastScrolling.current = screensPerMs > 0.0015; // ~1.5 screens/sec
      }
      lastScroll.current = { y, t: now };
    },
    [height],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: FeedVideo; index: number }) => (
      <View style={{ height }}>
        <VideoCard
          video={item}
          active={index === activeIndex && !radioOwnsAudio}
          onOpenOptions={setOptionsFor}
        />
      </View>
    ),
    [height, activeIndex, radioOwnsAudio],
  );

  return (
    <View style={styles.wrap}>
      <FlatList
        data={pager.videos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={32}
        onEndReached={pager.loadMore}
        onEndReachedThreshold={2}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        // A54 memory guardrails: never more than a 3-video window alive.
        windowSize={3}
        maxToRenderPerBatch={2}
        initialNumToRender={1}
        removeClippedSubviews
      />
      <OptionsSheet video={optionsFor} onClose={() => setOptionsFor(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
});
