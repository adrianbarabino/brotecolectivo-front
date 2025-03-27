
<script>
import { playerStore } from '../stores/playerStore.js';
import { API, TOKEN, MEDIA_URL } from '../config.js';

import { onMount, tick } from 'svelte';
    let isPlaying = false;
    let showPlaylist = false;
    let showLyrics = false;
    let volume = 0.7;
    let showVolumeSlider = false;

    let songs = [];
    let error = '';
    let loading = true;
    let currentSongIndex = 0;
  
  
    let audioElement;
    let coverElement;
    let playButton;
    let progress = 0;
    let duration = 0;
    onMount(async () => {
  try {
    const res = await fetch(`${API}/songs`);
    if (!res.ok) throw new Error('Error al obtener canciones');
    songs = await res.json();
    loading = false;

    await tick();

    if (audioElement) {
      audioElement.volume = volume;

      const saved = localStorage.getItem('brote-player');
      if (saved) {
        const state = JSON.parse(saved);
        currentSongIndex = state.index || 0;
        await loadSong(currentSongIndex);
        audioElement.currentTime = state.time || 0;

        if (state.playing) {
          await playSong();
        }
      } else {
        loadSong(currentSongIndex);
      }
    }

    // 👇 Esto va al final de onMount
    playerStore.set({
      songs,
      currentSongIndex,
      isPlaying,
      loadSong,
      playSong
    });

  } catch (err) {
    error = err.message;
    loading = false;
  }
});

$: playerStore.update(store => ({
  ...store,
  currentSongIndex,
  isPlaying
}));

function handleVolumeClick(e) {
  const bar = e.currentTarget.querySelector('.custom-volume-bar');
  const rect = bar.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const newVolume = clickX / rect.width;
  volume = Math.max(0, Math.min(1, newVolume));
  audioElement.volume = volume;
}


async function loadSong(index) {
  const wasPlaying = isPlaying; // detectamos si estaba sonando antes
  const song = songs[index];
  currentSongIndex = index;

  await tick(); // Esperamos al DOM

  if (!audioElement || !coverElement) {
    console.warn("Elementos no montados aún");
    return;
  }

  audioElement.src = `${MEDIA_URL}songs/${song.id}-${song.band_id}.mp3`;
  coverElement.src = `${MEDIA_URL}bands/${song.band.slug}.jpg`;

  audioElement.load();

  audioElement.oncanplay = () => {
    console.log("Canción lista para reproducir");
    duration = audioElement.duration;
    progress = 0;
    isPlaying = false;

    if (wasPlaying) {
      playSong(); // si estaba sonando antes, vuelve a sonar
    }
  };
}


function playRandomSong() {
  const randomIndex = Math.floor(Math.random() * songs.length);
  currentSongIndex = randomIndex;
  loadSong(randomIndex);
}

  
    async function playSong() {
  try {
    await audioElement.play();
    isPlaying = true;
  } catch (e) {
    console.warn('Error al reproducir:', e);
    isPlaying = false;
  }
}

  
    function pauseSong() {
      audioElement.pause();
      isPlaying = false;

    }
  
    function togglePlay() {
    if (audioElement.paused) {
        playSong();
    } else {
        pauseSong();
    }
    }
    function playNextSong() {
      currentSongIndex = (currentSongIndex + 1) % songs.length;
      loadSong(currentSongIndex);
    }
  
    function playPrevSong() {
      currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
      loadSong(currentSongIndex);
    }
  
    function updateProgress() {
      if (audioElement) {
        localStorage.setItem('brote-player', JSON.stringify({
  index: currentSongIndex,
  time: audioElement.currentTime,
  playing: isPlaying
}));

        progress = audioElement.currentTime;
        duration = audioElement.duration || 0;
      }
    }
  
    function seek(e) {
      const width = e.currentTarget.clientWidth;
      const clickX = e.offsetX;
      const seekTo = (clickX / width) * duration;
      audioElement.currentTime = seekTo;
    }


