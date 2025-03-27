<script>
    import { navigate } from 'svelte-routing';
    import Swal from 'sweetalert2';
    import { API, TOKEN } from '../../../config.js';
    import { user } from '../../../stores/user.js';
    import Header from '../../../components/Header.svelte';
    import MapSelector from '../../../components/MapSelector.svelte';
    let selectedBandsIds = [];
    let imagePreview = '';
  
    let step = 1;
    let venues = [];
    let bands = [];
    let file;
    let similarVenues = [];
    function getNowForInput() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0,16); // YYYY-MM-DDTHH:MM
}
    let event = {
      title: '',
      slug: '',
      content: '',
      date_start: getNowForInput(),
      date_end: '',
      tags: '',
      id_venue: '',
      band_ids: []
    };
  
    let creatingVenue = false;
    $: creatingVenue = event.id_venue === 'new';
  
    let newVenue = {
      name: '',
      address: '',
      description: '',
      slug: '',
      latlng: '',
      city: ''
    };
  
    $: if (event.title) {
      event.slug = event.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 50);
    }
  
    $: if (event.date_start && !event.date_end) {
      event.date_end = event.date_start;
    }
  
    $: if (creatingVenue && newVenue.name.length > 3) {
      checkSimilarVenues();
    }
  
    async function checkSimilarVenues() {
      const name = newVenue.name.toLowerCase().trim();
      similarVenues = venues.filter(v =>
        v.name.toLowerCase().includes(name) || name.includes(v.name.toLowerCase())
      );
    }
  
    function useSimilarVenue(venue) {
event.id_venue = parseInt(event.id_venue);
      creatingVenue = false;
      newVenue = { name: '', address: '', description: '', slug: '', latlng: '', city: '' };
      similarVenues = [];
    }
  
    async function loadData() {
  const vRes = await fetch(`${API}/venues`);
  venues = await vRes.json();

  const bRes = await fetch(`${API}/bands?limit=1000`);
  const rawBands = await bRes.json();

  // Fuerzo el formato plano para asegurar que todo esté bien
  bands = rawBands.map(b => ({
    id: String(b.id),     // aseguramos que sea string por las dudas
    name: String(b.name)  // mismo con el nombre
  }));

  console.log("BANDS FORMATEADAS:", bands);
}


  
    loadData();
  
    async function submitForm() {
      try {
        const isAdmin = $user.role === 'admin';
        event.band_ids = selectedBandsIds.map(id => parseInt(id)); // ahora viene del select múltiple

  
        if (creatingVenue) {
          newVenue.slug = newVenue.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 50);
  
          if (isAdmin) {
            // Crear venue real
            const resVenue = await fetch(`${API}/venues`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
              body: JSON.stringify(newVenue)
            });
            if (!resVenue.ok) {
              Swal.fire({ title: 'Error al crear el lugar', icon: 'error' });
              return;
            }
            const venueData = await resVenue.json();
            console.log("El venue data es");
            console.log(venueData);
            event.id_venue = parseInt(venueData.id);
          } else {
            // Crear submission combinada
            const submission = {
              user_id: $user.id,
              type: 'eventvenue',
              data: {
                venue: newVenue,
                event: event
              }
            };
  
            const res = await fetch(`${API}/submissions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
              body: JSON.stringify(submission)
            });
  
            if (!res.ok) {
              Swal.fire({ title: 'Error al enviar el evento + lugar', icon: 'error' });
              return;
            }
  
            if (file) {
              const formData = new FormData();
              formData.append('file', file);
              formData.append('slug', event.slug);
  
              const uploadRes = await fetch(`${API}/submissions/upload-image`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${TOKEN}` },
                body: formData
              });
            }
  
            Swal.fire({ title: '¡Gracias!', text: 'Tu propuesta fue enviada para revisión.', icon: 'success' });
            navigate('/');
            return;
          }
        }
  
        // Si es admin y venue ya creado o fue creado recién
        if (isAdmin) {
            event.id_venue = parseInt(event.id_venue);

          const res = await fetch(`${API}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
            body: JSON.stringify(event)
          });
  
          if (!res.ok) {
            const text = await res.text();
            Swal.fire({ title: 'Error al crear evento', text, icon: 'error' });
            return;
          }
  
          const { id, slug } = await res.json();
  
          if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('slug', slug);
  
            const uploadRes = await fetch(`${API}/events/upload-image`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${TOKEN}` },
              body: formData
            });
          }
  
          Swal.fire({ title: 'Evento creado con éxito', icon: 'success' });
          navigate('/admin/events');
        }
      } catch (error) {
        console.error(error);
        Swal.fire({ title: 'Error inesperado', text: error.message, icon: 'error' });
      }
    }
  </script>
  
  <Header title={$user.role === 'admin' ? 'Crear Evento' : 'Proponer Evento'} subhead="Formulario paso a paso" />
  
  <div class="container my-4">
  
    <!-- Wizard steps -->
    <ul class="nav nav-pills mb-4 justify-content-center">
      <li class="nav-item"><a class="nav-link {step === 1 ? 'active' : ''}">1. Datos</a></li>
      <li class="nav-item"><a class="nav-link {step === 2 ? 'active' : ''}">2. Lugar y Bandas</a></li>
      <li class="nav-item"><a class="nav-link {step === 3 ? 'active' : ''}">3. Confirmar</a></li>
    </ul>
  
    <form on:submit|preventDefault={submitForm}>
      {#if step === 1}
        <div class="card p-4">
          <div class="mb-3">
            <label class="form-label">Título</label>
            <input class="form-control" bind:value={event.title} required>
          </div>
          <div class="mb-3">
            <label class="form-label">Slug</label>
            <input class="form-control" bind:value={event.slug}>
          </div>
          <div class="mb-3">
            <label class="form-label">Fecha de inicio</label>
            <input class="form-control" type="datetime-local" bind:value={event.date_start}>
          </div>
          <div class="mb-3">
            <label class="form-label">Fecha de fin</label>
            <input class="form-control" type="datetime-local" bind:value={event.date_end}>
          </div>
          <div class="mb-3">
            <label class="form-label">Flyer (imagen del evento)</label>
            <input class="form-control" type="file" accept="image/*" on:change={(e) => {
                file = e.target.files[0];
                if (file) {
                  imagePreview = URL.createObjectURL(file);
                }
              }}>          </div>
          
          <div class="mb-3">
            <label class="form-label">Contenido</label>
            <textarea class="form-control" rows="5" bind:value={event.content}></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Tags</label>
            <input class="form-control" bind:value={event.tags}>
          </div>
          <button class="btn btn-primary" type="button" on:click={() => {
            if (!file) {
              Swal.fire({ title: 'Falta la imagen', text: 'Por favor subí una imagen del evento.', icon: 'warning' });
              return;
            }
            if (new Date(event.date_end) <= new Date(event.date_start)) {
              Swal.fire({ title: 'Fechas inválidas', text: 'La fecha de fin debe ser posterior a la de inicio.', icon: 'warning' });
              return;
            }
            step = 2;
          }}>Siguiente</button>
        </div>
      {/if}
  
      {#if step === 2}
        <div class="card p-4">
          <div class="mb-3">
            <label class="form-label">Lugar</label>
            <select class="form-select" bind:value={event.id_venue}>
              <option value="" disabled selected>Seleccioná un lugar</option>
              <option value="new">+ Crear nuevo lugar</option>

              {#each venues as v}
                <option value={v.id}>{v.name}</option>
              {/each}
            </select>
          </div>
  

  
          {#if creatingVenue}
            <div class="bg-light p-3 rounded mb-3">
              <h6>Nuevo lugar</h6>
              <div class="mb-2"><input class="form-control" placeholder="Nombre" bind:value={newVenue.name}></div>
              {#if similarVenues.length > 0}
              <div class="alert alert-warning mt-2">
                <strong>¡Ojo!</strong> Encontramos lugares con nombres parecidos:
                <ul>
                  {#each similarVenues as v}
                    <li>
                      <strong>{v.name}</strong>
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-primary ms-2"
                        on:click={() => useSimilarVenue(v)}
                      >
                        Usar este
                      </button>
                    </li>
                  {/each}
                </ul>
                <div class="text-end">
                  <small>Podés ignorar esto y seguir completando el lugar.</small>
                </div>
              </div>
            {/if}
            
              <div class="mb-2">
                <MapSelector bind:latlng={newVenue.latlng} bind:address={newVenue.address} bind:city={newVenue.city} />
            </div>

              <div class="mb-2"><textarea class="form-control" placeholder="Descripción" bind:value={newVenue.description}></textarea></div>
            </div>
          {/if}
  

          <div class="mb-3">
            <label class="form-label">Bandas</label>
            <select multiple class="form-select" bind:value={selectedBandsIds}>
              {#each bands as b}
                <option value={b.id}>{b.name}</option>
              {/each}
            </select>
            <small class="form-text text-muted">Usá Ctrl (Windows) o Cmd (Mac) para seleccionar varias.</small>
          </div>
          
  
          <div class="d-flex justify-content-between">
            <button class="btn btn-secondary" type="button" on:click={() => step = 1}>Atrás</button>
            <button class="btn btn-primary" type="button" on:click={() => step = 3}>Siguiente</button>
          </div>
        </div>
      {/if}
      {#if step === 3}
      <div class="card p-4">
        <h5 class="mb-4 text-center">Confirmar datos del evento</h5>
    
        {#if imagePreview}
          <div class="text-center mb-4">
            <img src={imagePreview} alt="Vista previa del flyer" class="img-fluid rounded shadow" style="max-height: 300px;" />
            <div><small class="text-muted">Vista previa del flyer</small></div>
          </div>
        {/if}
    
        <ul class="list-group mb-4">
          <li class="list-group-item"><strong>Título:</strong> {event.title}</li>
          <li class="list-group-item"><strong>Slug:</strong> {event.slug}</li>
          <li class="list-group-item"><strong>Fecha de inicio:</strong> {event.date_start}</li>
          <li class="list-group-item"><strong>Fecha de fin:</strong> {event.date_end}</li>
          <li class="list-group-item"><strong>Contenido:</strong><br> <div class="mt-1">{event.content}</div></li>
          <li class="list-group-item"><strong>Tags:</strong> {event.tags}</li>
          <li class="list-group-item"><strong>Lugar:</strong> {creatingVenue ? newVenue.name : (venues.find(v => v.id == event.id_venue)?.name || '')}</li>
          <li class="list-group-item"><strong>Bandas:</strong> {selectedBandsIds.map(id => bands.find(b => b.id == id)?.name).join(', ')}</li>
        </ul>
    
        <div class="d-flex justify-content-between">
          <button class="btn btn-secondary" type="button" on:click={() => step = 2}>Atrás</button>
          <button class="btn btn-success" type="submit">Enviar</button>
        </div>
      </div>
    {/if}
    
    </form>
  </div>
