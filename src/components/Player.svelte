<script>
    import { onMount, tick } from 'svelte';

    let songs = [];
    let error = '';
    let loading = true;
    let mediaUrl = 'https://brotecolectivo.sfo3.cdn.digitaloceanspaces.com/';
    let currentSongIndex = 0;
  
    const API = 'http://www.adrianbarabino.com:3055';
  
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
        loadSong(currentSongIndex);
      } catch (err) {
        error = err.message;
      } finally {
        loading = false;
      }
    });
  
    async function loadSong(index) {
      const song = songs[index];
      audioElement.src = `${mediaUrl}songs/${song.id}-${song.band_id}.mp3`;
      coverElement.src = `${mediaUrl}bands/${song.band.slug}.jpg`;
      currentSongIndex = index;
      await tick(); // Esperamos a que el audioElement esté montado

      audioElement.load();
      playSong();
    }
  
    function playSong() {
      audioElement.play();
    }
  
    function pauseSong() {
      audioElement.pause();
    }
  
    function togglePlay() {
      if (audioElement.paused) playSong();
      else pauseSong();
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
      </div>
  
      <div class="controls">
        <button on:click={playPrevSong}>⏮</button>
        <button bind:this={playButton} on:click={togglePlay}>
          {audioElement?.paused ? '▶️' : '⏸'}
        </button>
        <button on:click={playNextSong}>⏭</button>
      </div>
  
      <div class="timeline" on:click={seek}>
        <div class="progress" style="width: {duration ? (progress / duration) * 100 : 0}%"></div>
      </div>
  
      <audio
        bind:this={audioElement}
        on:timeupdate={updateProgress}
        on:ended={playNextSong}
      />
    </div>
  
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
  </style>
  