<script>
    export let news;
  </script>
  
  <style>
    .card {
      background-color: #1e1e1e;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
      margin-bottom: 1.5rem;
      color: #e0e0e0;
    }
  
    .title {
      font-size: 1.4rem;
      font-weight: bold;
      color: #90caf9;
      margin-bottom: 0.5rem;
    }
  
    .content {
      margin-bottom: 1rem;
    }
  
    .bands {
      font-size: 0.9rem;
      color: #aaa;
      margin-bottom: 1rem;
    }
  
    button {
      background-color: #3f51b5;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
    }
  
    button:hover {
      background-color: #5c6bc0;
    }
  </style>
  
  <div class="card">
    <div class="title">{news.title}</div>
    <div class="content">{news.content.slice(0, 180)}...</div>
    {#if news.bands && news.bands.length > 0}
      <div class="bands">Bandas: {news.bands.map(b => b.name).join(', ')}</div>
    {/if}
    <button>Ir a la noticia</button>
  </div>