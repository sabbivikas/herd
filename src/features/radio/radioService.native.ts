import TrackPlayer, { Capability, State } from 'react-native-track-player';

import { env } from '../../config/env';
import { claimAudio, onAudioOwnerChange } from './audioArbiter';

let ready = false;

// Week-1 spike: background playback + lock-screen controls.
// iOS uses the audio background mode (app.json) + control center; Android
// uses the foreground service + media notification from the playback
// service registered in index.ts.
export async function setupRadio(): Promise<void> {
  if (ready) return;
  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
    compactCapabilities: [Capability.Play, Capability.Pause],
  });
  onAudioOwnerChange((owner) => {
    if (owner === 'feed') void TrackPlayer.pause();
  });
  ready = true;
}

export async function playRadio(): Promise<void> {
  await setupRadio();
  claimAudio('radio');
  await TrackPlayer.reset();
  await TrackPlayer.add({
    id: 'herd-radio',
    // Test stream covers the spike; real stream credentials come from Mario (week 6).
    url: env.radioStreamUrl || 'https://stream.radioparadise.com/aac-320',
    title: 'Herd Radio',
    artist: 'Live',
  });
  await TrackPlayer.play();
}

export async function pauseRadio(): Promise<void> {
  if (!ready) return;
  await TrackPlayer.pause();
}

export async function isRadioPlaying(): Promise<boolean> {
  if (!ready) return false;
  const playback = await TrackPlayer.getPlaybackState();
  return playback.state === State.Playing;
}
