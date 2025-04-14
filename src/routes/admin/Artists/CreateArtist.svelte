<script>
    import { navigate } from 'svelte-routing';
    import Swal from 'sweetalert2';
    import { API, TOKEN } from '../../../config.js';
    import Header from '../../../components/Header.svelte';
    import RichTextEditor from '../../../components/RichTextEditor.svelte';

    // toma rlos datos de user desde el store
    import { user } from '../../../stores/user.js';



    let step = 1;
    let file;
    let slugModified = false;
    let isSubmitting = false; // Estado para controlar el envío múltiple
    let isGeneratingBio = false; // Estado para controlar la generación de bio con IA
    let imagePreview;
  
    let artist = {
      name: '',
      slug: '',
      bio: '',
      social: {
        instagram: '',
        facebook: '',
        youtube: '',
        spotify: '',
        bandcamp: ''
      }
    };
  
    $: {
      if (artist.name && !slugModified) {
        artist.slug = artist.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .substring(0, 50);
      }
    }

    async function generateBioWithAI(customPrompt = '') {
      try {
        isGeneratingBio = true;
        const res = await fetch(`${API}/bands/generate-bio`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
          },
          body: JSON.stringify({
            name: artist.name,
            custom_prompt: customPrompt
          })
        });

        if (!res.ok) {
          throw new Error('Error al generar la biografía');
        }

        const data = await res.json();
        // Asegurarse de que el HTML se mantenga en el editor
        artist.bio = data.bio;

      } catch (error) {
        console.error('Error completo:', error);
        Swal.fire({
          title: 'Error',
          text: error.message,
          icon: 'error'
        });
      } finally {
        isGeneratingBio = false;
      }
    }

    async function handleGenerateBio() {
      const { value: customPrompt } = await Swal.fire({
        title: 'Generar biografía con IA',
        input: 'textarea',
        inputLabel: 'Información de la banda',
        inputPlaceholder: 'Describe los integrantes y sus instrumentos, género musical, etc...',
        showCancelButton: true,
        confirmButtonText: 'Generar',
        cancelButtonText: 'Cancelar'
      });

      if (customPrompt !== undefined) { // Si no se canceló el diálogo
        generateBioWithAI(customPrompt);
      }
    }
  
    async function slugExists(slug) {
      const res = await fetch(`${API}/bands/slug/${slug}`);
      return res.ok;
    }
  
    async function handleSubmit() {
      if (isSubmitting) return;
      
      if (!file) {
        Swal.fire({
          title: 'Error',
          text: 'Por favor, sube una imagen del artista antes de crear',
          icon: 'error'
        });
        return;
      }

      isSubmitting = true;

      try {
        // Primero subimos la imagen
        const formData = new FormData();
        formData.append('file', file);
        formData.append('slug', artist.slug);

        // Determinar el endpoint según si es admin o no
        const uploadEndpoint = $user.is_admin ? `${API}/bands/upload-image` : `${API}/submissions/upload-image`;
        const createEndpoint = $user.is_admin ? `${API}/bands` : `${API}/submissions`;

        const imageResponse = await fetch(uploadEndpoint, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${TOKEN}`
          }
        });

        if (!imageResponse.ok) {
          const errorText = await imageResponse.text();
          console.error("Error response:", errorText);
          throw new Error(`Error al subir la imagen: ${errorText}`);
        }

        const imageData = await imageResponse.json();
        
        // Luego creamos el artista o la submission según corresponda
        const response = await fetch(createEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
          },
          body: JSON.stringify($user.is_admin ? {
            ...artist,
            image: imageData.url
          } : {
            type: 'band',
            data: artist,
            user_id: $user.id
          })
        });

        if (!response.ok) {
          throw new Error('Error al crear el artista');
        }

        const data = await response.json();
        
        Swal.fire({
          title: $user.is_admin ? '¡Artista creado con éxito!' : 'Tu solicitud ha sido enviada',
          text: $user.is_admin ? 
            'El artista ha sido creado correctamente.' : 
            'Gracias por tu aporte. Tu solicitud será revisada por el equipo de moderación.',
          icon: 'success'
        });

        // Redirigir según el rol
        navigate($user.is_admin ? '/admin/artists' : '/');

      } catch (error) {
        console.error(error);
        Swal.fire({
          title: 'Error',
          text: error.message,
          icon: 'error'
        });
        isSubmitting = false;
      }
    }
  
    let breadcrumbs = ['Home', 'Artistas'];
  </script>
  

  {#if $user.role === 'admin'}
    <Header title="Crear Artista" subhead="Wizard de creación paso a paso" breadcrumbs={breadcrumbs} admin />
  {:else}
    <Header title="Enviar Propuesta" subhead="Wizard de propuesta de artista" breadcrumbs={breadcrumbs} />
  {/if}
  <div class="container my-4">
  
    <!-- Stepper -->
    <ul class="nav nav-pills mb-4 justify-content-center">
      <li class="nav-item">
        <button class="nav-link {step === 1 ? 'active' : ''}" type="button">1. Datos Básicos</button>
      </li>
      <li class="nav-item">
        <button class="nav-link {step === 2 ? 'active' : ''}" type="button">2. Redes + Imagen</button>
      </li>
      <li class="nav-item">
        <button class="nav-link {step === 3 ? 'active' : ''}" type="button">3. Confirmación</button>
      </li>
    </ul>
  
    <form on:submit|preventDefault={handleSubmit}>
      {#if step === 1}
        <div class="card p-4 shadow-sm">
          <div class="mb-3">
            <label class="form-label" for="artist-name">Nombre</label>
            <input id="artist-name" class="form-control" type="text" bind:value={artist.name} required>
          </div>

          <div class="mb-3">
            <label class="form-label" for="artist-slug">Slug</label>
            <input id="artist-slug" class="form-control" type="text" bind:value={artist.slug} on:input={() => slugModified = true}>
          </div>

          <div class="mb-3">
            <label class="form-label" for="artist-bio">Biografía</label>
            <div class="d-flex justify-content-end mb-2">
              <button type="button" class="btn btn-outline-primary btn-sm" on:click={handleGenerateBio} disabled={!artist.name || isGeneratingBio}>
                {#if isGeneratingBio}
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Generando...
                {:else}
                  {artist.bio ? 'Mejorar con IA' : 'Generar con IA'}
                {/if}
              </button>
            </div>
            <RichTextEditor id="artist-bio" bind:value={artist.bio} height="300px" placeholder="Escribe la biografía del artista..." />
          </div>

          <button type="button" class="btn btn-primary mt-2" on:click={() => step = 2}>Siguiente</button>
        </div>
      {/if}

      {#if step === 2}
        <div class="card p-4 shadow-sm">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="artist-instagram">Instagram</label>
              <input id="artist-instagram" class="form-control" type="text" bind:value={artist.social.instagram}>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="artist-facebook">Facebook</label>
              <input id="artist-facebook" class="form-control" type="text" bind:value={artist.social.facebook}>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="artist-youtube">YouTube</label>
              <input id="artist-youtube" class="form-control" type="text" bind:value={artist.social.youtube}>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="artist-spotify">Spotify</label>
              <input id="artist-spotify" class="form-control" type="text" bind:value={artist.social.spotify}>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="artist-bandcamp">Bandcamp</label>
              <input id="artist-bandcamp" class="form-control" type="text" bind:value={artist.social.bandcamp}>
            </div>
          </div>

          <div class="mb-3">
            <label for="artist-image" class="form-label">Imagen del artista <span class="text-danger">*</span></label>
            <input 
              class="form-control" 
              type="file" 
              id="artist-image"
              accept="image/*" 
              required
              on:change={(e) => {
                file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = e => imagePreview = e.target.result;
                  reader.readAsDataURL(file);
                }
              }}
            />
            {#if imagePreview}
              <img src={imagePreview} alt="Vista previa" class="mt-2 img-thumbnail" style="max-width: 200px;">
            {/if}
            <small class="text-muted d-block mt-1">La imagen es obligatoria para crear el artista</small>
          </div>

          <div class="d-flex justify-content-between">
            <button
              type="button"
              class="btn btn-secondary"
              on:click={() => step = step - 1}
              disabled={step <= 1}
            >
              Anterior
            </button>
            <button
              type="button"
              class="btn btn-primary"
              on:click={() => {
                if (!file) {
                  Swal.fire({
                    title: 'Error',
                    text: 'Por favor, sube una imagen del artista antes de continuar',
                    icon: 'error'
                  });
                  return;
                }
                step = 3;
              }}
            >
              Siguiente
            </button>
          </div>
        </div>
      {/if}

      {#if step === 3}
        <div class="card p-4 shadow-sm">
          <h5>Revisá los datos antes de crear el artista:</h5>
          <ul class="list-group my-3">
            <li class="list-group-item"><strong>Nombre:</strong> {artist.name}</li>
            <li class="list-group-item"><strong>Slug:</strong> {artist.slug}</li>
            <li class="list-group-item">
              <strong>Biografía:</strong>
              <div class="mt-2 p-3 bg-light rounded">
                {@html artist.bio}
              </div>
            </li>
            <li class="list-group-item"><strong>Instagram:</strong> {artist.social.instagram}</li>
            <li class="list-group-item"><strong>Facebook:</strong> {artist.social.facebook}</li>
            <li class="list-group-item"><strong>YouTube:</strong> {artist.social.youtube}</li>
            <li class="list-group-item"><strong>Spotify:</strong> {artist.social.spotify}</li>
            <li class="list-group-item"><strong>Bandcamp:</strong> {artist.social.bandcamp}</li>
            <li class="list-group-item"><strong>Imagen seleccionada:</strong> {file?.name || 'Ninguna'}</li>
          </ul>

          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" on:click={() => step = 2}>Atrás</button>
            <button type="submit" class="btn btn-success" disabled={isSubmitting}>
              {#if isSubmitting}
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Procesando...
              {:else}
                Crear Artista
              {/if}
            </button>
          </div>
        </div>
      {/if}
    </form>
  </div>
  