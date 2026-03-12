import bunsoundUrl from '../imgs/bunsound.mp3?url';
import musicUrl from '../imgs/music.mp3?url';

let audio: HTMLAudioElement | null = null;
let bgMusic: HTMLAudioElement | null = null;

export function playBunSound(): void {
  try {
    if (!audio) {
      audio = new Audio(bunsoundUrl);
    }
    audio.currentTime = 0.35;
    audio.play().catch(() => {});
  } catch {
    // ignore
  }
}

export function getBgMusic(): HTMLAudioElement {
  if (!bgMusic) {
    bgMusic = new Audio(musicUrl);
    bgMusic.loop = true;
  }
  return bgMusic;
}

export function stopBgMusic(): void {
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
}
