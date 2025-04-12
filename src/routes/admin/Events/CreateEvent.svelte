<script>
    import { navigate } from 'svelte-routing';
    import Swal from 'sweetalert2';
    import { API, TOKEN, MEDIA_URL } from '../../../config.js';
    import { user } from '../../../stores/user.js';
    import Header from '../../../components/Header.svelte';
    import MapSelector from '../../../components/MapSelector.svelte';
    import RichTextEditor from '../../../components/RichTextEditor.svelte';
    import { onMount } from 'svelte';
    
    let selectedBandsIds = [];
    let imagePreview = '';
    let lastTitleValue = ''; // Para evitar loops en la generación de slug
  
    onMount(() => {
      console.log("[DEBUG] Usando TOKEN para todas las operaciones");
    });
  
    let step = 1;
    let venues = [];
    let bands = [];
    let file;
    let similarVenues = [];
    let isSubmitting = false; // Estado para controlar el envío múltiple
    let slugCheckTimeout;
    let slugModified = false;
  
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
    $: {
      // Solo actualizar cuando cambia el valor, no en cada ciclo de reactividad
      if (event.id_venue === 'new') {
        creatingVenue = true;
      }
    }
    
    let newVenue = {
      name: '',
      address: '',
      description: '',
      slug: '',
      latlng: '',
      city: ''
    };
    
    // Por defecto, NO mostrar el campo de hora de cierre (usar duración estándar)
    let showEndTimeField = false;
    
    // Lista de palabras comunes a excluir de las tags
    const commonWords = ['de', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'a', 'en', 'con', 'por', 'para', 'del'];
  
    // Generar slug a partir del título - Versión sin loop
    function generateSlugFromTitle() {
      if (!event.title || event.title === lastTitleValue || slugModified) return;
      
      lastTitleValue = event.title;
      // Generar slug base a partir del título
      let baseSlug = event.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 50);
      
      // Generar tags a partir del título
      const words = event.title.toLowerCase()
        .replace(/[^\wáéíóúüñ\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !commonWords.includes(word));
      
      // Solo actualizar tags si están vacías o si el usuario no las ha editado manualmente
      if (!event.tags || event.tags === '') {
        event.tags = [...new Set(words)].join(', '); // Eliminar duplicados
      }
      
      // Asignar el slug sin verificar (la verificación se hará al enviar)
      event.slug = baseSlug;
    }
    
    // Usar un watcher simple en lugar de reactive statement para evitar loops
    $: if (event.title) {
      clearTimeout(slugCheckTimeout);
      slugCheckTimeout = setTimeout(generateSlugFromTitle, 500);
    }

    // Variables para la búsqueda y filtrado de lugares
    let venueSearchTerm = '';
    $: filteredVenues = venues.filter(v => 
      !venueSearchTerm || 
      (v.name && v.name.toLowerCase().includes(venueSearchTerm.toLowerCase())) || 
      (v.address && v.address.toLowerCase().includes(venueSearchTerm.toLowerCase()))
    );

    // Verificar si el slug ya existe - solo se llama al enviar el formulario
    async function checkAndUpdateSlug() {
      if (!event.slug) return false;
      
      try {
        const res = await fetch(`${API}/events/slug/${event.slug}`);
        
        if (res.ok) {
          // Si la respuesta es 200, significa que el slug ya existe
          // Agregar prefijo de fecha al slug (formato: dd-mm-)
          const date = new Date(event.date_start);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const newSlug = `${day}-${month}-${event.slug}`;
          
          // Informar al usuario del cambio de slug
          await Swal.fire({
            title: 'Aviso',
            text: `El slug "${event.slug}" ya estaba en uso. Se ha generado automáticamente "${newSlug}"`,
            icon: 'info',
            timer: 3000
          });
          
          event.slug = newSlug;
          return true; // Slug actualizado
        }
        
        return false; // Slug no necesita actualización
      } catch (error) {
        console.error("Error al verificar disponibilidad del slug:", error);
        return false; // Continuar con el slug actual en caso de error
      }
    }
  
    $: if (creatingVenue && newVenue.name.length > 3) {
      checkSimilarVenues();
    }
    
    // Actualizar fecha de fin automáticamente (2 horas después del inicio)
    $: if (event.date_start) {
      updateEndDate();
    }
    
    function updateEndDate() {
      const startDate = new Date(event.date_start);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 2);
      
      // Si es después de las 23:00, poner la fecha de fin a la 1:00 del día siguiente
      if (endDate.getHours() >= 23) {
        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(1, 0, 0, 0);
      }
      
      event.date_end = endDate.toISOString().slice(0, 16);
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
        // Prevenir múltiples envíos
        if (isSubmitting) return;
        isSubmitting = true;
        
        // Validar que se haya seleccionado un lugar o se esté creando uno nuevo
        if (!event.id_venue && !creatingVenue) {
          Swal.fire({
            title: 'Error',
            text: 'Debes seleccionar un lugar para el evento',
            icon: 'error'
          });
          isSubmitting = false;
          step = 2; // Volver al paso donde se selecciona el lugar
          return;
        }
        
        // Validar que el nuevo lugar tenga nombre si se está creando uno
        if (creatingVenue && !newVenue.name) {
          Swal.fire({
            title: 'Error',
            text: 'Debes ingresar un nombre para el nuevo lugar',
            icon: 'error'
          });
          isSubmitting = false;
          return;
        }
        
        const isAdmin = $user.role === 'admin';
        event.band_ids = selectedBandsIds.map(id => parseInt(id)); // ahora viene del select múltiple

        // Generar el slug si no existe
        if (!event.slug) {
          event.slug = event.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 50);
        }
        
        // Verificar si el slug ya existe antes de continuar (una sola vez)
        await checkAndUpdateSlug();
        
        // PASO 1: Subir la imagen primero si existe
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('slug', event.slug);

          try {
            const uploadRes = await fetch(`${API}/submissions/upload-image`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${TOKEN}` },
              body: formData
            });
            
            if (!uploadRes.ok) {
              Swal.fire({ title: 'Error al subir la imagen', icon: 'error' });
              isSubmitting = false;
              return;
            }
            
            // Imagen subida correctamente
            console.log("Imagen subida correctamente");
          } catch (error) {
            console.error("Error al subir imagen:", error);
            Swal.fire({ title: 'Error al subir la imagen', text: error.message, icon: 'error' });
            isSubmitting = false;
            return;
          }
        }

        // PASO 2: Crear el evento o venue según corresponda
        if (creatingVenue) {
          // Generar el slug para el venue si no existe
          newVenue.slug = newVenue.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 50);
  
          if (isAdmin) {
            // Solución: Usar el endpoint de submissions que funciona correctamente
            console.log("[DEBUG] Creando evento+venue a través de submissions");
            
            // Crear submission combinada para evento+venue (como hacíamos antes)
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
              headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${TOKEN}`
              },
              body: JSON.stringify(submission)
            });
            
            if (!res.ok) {
              const text = await res.text();
              Swal.fire({ 
                title: 'Error al crear el evento y lugar', 
                text: text || 'Error al enviar la solicitud',
                icon: 'error' 
              });
              isSubmitting = false;
              return;
            }
            
            // Mostrar mensaje de éxito
            Swal.fire({ 
              title: 'Evento y lugar creados con éxito', 
              text: 'El evento y el lugar han sido creados y publicados automáticamente.',
              icon: 'success' 
            });
            
            navigate('/admin/events');
            return;
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
              isSubmitting = false; // Resetear el estado en caso de error
              return;
            }
  
            Swal.fire({ title: '¡Gracias!', text: 'Tu propuesta fue enviada para revisión.', icon: 'success' });
            navigate('/');
            return;
          }
        }
        if (!isAdmin && !creatingVenue) {
          const submission = {
            user_id: $user.id,
            type: 'event',
            data: event
          };

          const res = await fetch(`${API}/submissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
            body: JSON.stringify(submission)
          });

          if (!res.ok) {
            Swal.fire({ title: 'Error al enviar el evento', icon: 'error' });
            isSubmitting = false; // Resetear el estado en caso de error
            return;
          }

          Swal.fire({ title: '¡Gracias!', text: 'Tu propuesta fue enviada para revisión.', icon: 'success' });
          navigate('/');
          return;
        }

        // Si es admin y venue ya creado o fue creado recién
        if (isAdmin) {
          // Usar el enfoque de submissions también para eventos sin venue nuevo
          const submission = {
            user_id: $user.id,
            type: 'event',
            data: event
          };
          
          const res = await fetch(`${API}/submissions`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify(submission)
          });

          if (!res.ok) {
            const text = await res.text();
            Swal.fire({ title: 'Error al crear evento', text, icon: 'error' });
            isSubmitting = false;
            return;
          }

          Swal.fire({ 
            title: 'Evento creado con éxito', 
            text: 'El evento ha sido creado y publicado automáticamente.',
            icon: 'success' 
          });
          navigate('/admin/events');
        }
      } catch (error) {
        console.error(error);
        Swal.fire({ title: 'Error inesperado', text: error.message, icon: 'error' });
        isSubmitting = false; // Resetear el estado en caso de error
      }
    }
  
    let useAutoEndDate = true;

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
            <label class="form-label">Fecha y hora de inicio</label>
            <div class="row">
              <div class="col-md-6 mb-2">
                <input class="form-control" type="date" 
                  value={event.date_start ? event.date_start.split('T')[0] : ''}
                  on:change={(e) => {
                    const date = e.target.value;
                    const time = event.date_start ? event.date_start.split('T')[1] : '20:00';
                    event.date_start = `${date}T${time}`;
                    updateEndDate();
                  }}
                >
              </div>
              <div class="col-md-6 mb-2">
                <input class="form-control" type="time" 
                  value={event.date_start ? event.date_start.split('T')[1] : '20:00'}
                  on:change={(e) => {
                    const date = event.date_start ? event.date_start.split('T')[0] : new Date().toISOString().split('T')[0];
                    event.date_start = `${date}T${e.target.value}`;
                    updateEndDate();
                  }}
                >
              </div>
            </div>
          </div>
          <div class="mb-3">
            <div class="form-check mb-2">
              <input class="form-check-input" type="checkbox" id="customEndDate" bind:checked={showEndTimeField}>
              <label class="form-check-label" for="customEndDate">
                Definir hora de cierre (por defecto: 2 horas después)
              </label>
            </div>
            
            {#if showEndTimeField}
              <label class="form-label">Fecha y hora de fin</label>
              <div class="row">
                <div class="col-md-6 mb-2">
                  <input class="form-control" type="date" 
                    value={event.date_end ? event.date_end.split('T')[0] : ''}
                    on:change={(e) => {
                      const date = e.target.value;
                      const time = event.date_end ? event.date_end.split('T')[1] : '22:00';
                      event.date_end = `${date}T${time}`;
                    }}
                  >
                </div>
                <div class="col-md-6 mb-2">
                  <input class="form-control" type="time" 
                    value={event.date_end ? event.date_end.split('T')[1] : '22:00'}
                    on:change={(e) => {
                      const date = event.date_end ? event.date_end.split('T')[0] : new Date().toISOString().split('T')[0];
                      event.date_end = `${date}T${e.target.value}`;
                    }}
                  >
                </div>
              </div>
            {/if}
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
            <RichTextEditor 
              bind:value={event.content} 
              height="300px"
              placeholder="Escribe el contenido del evento aquí..."
            />
          </div>
          <div class="mb-3">
            <label class="form-label">Tags</label>
            <input class="form-control" bind:value={event.tags}>
          </div>
          <div class="mb-3">
            <label class="form-label">Slug</label>
            <input class="form-control" bind:value={event.slug} on:input={() => slugModified = true}>
            <div class="form-text">Identificador único para la URL del evento.</div>
          </div>
          <button class="btn btn-primary" type="button" on:click={() => {
            if (!file) {
              Swal.fire({ title: 'Falta la imagen', text: 'Por favor subí una imagen del evento.', icon: 'warning' });
              return;
            }
            
            // Asegurar que la fecha de fin esté actualizada si se usa auto end date
            if (!showEndTimeField) {
              updateEndDate();
            }
            
            if (showEndTimeField && new Date(event.date_end) <= new Date(event.date_start)) {
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
            <label class="form-label">Lugar <span class="text-danger">*</span></label>
            
            <!-- Buscador de lugares -->
            <div class="input-group mb-2">
              <input 
                type="text" 
                class="form-control" 
                placeholder="Buscar por nombre o dirección..." 
                bind:value={venueSearchTerm}
              />
              <button 
                class="btn btn-outline-primary" 
                type="button"
                on:click={() => creatingVenue = true}
                title="Crear nuevo lugar"
              >
                <i class="bi bi-plus-circle"></i> Nuevo lugar
              </button>
            </div>
            
            <!-- Lista de lugares filtrados -->
            {#if !creatingVenue}
              <div class="list-group mb-2" style="max-height: 200px; overflow-y: auto;">
                {#each filteredVenues as venue}
                  <button 
                    type="button" 
                    class="list-group-item list-group-item-action d-flex justify-content-between align-items-center {event.id_venue == venue.id ? 'active' : ''}"
                    on:click={() => event.id_venue = venue.id}
                  >
                    <div>
                      <strong>{venue.name}</strong>
                      {#if venue.address}
                        <div><small>{venue.address}</small></div>
                      {/if}
                    </div>
                    {#if event.id_venue == venue.id}
                      <i class="bi bi-check-circle"></i>
                    {/if}
                  </button>
                {/each}
                
                {#if filteredVenues.length === 0 && venueSearchTerm}
                  <div class="list-group-item text-center">
                    <p class="mb-1">No se encontraron lugares con "{venueSearchTerm}"</p>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-primary"
                      on:click={() => {
                        creatingVenue = true;
                        newVenue.name = venueSearchTerm;
                      }}
                    >
                      Crear "{venueSearchTerm}"
                    </button>
                  </div>
                {/if}
              </div>
              
              {#if !venueSearchTerm && venues.length > 10}
                <div class="text-muted mb-2">
                  <small>Ingresa un término de búsqueda para filtrar los {venues.length} lugares disponibles</small>
                </div>
              {/if}
              
              <small class="form-text text-danger" class:d-none={event.id_venue || creatingVenue}>Debes seleccionar un lugar o crear uno nuevo</small>
            {/if}
          </div>
  
          {#if creatingVenue}
            <div class="bg-light p-3 rounded mb-3">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0">Crear nuevo lugar</h6>
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-secondary" 
                  on:click={() => {
                    creatingVenue = false;
                    newVenue = { name: '', address: '', description: '', slug: '', latlng: '', city: '' };
                  }}
                >
                  Cancelar
                </button>
              </div>
              
              <div class="mb-2">
                <label class="form-label">Nombre <span class="text-danger">*</span></label>
                <input class="form-control" placeholder="Nombre del lugar" bind:value={newVenue.name} required>
              </div>
              
              {#if similarVenues.length > 0}
                <div class="alert alert-warning mt-2">
                  <strong>¡Ojo!</strong> Encontramos lugares con nombres parecidos:
                  <ul class="mb-1">
                    {#each similarVenues as v}
                      <li>
                        <strong>{v.name}</strong>
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-primary ms-2"
                          on:click={() => {
                            event.id_venue = v.id;
                            creatingVenue = false;
                            newVenue = { name: '', address: '', description: '', slug: '', latlng: '', city: '' };
                          }}
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
              
              <div class="mb-2">
                <textarea class="form-control" placeholder="Descripción" bind:value={newVenue.description}></textarea>
              </div>
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
            <button class="btn btn-primary" type="button" on:click={() => {
              // Validar que se haya seleccionado un lugar o se esté creando uno nuevo
              if (!event.id_venue && !creatingVenue) {
                Swal.fire({
                  title: 'Error',
                  text: 'Debes seleccionar un lugar para el evento',
                  icon: 'error'
                });
                return;
              }
              step = 3;
            }}>Siguiente</button>
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
          <li class="list-group-item"><strong>Fecha de inicio:</strong> {event.date_start}</li>
          <li class="list-group-item"><strong>Fecha de fin:</strong> {event.date_end}</li>
          <li class="list-group-item"><strong>Contenido:</strong><br> <div class="mt-1">{event.content}</div></li>
          <li class="list-group-item"><strong>Tags:</strong> {event.tags}</li>
          <li class="list-group-item"><strong>Lugar:</strong> {creatingVenue ? newVenue.name : (venues.find(v => v.id == event.id_venue)?.name || '')}</li>
          <li class="list-group-item"><strong>Bandas:</strong> {selectedBandsIds.map(id => bands.find(b => b.id == id)?.name).join(', ')}</li>
        </ul>
    
        <div class="d-flex justify-content-between">
          <button class="btn btn-secondary" type="button" on:click={() => step = 2}>Atrás</button>
          <button class="btn btn-success" type="submit" disabled={isSubmitting}>
            {#if isSubmitting}
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Procesando...
            {:else}
              Enviar
            {/if}
          </button>
        </div>
      </div>
    {/if}
    
    </form>
  </div>
