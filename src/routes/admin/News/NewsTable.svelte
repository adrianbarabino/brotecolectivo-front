<script>
    import { onMount } from 'svelte';
    import { API, TOKEN } from '../../../config.js';
    import { navigate } from 'svelte-routing';
    import Header from '../../../components/Header.svelte';
    import { DataHandler, Datatable, Th, ThFilter } from '@vincjo/datatables/remote';
  
    const handler = new DataHandler([], {
      rowsPerPage: 10,
      i18n: {
        search: 'Buscar...',
        show: 'Mostrar',
        entries: 'noticias',
        filter: 'Filtrar',
        rowCount: 'Noticias {start} a {end} de {total}',
        noRows: 'No hay resultados',
        previous: 'Anterior',
        next: 'Siguiente'
      }
    });
  
    let rows = handler.getRows();
    let isLoading = true;
    let news = [];
  
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
  
      const res = await fetch(`${API}/news/table?${query.toString()}`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      news = await res.json();
  
      handler.setRows(news);
  
      const countRes = await fetch(`${API}/news/count?${query.toString()}`, {
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
  
    function editNews(id) {
      navigate(`/admin/news/edit/${id}`);
    }
  
    function viewNews(id) {
      navigate(`/noticias/${id}`);
    }
  
    function deleteNews(id) {
      if (confirm('¿Estás seguro de que querés eliminar esta noticia?')) {
        fetch(`${API}/news/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${TOKEN}` }
        }).then(() => {
          news = news.filter(n => n.id !== id);
          handler.setRows(news);
          alert('Noticia eliminada');
        });
      }
    }
  
    let breadcrumbs = [
      { name: 'Home', href: '/' },
      { name: 'Admin', href: '/admin' },
      { name: 'Noticias', href: '/admin/news' }
    ];
  </script>
  
  <Header title="Administrar Noticias" {breadcrumbs} />
  
  <div class="container mt-4 d-grid gap-2">
    <a href="/admin/news/add" class="btn btn-primary">Agregar Noticia</a>
  </div>
  
  <div class="container mt-4">
    {#if isLoading}
      <p>Cargando noticias...</p>
    {:else}
      <Datatable {handler}>
        <table class="table table-bordered table-hover">
          <thead>
            <tr>
              <Th {handler} orderBy="id">ID</Th>
              <Th {handler} orderBy="date">Fecha</Th>
              <Th {handler} orderBy="title">Título</Th>
              <Th {handler}>Acciones</Th>
            </tr>
            <tr class="filters">
              <ThFilter {handler} filterBy="id" />
              <ThFilter {handler} filterBy="date" />
              <ThFilter {handler} filterBy="title" />
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each news as row (row.id)}
              <tr>
                <td>{row.id}</td>
                <td>{row.date}</td>
                <td>{row.title}</td>
                <td>
                  <button class="btn btn-sm btn-info me-1" on:click={() => viewNews(row.id)}>👁️</button>
                  <button class="btn btn-sm btn-warning me-1" on:click={() => editNews(row.id)}>✏️</button>
                  <button class="btn btn-sm btn-danger" on:click={() => deleteNews(row.id)}>🗑️</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </Datatable>
    {/if}
  </div>
  