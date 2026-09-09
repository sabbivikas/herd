import { Platform } from 'react-native';
import { registerRootComponent } from 'expo';

import App from './src/App';

// react-native-track-player has no web support; register the playback
// service on native only so the web bundle (dev screenshots) stays clean.
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const TrackPlayer = require('react-native-track-player').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { playbackService } = require('./src/features/radio/playbackService');
  TrackPlayer.registerPlaybackService(() => playbackService);
}

registerRootComponent(App);
