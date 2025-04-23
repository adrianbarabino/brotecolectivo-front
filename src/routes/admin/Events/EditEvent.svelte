<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import Swal from 'sweetalert2';
  import { API, TOKEN, MEDIA_URL } from '../../../config.js';
  import { user } from '../../../stores/user.js';
  import Header from '../../../components/Header.svelte';
  import MapSelector from '../../../components/MapSelector.svelte';
  import RichTextEditor from '../../../components/RichTextEditor.svelte';
  
  // Obtener el ID del evento de los parámetros de la URL
  export let id;
  
  let selectedBandsIds = [];
  let imagePreview = '';
  let originalImage = '';
  let imageChanged = false;
  
  let step = 1;
  let venues = [];
  let bands = [];
  let file;
  let isSubmitting = false;
  let isGeneratingDescription = false;
  let isLoading = true;
  let originalSlug = '';
  let slugModified = false;
  
  let event = {
    title: '',
    slug: '',
    content: '',
    date_start: '',
    date_end: '',
    tags: '',
    id_venue: '',
    band_ids: []
  };
  
  // Breadcrumbs para la navegación
  const breadcrumbs = [
    { label: 'Inicio', path: '/' },
    { label: 'Admin', path: '/admin' },
    { label: 'Eventos', path: '/admin/events' },
    { label: 'Editar Evento', path: `/admin/events/edit/${id}` }
  ];
  
  // Cargar datos del evento al montar el componente
  onMount(async () => {
    try {
      // Cargar venues y bandas
      await loadData();
      
      // Cargar datos del evento
      const res = await fetch(`${API}/events/${id}`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      
      const eventData = await res.json();
      
      // Asignar datos al objeto event
      event = {
        title: eventData.title || '',
        slug: eventData.slug || '',
        content: eventData.content || '',
        date_start: eventData.date_start ? eventData.date_start.substring(0, 16) : '',
        date_end: eventData.date_end ? eventData.date_end.substring(0, 16) : '',
        tags: eventData.tags || '',
        id_venue: eventData.venue && eventData.venue.id ? eventData.venue.id.toString() : '',
        band_ids: []
      };
      
      console.log("Datos del evento cargados:", eventData);
      console.log("id_venue cargado desde venue.id:", event.id_venue);
      
      // Guardar el slug original para verificar cambios
      originalSlug = event.slug;
      
      // Configurar la imagen original
      originalImage = `${MEDIA_URL}/events/${event.slug}.jpg`;
      imagePreview = originalImage;
      
      // Obtener las bandas asociadas al evento
      const bandsRes = await fetch(`${API}/events/${id}/bands`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      
      if (bandsRes.ok) {
        const eventBands = await bandsRes.json();
        selectedBandsIds = eventBands.map(band => band.id.toString());
        event.band_ids = selectedBandsIds.map(id => parseInt(id)); // Convertir a números para la API
        console.log("Bandas asociadas cargadas:", selectedBandsIds);
      }
      
      isLoading = false;
    } catch (error) {
      console.error("Error al cargar el evento:", error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar la información del evento',
        icon: 'error'
      });
      navigate('/admin/events');
    }
  });
  
  async function loadData() {
    try {
      // Cargar venues
      const vRes = await fetch(`${API}/venues`);
      venues = await vRes.json();
      
      // Cargar bandas
      const bRes = await fetch(`${API}/bands?limit=1000`);
      const bandsData = await bRes.json();
      
      // Formatear bandas para el selector
      bands = bandsData.map(band => ({
        id: band.id,
        name: band.name
      }));
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  }
  
  // Manejar cambios en el slug
  function handleSlugChange() {
    slugModified = true;
  }
  
  // Generar slug a partir del título si no se ha modificado manualmente
  function generateSlug() {
    if (!slugModified && event.title) {
      event.slug = event.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 50);
    }
  }
  
  // Manejar cambio de imagen
  function handleFileChange(e) {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      file = selectedFile;
      imageChanged = true;
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = e => {
        imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  
  // Enviar formulario
  async function submitForm() {
    try {
      // Prevenir múltiples envíos
      if (isSubmitting) return;
      isSubmitting = true;
      
      // Convertir los IDs de banda a números
      event.band_ids = selectedBandsIds.map(id => parseInt(id));
      
      // Asegurarse de que id_venue sea un número
      const venueID = event.id_venue ? parseInt(event.id_venue) : null;
      
      console.log("Preparando datos para enviar:");
      console.log("- id_venue:", venueID);
      console.log("- band_ids:", event.band_ids);
      
      // Verificar si el slug ha cambiado y si existe
      if (event.slug !== originalSlug) {
        try {
          const slugCheckRes = await fetch(`${API}/events/slug/${event.slug}`);
          if (slugCheckRes.ok) {
            // Si la respuesta es 200, significa que el slug ya existe
            console.log("Slug ya existe, generando uno nuevo");
            const originalSlug = event.slug;
            let counter = 1;
            let slugExists = true;
            
            // Intentar con sufijos numéricos hasta encontrar uno disponible
            while (slugExists && counter < 100) {
              const newSlug = `${originalSlug}-${counter}`;
              const newCheckRes = await fetch(`${API}/events/slug/${newSlug}`);
              
              if (!newCheckRes.ok) {
                // Si la respuesta no es 200, el slug está disponible
                event.slug = newSlug;
                slugExists = false;
                console.log("Nuevo slug generado:", event.slug);
              } else {
                counter++;
              }
            }
            
            // Informar al usuario del cambio de slug
            Swal.fire({
              title: 'Aviso',
              text: `El slug "${originalSlug}" ya estaba en uso. Se ha generado automáticamente "${event.slug}"`,
              icon: 'info',
              timer: 3000
            });
          }
        } catch (error) {
          console.error("Error al verificar slug:", error);
          // Continuamos con el proceso aunque falle la verificación
        }
      }
      
      // Si se ha cambiado la imagen, subirla primero
      if (imageChanged && file) {
        console.log("Preparando para subir imagen:", file.name, "para el slug:", event.slug);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('slug', event.slug);
        formData.append('destination', 'events'); // Indicar que es para eventos (no pending)
        
        // Mostrar lo que estamos enviando
        console.log("FormData creado con slug:", event.slug, "y destination: events");
        console.log("Usando endpoint de submissions que es más robusto");
        
        try {
          console.log("Iniciando subida de imagen...");
          const uploadRes = await fetch(`${API}/submissions/upload-image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${TOKEN}` },
            body: formData
          });
          
          console.log("Respuesta recibida, status:", uploadRes.status);
          
          if (!uploadRes.ok) {
            const errorText = await uploadRes.text();
            console.error("Error al subir imagen. Status:", uploadRes.status, "Texto:", errorText);
            
            // Intentar con un enfoque alternativo si el error persiste
            if (uploadRes.status === 400 || uploadRes.status === 500) {
              console.log("Intentando enfoque alternativo con blob...");
              
              // Convertir el archivo a blob y enviarlo
              const blob = new Blob([await file.arrayBuffer()], { type: file.type });
              const altFormData = new FormData();
              altFormData.append('file', blob, file.name);
              altFormData.append('slug', event.slug);
              altFormData.append('destination', 'events'); // Indicar que es para eventos (no pending)
              
              try {
                const altUploadRes = await fetch(`${API}/submissions/upload-image`, {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${TOKEN}` },
                  body: altFormData
                });
                
                if (altUploadRes.ok) {
                  console.log("¡Éxito con el enfoque alternativo!");
                } else {
                  const altErrorText = await altUploadRes.text();
                  console.error("El enfoque alternativo también falló:", altErrorText);
                  throw new Error(altErrorText || "Error al subir la imagen (intento alternativo)");
                }
              } catch (altError) {
                console.error("Error en enfoque alternativo:", altError);
                throw altError;
              }
            } else {
              throw new Error(errorText || "Error desconocido al subir la imagen");
            }
          } else {
            console.log("Imagen subida correctamente");
          }
          
          // Esperar un momento para asegurarse de que la imagen esté disponible
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error("Error al subir imagen:", error);
          Swal.fire({ 
            title: 'Error al subir la imagen', 
            text: error.message || "No se pudo subir la imagen", 
            icon: 'error' 
          });
          isSubmitting = false;
          return;
        }
      }
      
      // Actualizar el evento
      const updateRes = await fetch(`${API}/events/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${TOKEN}` 
        },
        body: JSON.stringify({
          id_venue: venueID,
          title: event.title,
          tags: event.tags,
          content: event.content,
          slug: event.slug,
          date_start: event.date_start,
          date_end: event.date_end,
          band_ids: event.band_ids
        })
      });
      
      console.log("Respuesta de actualización:", await updateRes.clone().text());
      
      if (!updateRes.ok) {
        throw new Error('Error al actualizar el evento');
      }
      
      Swal.fire({
        title: '¡Éxito!',
        text: 'Evento actualizado correctamente',
        icon: 'success',
        timer: 2000
      });
      
      // Redirigir a la lista de eventos
      navigate('/admin/events');
    } catch (error) {
      console.error("Error al actualizar evento:", error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Error al actualizar el evento',
        icon: 'error'
      });
    } finally {
      isSubmitting = false;
    }
  }
  
  // Por defecto, NO mostrar el campo de hora de cierre (usar duración estándar)
  let showEndTimeField = false;
  
  // Lista de palabras comunes a excluir de las tags
  const commonWords = ['de', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'a', 'en', 'con', 'por', 'para', 'del'];
  
  // Generar tags automáticamente a partir del título
  function generateTags() {
    if (!event.tags && event.title) {
      const words = event.title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !commonWords.includes(word));
      
      event.tags = [...new Set(words)].join(', ');
    }
  }
  
  let isUploadingImage = false;
  let imageUploaded = false;
  let flyerUrl = '';
  let slugLocked = false;

  $: slugLocked = imageUploaded && flyerUrl;

  async function uploadImageIfNeeded() {
    if (!file) return null;
    if (imageUploaded && flyerUrl) return flyerUrl;
    isUploadingImage = true;
    imageUploaded = false;
    try {
      if (!event.slug) {
        event.slug = event.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 50);
      }
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', event.slug);
      formData.append('destination', 'events');
      const uploadRes = await fetch(`${API}/submissions/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${TOKEN}` },
        body: formData
      });
      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        throw new Error(errorText || 'Error al subir la imagen');
      }
      const uploadData = await uploadRes.json();
      flyerUrl = uploadData.url || `${MEDIA_URL}events/${event.slug}.jpg`;
      imageUploaded = true;
      isUploadingImage = false;
      return flyerUrl;
    } catch (error) {
      isUploadingImage = false;
      imageUploaded = false;
      throw error;
    }
  }

  async function generateDescriptionWithAI(customPrompt = '') {
    try {
      isGeneratingDescription = true;
      let flyer_url = '';
      if (imageChanged && file) {
        flyer_url = await uploadImageIfNeeded();
      } else if (imagePreview && imagePreview.startsWith('http')) {
        flyer_url = imagePreview;
      }
      const venueName = venues.find(v => v.id == event.id_venue)?.name || '';
      const venueAddress = venues.find(v => v.id == event.id_venue)?.address || '';
      const bandNames = selectedBandsIds.map(id => bands.find(b => b.id == id)?.name).filter(Boolean);
      const startDate = event.date_start ? new Date(event.date_start) : null;
      const formattedDate = startDate ? startDate.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : '';
      const res = await fetch(`${API}/events/generate-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({
          title: event.title,
          venue_name: venueName,
          venue_address: venueAddress,
          date: formattedDate,
          bands: bandNames,
          custom_prompt: customPrompt,
          flyer_url
        })
      });
      if (!res.ok) {
        throw new Error('Error al generar la descripción');
      }
      const data = await res.json();
      event.content = data.description;
    } catch (error) {
      console.error('Error completo:', error);
      Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error'
      });
    } finally {
      isGeneratingDescription = false;
    }
  }

  async function handleGenerateDescription() {
    const { value: customPrompt } = await Swal.fire({
      title: 'Generar descripción con IA',
      input: 'textarea',
      inputLabel: 'Información del evento',
      inputPlaceholder: 'Describe el tipo de evento, artistas, lugar, fecha, hora y cualquier otro detalle relevante...',
      showCancelButton: true,
      confirmButtonText: 'Generar',
      cancelButtonText: 'Cancelar'
    });

    if (customPrompt !== undefined) {
      generateDescriptionWithAI(customPrompt);
    }
  }
</script>

<Header title="Editar Evento" subhead="Modifica los datos del evento" breadcrumbs={breadcrumbs} admin />

<div class="container my-4">
  {#if isLoading}
    <div class="d-flex justify-content-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  {:else}
    <!-- Wizard steps -->
    <ul class="nav nav-pills mb-4 justify-content-center">
      <li class="nav-item">
        <button class="nav-link {step === 1 ? 'active' : ''}" type="button">1. Lugar y Bandas</button>
      </li>
      <li class="nav-item">
        <button class="nav-link {step === 2 ? 'active' : ''}" type="button">2. Datos del Evento</button>
      </li>
      <li class="nav-item">
        <button class="nav-link {step === 3 ? 'active' : ''}" type="button">3. Confirmación</button>
      </li>
    </ul>
    
    <form on:submit|preventDefault={submitForm}>
      {#if step === 1}
        <div class="card p-4 shadow-sm">
          <div class="mb-3">
            <label class="form-label">Lugar</label>
            <select class="form-select" bind:value={event.id_venue}>
              <option value="" disabled>Selecciona un lugar</option>
              {#each venues as venue}
                <option value={venue.id.toString()}>{venue.name} - {venue.address}</option>
              {/each}
            </select>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Bandas/Artistas</label>
            <select class="form-select" multiple bind:value={selectedBandsIds} size="5">
              {#each bands as band}
                <option value={band.id.toString()}>{band.name}</option>
              {/each}
            </select>
            <small class="text-muted">Mantén presionado Ctrl para seleccionar múltiples bandas</small>
          </div>
          
          <div class="d-flex justify-content-between mt-3">
            <button type="button" class="btn btn-outline-secondary" on:click={() => navigate('/admin/events')}>
              Cancelar
            </button>
            <button type="button" class="btn btn-primary" on:click={() => step = 2}>
              Siguiente
            </button>
          </div>
        </div>
      {/if}
      
      {#if step === 2}
        <div class="card p-4 shadow-sm">
          <div class="mb-3">
            <label class="form-label">Título</label>
            <input 
              class="form-control" 
              type="text" 
              bind:value={event.title} 
              on:blur={generateSlug}
              required
            />
          </div>
          
          <div class="mb-3">
            <label class="form-label">Slug (URL)</label>
            <div class="input-group">
              <span class="input-group-text">brotecolectivo.com.ar/agenda-cultural/</span>
              <input 
                class="form-control" 
                type="text" 
                bind:value={event.slug} 
                on:input={handleSlugChange}
                disabled={slugLocked}
                required
              />
            </div>
            <small class="text-muted">Identificador único para la URL del evento</small>
            {#if slugLocked}
              <div class="alert alert-info">El slug no se puede modificar porque ya se subió la imagen del flyer.</div>
            {/if}
          </div>
          
          <div class="mb-3">
            <label class="form-label">Descripción</label>
            <RichTextEditor 
              bind:value={event.content} 
              height="300px"
              placeholder="Escribe el contenido del evento aquí..."
            />
            <button 
              type="button"
              class="btn btn-sm btn-outline-secondary mt-2"
              on:click={handleGenerateDescription}
              disabled={isGeneratingDescription || isUploadingImage}
            >
              {#if isGeneratingDescription}
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Generando...
              {:else if isUploadingImage}
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Subiendo imagen...
              {:else}
                Generar descripción con IA
              {/if}
            </button>
            <small class="text-muted d-block">Puedes generar una descripción automáticamente con IA</small>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Etiquetas</label>
            <input 
              class="form-control" 
              type="text" 
              bind:value={event.tags} 
              placeholder="rock, indie, jazz..."
            />
            <button 
              type="button" 
              class="btn btn-sm btn-outline-secondary mt-2" 
              on:click={generateTags}
            >
              Generar automáticamente
            </button>
            <small class="text-muted d-block">Separa las etiquetas con comas</small>
          </div>
          
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Fecha y hora de inicio</label>
              <input 
                class="form-control" 
                type="datetime-local" 
                bind:value={event.date_start} 
                required
              />
            </div>
            
            <div class="col-md-6 mb-3">
              <div class="d-flex align-items-center mb-2">
                <label class="form-label mb-0 me-3">Fecha y hora de fin</label>
                <div class="form-check form-switch">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="showEndTime" 
                    bind:checked={showEndTimeField}
                  />
                  <label class="form-check-label" for="showEndTime">Personalizar</label>
                </div>
              </div>
              
              {#if showEndTimeField}
                <input 
                  class="form-control" 
                  type="datetime-local" 
                  bind:value={event.date_end}
                />
              {:else}
                <p class="text-muted small">Se usará la duración estándar (3 horas)</p>
              {/if}
            </div>
          </div>
          
          <div class="d-flex justify-content-between mt-3">
            <button type="button" class="btn btn-outline-secondary" on:click={() => step = 1}>
              Anterior
            </button>
            <button type="button" class="btn btn-primary" on:click={() => step = 3}>
              Siguiente
            </button>
          </div>
        </div>
      {/if}
      
      {#if step === 3}
        <div class="card p-4">
          <h5 class="mb-4 text-center">Confirmar cambios del evento</h5>

          {#if imagePreview}
            <div class="text-center mb-4">
              <img src={imagePreview} alt="Vista previa del flyer" class="img-fluid rounded shadow" style="max-height: 300px;" />
              <div><small class="text-muted">Vista previa del nuevo flyer</small></div>
            </div>
          {:else if event.image}
            <div class="text-center mb-4">
              <img src={event.image} alt="Flyer actual" class="img-fluid rounded shadow" style="max-height: 300px;" />
              <div><small class="text-muted">Flyer actual</small></div>
            </div>
          {/if}

          <ul class="list-group mb-4">
            <li class="list-group-item"><strong>Título:</strong> {event.title}</li>
            <li class="list-group-item"><strong>Fecha de inicio:</strong> {new Date(event.date_start).toLocaleString('es-AR')}</li>
            <li class="list-group-item"><strong>Fecha de fin:</strong> {event.date_end ? new Date(event.date_end).toLocaleString('es-AR') : 'No especificada'}</li>
            <li class="list-group-item">
              <strong>Contenido:</strong><br>
              <div class="mt-2 p-3 bg-light rounded content-preview" style="max-height: 300px; overflow-y: auto;">
                {@html event.content}
              </div>
            </li>
            <li class="list-group-item"><strong>Tags:</strong> {event.tags}</li>
            <li class="list-group-item">
              <strong>Lugar:</strong> {venues.find(v => v.id.toString() === event.id_venue)?.name || 'No especificado'}
            </li>
            <li class="list-group-item">
              <strong>Bandas:</strong> {selectedBandsIds.map(id => bands.find(b => b.id.toString() === id)?.name).join(', ') || 'Ninguna'}
            </li>
          </ul>

          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" on:click={() => step = 2}>
              Anterior
            </button>
            <button type="submit" class="btn btn-success" disabled={isSubmitting}>
              {#if isSubmitting}
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Procesando...
              {:else}
                Guardar Cambios
              {/if}
            </button>
          </div>
        </div>
      {/if}
    </form>
  {/if}
</div>

<style>
  /* Estilo para los pasos del wizard */
  .nav-pills .nav-link {
    border-radius: 50px;
    padding: 0.5rem 1.5rem;
    margin: 0 0.25rem;
    cursor: pointer;
  }
  
  .nav-pills .nav-link.active {
    background-color: #6c5ce7;
  }
  
  /* Estilo para las tarjetas */
  .card {
    border-radius: 10px;
    border: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  /* Estilo para los botones */
  .btn-primary {
    background-color: #6c5ce7;
    border-color: #6c5ce7;
  }
  
  .btn-primary:hover {
    background-color: #5b4bc9;
    border-color: #5b4bc9;
  }
  
  .btn-success {
    background-color: #00b894;
    border-color: #00b894;
  }
  
  .btn-success:hover {
    background-color: #00a383;
    border-color: #00a383;
  }
  
  .content-preview :global(p) {
    margin-bottom: 1rem;
  }
  .content-preview :global(b) {
    font-weight: bold;
  }
  .content-preview :global(i) {
    font-style: italic;
  }
</style>