function formatTime(seconds) {
  const mins = Math.floor(seconds / 60) || 0;
  const secs = Math.floor(seconds % 60) || 0;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function togglePlaylist() {
  showPlaylist = !showPlaylist;
}

function toggleLyrics() {
  showLyrics = !showLyrics;
  // if the current song have lyrics, load them
  // the lyricsData is empty, so we had to fetch from the api endpoint called: /songs/lyrics/:id, the id is from .lyrics (is the id of the lyrics)
  // and the parameter to get is .lyric
    if (showLyrics && !songs[currentSongIndex]?.lyricsData) {
        fetch(`${API}/songs/lyrics/${songs[currentSongIndex].lyrics_id}`)
        .then(res => res.json())
        .then(data => {
            
            songs[currentSongIndex].lyricsData = data.lyric;
        });
    }
}

function changeVolume(e) {
  volume = e.target.value;
  audioElement.volume = volume;
}

  </script>
  
  {#if loading}
    <p>Cargando...</p>
  {:else if error}
    <p>Error: {error}</p>
  {:else}
<div class="player-bar">
  <img bind:this={coverElement} class="cover" alt="Cover" />
  
  <div class="song-info">
    <strong>{songs[currentSongIndex]?.title}</strong><br />
    <span>{songs[currentSongIndex]?.band.name}</span>
    <div class="time">
      {formatTime(progress)} / {formatTime(duration)}
    </div>
  </div>

  <div class="controls">
    <button on:click={playRandomSong}><i class="fas fa-random"></i></button>

    <button on:click={playPrevSong}><i class="fas fa-backward"></i></button>
    <button class="play-center" on:click={togglePlay}>
        <i class={!isPlaying ? 'fas fa-play' : 'fas fa-pause'}></i>
      </button>
      
      <button on:click={playNextSong}><i class="fas fa-forward"></i></button>
      <button on:click={togglePlaylist}><i class="fa-solid fa-list-ul"></i></button>

  </div>

  <div class="timeline" on:click={seek}>
    <div class="progress" style="width: {duration ? (progress / duration) * 100 : 0}%"></div>
  </div>
  <i class="fas fa-volume-up volume-icon"></i>

  <div class="custom-volume-wrapper" on:click={handleVolumeClick}>
    <div class="custom-volume-bar">
      <div class="custom-volume-fill" style="width: {volume * 100}%"></div>
      <div class="custom-volume-thumb" style="left: {volume * 100}%"></div>
    </div>
  </div>

  <div class="controls">

    {#if songs[currentSongIndex]?.lyrics_id}
    <button on:click={toggleLyrics}><i class="fa-solid fa-microphone-lines"></i></button>
    {/if}
  </div>
  <audio
  bind:this={audioElement}
  on:timeupdate={updateProgress}
  on:ended={playNextSong}
  on:play={() => isPlaying = true}
  on:pause={() => isPlaying = false}
/>
</div>

{#if showPlaylist}
  <div class="playlist-floating">
    <ul>
      {#each songs as song, index}
        <li class:selected={index === currentSongIndex} on:click={() => loadSong(index)}>
          {song.title} - {song.band.name}
        </li>
      {/each}
    </ul>
  </div>
{/if}

{#if showLyrics}
  <div class="lyrics-box">
    {#if songs[currentSongIndex]?.lyricsData}
    <div class="lyrics-html"> {@html songs[currentSongIndex]?.lyricsData}</div>

    {/if}
  </div>
{/if}

  {/if}
  
  <style>
    .player-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #111;
      color: white;
      display: flex;
      align-items: center;
      padding: 10px 20px;
      z-index: 1000;
    }
  
    .cover {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
      margin-right: 15px;
    }
  
    .song-info {
      flex: 1;
    }
  
    .controls {
      display: flex;
      gap: 10px;
      align-items: center;
    }
  
    .controls button {
      background: none;
      border: none;
      color: white;
      font-size: 1.4rem;
      cursor: pointer;
    }
  
    .timeline {
      height: 4px;
      background: #444;
      flex: 1;
      margin-left: 15px;
      margin-right: 15px;
      border-radius: 2px;
      cursor: pointer;
      position: relative;
    }
  
    .progress {
      height: 100%;
      background: #1db954;
      border-radius: 2px;
    }
  
    .playlist-floating {
      position: fixed;
      bottom: 70px;
      right: 20px;
      width: 300px;
      max-height: 300px;
      overflow-y: auto;
      background: #222;
      color: white;
      border-radius: 8px;
      box-shadow: 0 0 8px rgba(0,0,0,0.6);
      z-index: 999;
      padding: 10px;
    }
  
    .playlist-floating ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
  
    .playlist-floating li {
      padding: 8px;
      cursor: pointer;
      border-bottom: 1px solid #333;
    }
  
    .playlist-floating li:hover,
    .playlist-floating li.selected {
      background-color: #1db95422;
    }
    .time {
  font-size: 0.8rem;
  color: #aaa;
  margin-top: 4px;
}

.play-center {
  font-size: 1.8rem;
}

.volume-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  width: 100px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.3s ease;
  outline: none;
}

.volume-slider:hover {
  background: rgba(255, 255, 255, 0.4);
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 10px;
  width: 10px;
  background: #1db954;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.3);
  transition: transform 0.2s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.volume-slider::-moz-range-thumb {
  height: 10px;
  width: 10px;
  background: #1db954;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.3);
  transition: transform 0.2s ease;
}

.volume-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
}

.lyrics-box {
  position: fixed;
  bottom: 80px;
  left: 20px;
  right: 20px;
  background: #111;
  color: white;
  border: 1px solid #444;
  padding: 15px;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
}

/* Responsive tweaks */
@media (max-width: 600px) {
  .player-bar {
    flex-direction: column;
    align-items: stretch;
    padding: 10px;
  }

  .controls {
    justify-content: center;
    margin: 10px 0;
  }

  .volume-slider {
    width: 100%;
    margin: 10px 0;
  }

  .timeline {
    margin: 10px 0;
  }

  .song-info {
    text-align: center;
    margin-bottom: 10px;
  }
}
.volume-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: #888;
  border-radius: 2px;
  width: 100px;
  cursor: pointer;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 12px;
  width: 12px;
  background: #1db954;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.volume-slider::-moz-range-thumb {
  height: 12px;
  width: 12px;
  background: #1db954;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}
.custom-volume-wrapper {
  width: 100px;
  height: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 10px;
}

.custom-volume-bar {
  width: 100%;
  height: 4px;
  background: #555;
  border-radius: 2px;
  position: relative;
}

.custom-volume-fill {
  height: 100%;
  background-color: #1db954;
  border-radius: 2px 0 0 2px;
  pointer-events: none;
}

.custom-volume-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background-color: #1db954;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.3);
  pointer-events: none;
}

  </style>
  