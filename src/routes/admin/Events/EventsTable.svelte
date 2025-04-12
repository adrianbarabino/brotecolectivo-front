<script>
    import { onMount } from 'svelte';
    import { MEDIA_URL, API, TOKEN } from '../../../config.js';
    import { navigate } from 'svelte-routing';
    import Header from '../../../components/Header.svelte';
    import { DataHandler, Datatable, Th, ThFilter } from '@vincjo/datatables/remote';
    import Swal from 'sweetalert2';
  
    const handler = new DataHandler([], {
      rowsPerPage: 10,
      i18n: {
        search: 'Buscar...',
        show: 'Mostrar',
        entries: 'eventos',
        filter: 'Filtrar',
        rowCount: 'Eventos {start} a {end} de {total}',
        noRows: 'No hay resultados',
        previous: 'Anterior',
        next: 'Siguiente'
      }
    });
  
    let rows = handler.getRows();
    let isLoading = true;
    let events = [];
  
    async function fetchRemote(state) {
      const query = new URLSearchParams();
      query.set('offset', state.offset);
      query.set('limit', state.rowsPerPage);
  
      if (state.search) query.set('q', state.search);
      if (state.sort?.orderBy) {
        query.set('sort', state.sort.orderBy);
        query.set('order', state.sort.direction);
      }
      state.filters?.forEach(f => {
        if (f.value) query.set(f.column, f.value);
      });
  
      // Fetch datos paginados
      const res = await fetch(`${API}/events/table?${query.toString()}`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      events = await res.json();
  
      // Mostrar bandas como texto
      events = events.map(event => {
        event.bands = event.bands?.map(b => b.name).join(', ') || '';
        return event;
      });
  
      // Set rows
      handler.setRows(events);
  
      // Fetch total (count con filtros)
      const countRes = await fetch(`${API}/events/count?${query.toString()}`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      const countData = await countRes.json();
      handler.setTotalRows(countData.count);
  
      isLoading = false;
    }
  
    onMount(() => {
      handler.onChange(fetchRemote);
      handler.invalidate();
    });
  
    function editEvent(id) {
      navigate(`/admin/events/edit/${id}`);
    }
  
    function viewEvent(id) {
      navigate(`/eventos/${id}`);
    }
  
    function deleteEvent(id) {
      if (confirm('¿Estás seguro de que querés eliminar este evento?')) {
        fetch(`${API}/events/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${TOKEN}` }
        }).then(() => {
          events = events.filter(e => e.id !== id);
          handler.setRows(events);
          alert('Evento eliminado');
        });
      }
    }

    // Función para publicar en Instagram
    async function publishToInstagram(id) {
      try {
        // Confirmar antes de publicar
        const result = await Swal.fire({
          title: '¿Publicar en Instagram?',
          text: 'Se publicará este evento en Instagram (feed y stories)',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, publicar',
          cancelButtonText: 'Cancelar'
        });
        
        if (!result.isConfirmed) {
          return;
        }
        
        // Mostrar indicador de carga
        Swal.fire({
          title: 'Publicando...',
          text: 'Enviando a Instagram, por favor espera...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        // Llamar al endpoint para publicar en Instagram
        const res = await fetch(`${API}/events/${id}/publish-instagram`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
          }
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Error ${res.status}: ${errorText}`);
        }
        
        const data = await res.json();
        
        // Mostrar resultado
        if (data.success) {
          Swal.fire({
            title: '¡Publicado!',
            html: `
              <p>El evento ha sido publicado en Instagram.</p>
              ${data.feed.success ? '<p>✅ Feed: Publicado correctamente</p>' : '<p>❌ Feed: Error - ' + data.feed.message + '</p>'}
              ${data.story.success ? '<p>✅ Story: Publicada correctamente</p>' : '<p>❌ Story: Error - ' + data.story.message + '</p>'}
            `,
            icon: 'success'
          });
        } else {
          Swal.fire({
            title: 'Publicación parcial',
            html: `
              <p>Hubo problemas al publicar en Instagram:</p>
              ${data.feed.success ? '<p>✅ Feed: Publicado correctamente</p>' : '<p>❌ Feed: Error - ' + data.feed.message + '</p>'}
              ${data.story.success ? '<p>✅ Story: Publicada correctamente</p>' : '<p>❌ Story: Error - ' + data.story.message + '</p>'}
            `,
            icon: 'warning'
          });
        }
      } catch (error) {
        console.error("Error al publicar en Instagram:", error);
        Swal.fire({
          title: 'Error',
          text: error.message || 'No se pudo publicar en Instagram',
          icon: 'error'
        });
      }
    }
  
    let breadcrumbs = [
      { name: 'Home', href: '/' },
      { name: 'Admin', href: '/admin' },
      { name: 'Eventos', href: '/admin/events' }
    ];
  </script>
  
  <Header title="Administrar Eventos" {breadcrumbs} />
  
  <div class="container mt-4 d-grid gap-2">
    <a href="/admin/events/add" class="btn btn-primary">Agregar Evento</a>
  </div>
  
  <div class="container mt-4">
    {#if isLoading}
      <p>Cargando eventos...</p>
    {:else}
      <Datatable {handler}>
        <table class="table table-bordered table-hover">
          <thead>
            <tr>
              <Th {handler} orderBy="id">ID</Th>
              <Th {handler}>Flyer</Th>
              <Th {handler} orderBy="title">Título</Th>
              <Th {handler} orderBy="date_start">Fecha</Th>
              <Th {handler}>Lugar</Th>
              <Th {handler}>Bandas</Th>
              <Th {handler}>Acciones</Th>
            </tr>
            <tr class="filters">
              <ThFilter {handler} filterBy="id" />
              <th></th>
              <ThFilter {handler} filterBy="title" />
              <ThFilter {handler} filterBy="date_start" />
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each events as row (row.id)}
              <tr>
                <td>{row.id}</td>
                <td><img src="{MEDIA_URL}events/{row.slug}.jpg" width="100" alt="Flyer" /></td>
                <td>{row.title}</td>
                <td>{row.date_start}</td>
                <td>{row.venue?.name}</td>
                <td>{row.bands}</td>
                <td>
                  <button class="btn btn-sm btn-info me-1" on:click={() => viewEvent(row.id)}>👁️</button>
                  <button class="btn btn-sm btn-warning me-1" on:click={() => editEvent(row.id)}>✏️</button>
                  <button class="btn btn-sm btn-danger me-1" on:click={() => deleteEvent(row.id)}>🗑️</button>
                  <button class="btn btn-sm btn-primary" on:click={() => publishToInstagram(row.id)}>
                    <i class="bi bi-instagram"></i>
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </Datatable>
    {/if}
  </div>