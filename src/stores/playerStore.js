import { writable } from 'svelte/store';

export const playerStore = writable({
  songs: [],
  currentSongIndex: 0,
  isPlaying: false,
  loadSong: () => {},
  playSong: () => {},
});
