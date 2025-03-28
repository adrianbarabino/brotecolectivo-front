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
        entries: 'usuarios',
        filter: 'Filtrar',
        rowCount: 'Usuarios {start} a {end} de {total}',
        noRows: 'No hay resultados',
        previous: 'Anterior',
        next: 'Siguiente'
      }
    });
  
    let rows = handler.getRows();
    let isLoading = true;
    let users = [];
  
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
  
      const res = await fetch(`${API}/users/table?${query.toString()}`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      users = await res.json();
  
      handler.setRows(users);
  
      const countRes = await fetch(`${API}/users/count?${query.toString()}`, {
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
  
    function editUser(id) {
      navigate(`/admin/users/edit/${id}`);
    }
  
    function deleteUser(id) {
      if (confirm('¿Estás seguro de que querés eliminar este usuario?')) {
        fetch(`${API}/users/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${TOKEN}` }
        }).then(() => {
          users = users.filter(u => u.id !== id);
          handler.setRows(users);
          alert('Usuario eliminado');
        });
      }
    }
  
    let breadcrumbs = [
      { name: 'Home', href: '/' },
      { name: 'Admin', href: '/admin' },
      { name: 'Usuarios', href: '/admin/users' }
    ];
  </script>
  
  <Header title="Administrar Usuarios" {breadcrumbs} />
  
  <div class="container mt-4 d-grid gap-2">
    <a href="/admin/users/add" class="btn btn-primary">Agregar Usuario</a>
  </div>
  
  <div class="container mt-4">
    {#if isLoading}
      <p>Cargando usuarios...</p>
    {:else}
      <Datatable {handler}>
        <table class="table table-bordered table-hover">
          <thead>
            <tr>
              <Th {handler} orderBy="id">ID</Th>
              <Th {handler} orderBy="username">Usuario</Th>
              <Th {handler} orderBy="email">Email</Th>
              <Th {handler} orderBy="role">Rol</Th>
              <Th {handler}>Acciones</Th>
            </tr>
            <tr class="filters">
              <ThFilter {handler} filterBy="id" />
              <ThFilter {handler} filterBy="username" />
              <ThFilter {handler} filterBy="email" />
              <ThFilter {handler} filterBy="role" />
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each users as user (user.id)}
              <tr>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button class="btn btn-sm btn-warning me-1" on:click={() => editUser(user.id)}>✏️</button>
                  <button class="btn btn-sm btn-danger" on:click={() => deleteUser(user.id)}>🗑️</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </Datatable>
    {/if}
  </div>
  