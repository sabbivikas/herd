// One audio owner at a time, per the architecture doc: starting radio stops
// feed audio, and playing a feed video pauses radio. Phone-call and
// headphone interruptions are handled by the players themselves (tested in
// week 6 on both platforms).

export type AudioOwner = 'feed' | 'radio' | null;

type Listener = (owner: AudioOwner) => void;

let owner: AudioOwner = null;
const listeners = new Set<Listener>();

export function getAudioOwner(): AudioOwner {
  return owner;
}

export function claimAudio(who: 'feed' | 'radio'): void {
  if (owner === who) return;
  owner = who;
  for (const listener of Array.from(listeners)) listener(owner);
}

export function releaseAudio(who: 'feed' | 'radio'): void {
  if (owner === who) owner = null;
}

export function onAudioOwnerChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
