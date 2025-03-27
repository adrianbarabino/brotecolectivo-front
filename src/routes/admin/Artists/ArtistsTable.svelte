<script>
    import { onMount } from 'svelte';
    import { MEDIA_URL, API, TOKEN } from '../../../config.js';
    import { navigate } from 'svelte-routing';
    import Header from '../../../components/Header.svelte';
    import { DataHandler, Datatable, Th, ThFilter } from '@vincjo/datatables/remote';
  
    const handler = new DataHandler([], {
      rowsPerPage: 10,
      i18n: {
        search: 'Buscar...',
        show: 'Mostrar',
        entries: 'bandas',
        filter: 'Filtrar',
        rowCount: 'Bandas {start} a {end} de {total}',
        noRows: 'No hay resultados',
        previous: 'Anterior',
        next: 'Siguiente'
      }
    });
  
    let rows = handler.getRows();
    let isLoading = true;
    let bands = [];
  
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
  
      const res = await fetch(`${API}/bands/table?${query.toString()}`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      bands = await res.json();

      // extract the social {"facebook":"dol.amroth.3","instagram":"","sitioweb":"http://dolamrothhardrock.blogspot.com.ar/","soundcloud":"SoundCloud","spotify":"","twitter":"Twitter","youtube":""}	
      // just show the social name who are filled and are not the same as the social name
        bands = bands.map(band => {
            band.social = Object.entries(band.social)
            .filter(([key, value]) => value && value.toLowerCase()  !== key.toLowerCase() )
            .map(([key, value]) => key)
            .join(', ');
            return band;
        });
        
      handler.setRows(bands);
      isLoading = false;
    }
  
    onMount(() => {
      handler.onChange(fetchRemote);
      handler.invalidate();
    });
  
    function editBand(id) {
      navigate(`/admin/artists/edit/${id}`);
    }
  
    function viewBand(id) {
      navigate(`/artists/${id}`);
    }
  
    function deleteBand(id) {
      if (confirm('¿Estás seguro de que querés eliminar esta banda?')) {
        fetch(`${API}/bands/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${TOKEN}` }
        }).then(() => {
          bands = bands.filter(b => b.id !== id);
          handler.setRows(bands);
          alert('Banda eliminada');
        });
      }
    }
  
    let breadcrumbs = [
      { name: 'Home', href: '/' },
      { name: 'Admin', href: '/admin' },
      { name: 'Bandas', href: '/admin/bands' }
    ];
  </script>
  
  <Header title="Administrar Bandas" breadcrumbs={breadcrumbs} />

    <div class="container mt-4 d-grid gap-2">
        <a href="/admin/artists/add" class="btn btn-primary">Agregar Banda</a>
    </div>
  <div class="container mt-4">
    {#if isLoading}
      <p>Cargando bandas...</p>
    {:else}
      <Datatable {handler}>
        <table class="table table-bordered table-hover">
          <thead>
            <tr>
              <Th {handler} orderBy="id">ID</Th>
              <Th {handler} orderBy="slug">Imagen</Th>

              <Th {handler} orderBy="name">Nombre</Th>
              <Th {handler} orderBy="social">Social</Th>
              <Th {handler}>Acciones</Th>
            </tr>
            <tr class="filters">
              <ThFilter {handler} filterBy="id" />
              <th></th>
              <ThFilter {handler} filterBy="name" />
              <ThFilter {handler} filterBy="social" />

              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each bands as row (row.id)}
              <tr>
                <td width="50">{row.id}</td>
                <td><img src="{MEDIA_URL}bands/{row.slug}.jpg" width="100"/>  </td>
                <td>{row.name}</td>
                <td>{row.social}</td>
                
                <td>
                  <button class="btn btn-sm btn-info me-1" on:click={() => viewBand(row.id)}>👁️</button>
                  <button class="btn btn-sm btn-warning me-1" on:click={() => editBand(row.id)}>✏️</button>
                  <button class="btn btn-sm btn-danger" on:click={() => deleteBand(row.id)}>🗑️</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </Datatable>
    {/if}
  </div>
  