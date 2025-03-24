<script>
    export let event;
  </script>
  
  <style>
    .event-card {
      background-color: #222;
      color: #fff;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  
    .title {
      font-size: 1.3rem;
      font-weight: bold;
    }
  
    .dates, .venue {
      font-size: 0.95rem;
      color: #ccc;
    }
  
    .bands {
      margin-top: 0.5rem;
      font-size: 0.9rem;
    }
  
    .see-more {
      margin-top: 1rem;
      align-self: flex-start;
      background: #fff;
      color: #000;
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      text-decoration: none;
    }
  </style>
  
  <div class="event-card">
    <div class="title">{event.title}</div>
    <div class="dates">🗓 {event.date_start} → {event.date_end}</div>
    <div class="venue">📍 {event.venue?.name}</div>
  
    {#if event.bands && event.bands.length}
      <div class="bands">
        👥 <strong>Bandas:</strong>
        <ul>
          {#each event.bands as band}
            <li>{band.name}</li>
          {/each}
        </ul>
      </div>
    {/if}
  
    <a class="see-more">Ver más</a>
  </div>
  