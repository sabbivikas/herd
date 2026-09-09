// Web stub. The real radio service (react-native-track-player) lives in
// radioService.native.ts and only loads on iOS/Android.
export async function setupRadio(): Promise<void> {}
export async function playRadio(): Promise<void> {}
export async function pauseRadio(): Promise<void> {}
export async function isRadioPlaying(): Promise<boolean> {
  return false;
}
