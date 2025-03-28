<script>
    import { onMount } from 'svelte';
    import { API, TOKEN, MEDIA_URL} from '../../../config.js';
    import Header from '../../../components/Header.svelte';
    import { DataHandler, Datatable, Th, ThFilter } from '@vincjo/datatables/remote';
    import Swal from 'sweetalert2';
  
    const handler = new DataHandler([], {
      rowsPerPage: 10,
      i18n: {
        search: 'Buscar...',
        show: 'Mostrar',
        entries: 'envíos',
        filter: 'Filtrar',
        rowCount: 'Submissions {start} a {end} de {total}',
        noRows: 'No hay resultados',
        previous: 'Anterior',
        next: 'Siguiente'
      }
    });
  
    let submissions = [];
    let isLoading = true;
  
    async function fetchRemote(state) {
      const query = new URLSearchParams();
      query.set('offset', state.offset);
      query.set('limit', state.rowsPerPage);
      if (state.search) query.set('q', state.search);
  
      const res = await fetch(`${API}/submissions?${query.toString()}`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
  
      submissions = await res.json();
  
      // parsear el campo "data" para mostrar "name" si es tipo banda
      submissions = submissions.map(sub => {
        try {
          const parsedData = JSON.parse(sub.data);
          sub.displayName = parsedData.name || '[Sin nombre]';
        } catch (e) {
          sub.displayName = '[Error al leer datos]';
        }
        return sub;
      });

      // si el sub.type es band el sub.slug es artists
        submissions = submissions.map(sub => {
            if (sub.type === 'band') {
            sub.slug = 'artists';
            } else if (sub.type === 'event') {
            sub.slug = 'events';
            } else if (sub.type === 'merch') {
            sub.slug = 'merch';
            } else if (sub.type === 'video') {
            sub.slug = 'videos';
            } else if (sub.type === 'photo') {
            sub.slug = 'photos';
            } else if (sub.type === 'news') {
            sub.slug = 'news';
            } else if (sub.type === 'other') {
            sub.slug = 'other';
            }
            return sub;
        });
      // printear los datos de .data que vienen en un object
      submissions = submissions.map(sub => {
        // si existe data.name lo guardo en .name y si existe title lo guardo en .name
        if (sub.data && typeof sub.data === 'object') {
          if (sub.data.name) {
            sub.name = sub.data.name;
          } else if (sub.data.title) {
            sub.name = sub.data.title;
          } else {
            sub.name = '[Sin nombre]';
          }
              // ACA LE AGREGÁS ESTO:
    if (sub.type === 'eventvenue' && sub.data.event?.slug) {
      sub.slugValue = sub.data.event.slug;
    } else {
      sub.slugValue = sub.data.slug || 'unknown';
    }
        } else {
          sub.name = '[Sin nombre]';
        }
        return sub;
      });
  
      handler.setRows(submissions);
      isLoading = false;
    }
  
    onMount(() => {
      handler.onChange(fetchRemote);
      handler.invalidate();
    });
    async function aprobar(id) {
  if (!confirm('¿Aprobar esta submission?')) return;

  const res = await fetch(`${API}/submissions/${id}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ reviewer_id: 1 }) // podés reemplazar por $user.id si lo tenés en este componente
  });

  if (res.ok) {
    Swal.fire({
      icon: 'success',
      title: '¡Aprobada!',
      text: 'La submission ha sido aprobada.'
    });
    handler.invalidate();
  } else {
    const msg = await res.text();
    Swal.fire({
      icon: 'error',
      title: 'Error al aprobar',
      text: msg
    });
  }
}

async function rechazar(id) {
  if (!confirm('¿Rechazar esta submission?')) return;

  const res = await fetch(`${API}/submissions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`
    },
    body: JSON.stringify({
      status: 'rechazado',
      reviewer_id: 1 // idem, reemplazá por $user.id si lo tenés
    })
  });

  if (res.ok) {
    Swal.fire({
      icon: 'success',
      title: 'Rechazada',
      text: 'La submission ha sido rechazada.'
    });
    handler.invalidate();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error al rechazar',
      text: 'No se pudo rechazar la submission.'
    });
  }
}

    let breadcrumbs = [
      { name: 'Home', href: '/' },
      { name: 'Admin', href: '/admin' },
      { name: 'Submissions', href: '/admin/submissions' }
    ];
  </script>
  
  <Header title="Administrar Submissions" {breadcrumbs} />
  
  <div class="container mt-4">
    {#if isLoading}
      <p>Cargando submissions...</p>
    {:else}
      <Datatable {handler}>
        <table class="table table-bordered table-hover">
          <thead>
            <tr>
              <Th {handler} orderBy="id">ID</Th>
              <Th {handler}>Imagen</Th>
              <Th {handler}>Tipo</Th>
              <Th {handler}>Usuario</Th>
              <Th {handler}>Nombre</Th>
              <Th {handler}>Estado</Th>
              <Th {handler}>Fecha</Th>
              <Th {handler}>Acciones</Th>
            </tr>
            <tr class="filters">
              <ThFilter {handler} filterBy="id" />
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each submissions as sub (sub.id)}
              <tr>
                <td>{sub.id}</td>
                <td><img src="{MEDIA_URL}pending/{sub.slugValue}.jpg" width="100" /></td>

                <td>{sub.type}</td>
                <td>{sub.reviewer.realName}</td>
                <td>{sub.name}</td>
                <td>{sub.status}</td>
                <td>{sub.created_at}</td>
                <td class="d-flex gap-1 flex-wrap">
                    {#if sub.status !== 'approved'}

                  
                    <a href={`/admin/submissions/${sub.id}`} class="btn btn-sm btn-info">
                      <i class="fas fa-eye"></i>
                    </a>
                    <button class="btn btn-sm btn-success" on:click={() => aprobar(sub.id)}>
                      <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" on:click={() => rechazar(sub.id)}>
                      <i class="fas fa-times"></i>
                    </button>
                    {:else}

                    
                    <a href={`/${sub.slug}/${sub.data.slug}`} class="btn btn-sm btn-info">
                        <i class="fas fa-eye"></i>
                      </a>
                    {/if}
                  </td>
                  
              </tr>
            {/each}
          </tbody>
        </table>
      </Datatable>
    {/if}
  </div>
  