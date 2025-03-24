<script>
    export let bands = []
  </script>
  
  {#if bands.length === 0}
    <p>No hay bandas para mostrar.</p>
  {:else}
    <ul>
      {#each bands as band}
        <li>{band.name}</li>
      {/each}
    </ul>
  {/if}
  