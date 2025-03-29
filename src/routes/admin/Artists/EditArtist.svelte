<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';
    import Swal from 'sweetalert2';
    import { API, TOKEN, MEDIA_URL } from '../../../config.js';
    import Header from '../../../components/Header.svelte';
    import RichTextEditor from '../../../components/RichTextEditor.svelte';

    // Obtener datos del usuario desde el store
    import { user } from '../../../stores/user.js';

    // Obtener el ID del artista de los parámetros de la URL
    export let id;

    let step = 1;
    let file;
    let slugModified = false;
    let isSubmitting = false;
    let isLoading = true;
    let originalSlug = '';
    let imageUrl = '';
  
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

    // Cargar datos del artista al montar el componente
    onMount(async () => {
      try {
        const res = await fetch(`${API}/bands/${id}`, {
          headers: { 'Authorization': `Bearer ${TOKEN}` }
        });

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        // Verificar si la respuesta tiene contenido antes de intentar parsearla
        const text = await res.text();
        if (!text || text.trim() === '') {
          throw new Error('La respuesta del servidor está vacía');
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Error al parsear JSON:', e);
          console.error('Texto recibido:', text);
          throw new Error('Error al procesar la respuesta del servidor');
        }

        artist = {
          name: data.name || '',
          slug: data.slug || '',
          bio: data.bio || '',
          social: {
            instagram: data.social?.instagram || '',
            facebook: data.social?.facebook || '',
            youtube: data.social?.youtube || '',
            spotify: data.social?.spotify || '',
            bandcamp: data.social?.bandcamp || ''
          }
        };

        originalSlug = artist.slug;
        imageUrl = `${MEDIA_URL}bands/${artist.slug}.jpg`;
        isLoading = false;
      } catch (error) {
        console.error('Error al cargar el artista:', error);
        Swal.fire({
          title: 'Error',
          text: `No se pudo cargar la información del artista: ${error.message}`,
          icon: 'error'
        });
        navigate('/admin/artists');
      }
    });
  
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
  
    async function slugExists(slug) {
      // No verificar si el slug es el mismo que el original
      if (slug === originalSlug) return false;
      
      const res = await fetch(`${API}/bands/slug/${slug}`);
      return res.ok;
    }
  
    async function submitForm() {
      try {
        // Prevenir múltiples envíos
        if (isSubmitting) return;
        isSubmitting = true;

        // Validación de slug solo si ha cambiado
        if (artist.slug !== originalSlug && await slugExists(artist.slug)) {
          Swal.fire({
            title: 'Slug en uso',
            text: 'Ya existe un artista con ese slug. Por favor elegí otro.',
            icon: 'warning'
          });
          isSubmitting = false;
          return;
        }

        // Actualizar artista
        const res = await fetch(`${API}/bands/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
          },
          body: JSON.stringify(artist)
        });

        if (!res.ok) {
          const text = await res.text();
          Swal.fire({
            title: 'Error al actualizar el artista',
            text: text,
            icon: 'error'
          });
          isSubmitting = false;
          return;
        }

        const updatedArtist = await res.json();

        // Subir imagen solo si se seleccionó una nueva
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('slug', updatedArtist.slug);

          const uploadRes = await fetch(`${API}/bands/upload-image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${TOKEN}` },
            body: formData
          });

          if (!uploadRes.ok) {
            Swal.fire({
              title: 'Error al subir imagen',
              text: 'El artista se actualizó, pero hubo un problema al subir la imagen',
              icon: 'warning'
            });
            isSubmitting = false;
            navigate('/admin/artists');
            return;
          }
          
          // Actualizar la URL de la imagen para mostrar la nueva imagen
          imageUrl = `${MEDIA_URL}bands/${updatedArtist.slug}.jpg?t=${new Date().getTime()}`;
        } else if (originalSlug !== updatedArtist.slug) {
          // Si el slug cambió pero no se subió una nueva imagen, necesitamos manejar esto
          // Podríamos necesitar una API para renombrar la imagen en el servidor
          Swal.fire({
            title: 'Atención',
            text: 'Has cambiado el slug pero no la imagen. Es posible que necesites volver a subir la imagen para que coincida con el nuevo slug.',
            icon: 'info'
          });
        }

        Swal.fire({
          title: 'Artista actualizado con éxito',
          icon: 'success'
        });

        navigate('/admin/artists');

      } catch (error) {
        console.error(error);
        Swal.fire({
          title: 'Error inesperado',
          text: error.message,
          icon: 'error'
        });
        isSubmitting = false;
      }
    }
  
    let breadcrumbs = [
      { name: 'Home', href: '/' },
      { name: 'Admin', href: '/admin' },
      { name: 'Artistas', href: '/admin/artists' },
      { name: 'Editar Artista', href: `/admin/artists/edit/${id}` }
    ];
</script>

<Header title="Editar Artista" subhead="Modifica los datos del artista" breadcrumbs={breadcrumbs} admin />

<div class="container my-4">
  {#if isLoading}
    <div class="d-flex justify-content-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  {:else}
    <!-- Stepper -->
    <ul class="nav nav-pills mb-4 justify-content-center">
      <li class="nav-item">
        <a href="#step1" class="nav-link {step === 1 ? 'active' : ''}" on:click|preventDefault={() => step = 1}>1. Datos Básicos</a>
      </li>
      <li class="nav-item">
        <a href="#step2" class="nav-link {step === 2 ? 'active' : ''}" on:click|preventDefault={() => step = 2}>2. Redes + Imagen</a>
      </li>
      <li class="nav-item">
        <a href="#step3" class="nav-link {step === 3 ? 'active' : ''}" on:click|preventDefault={() => step = 3}>3. Confirmación</a>
      </li>
    </ul>
  
    <form on:submit|preventDefault={submitForm}>
      {#if step === 1}
        <div class="card p-4 shadow-sm" id="step1">
          <div class="mb-3">
            <label for="artist-name" class="form-label">Nombre</label>
            <input id="artist-name" class="form-control" type="text" bind:value={artist.name} required>
          </div>
  
          <div class="mb-3">
            <label for="artist-slug" class="form-label">Slug</label>
            <input id="artist-slug" class="form-control" type="text" bind:value={artist.slug} on:input={() => slugModified = true}>
            <div class="form-text">Cuidado: cambiar el slug puede romper enlaces existentes.</div>
          </div>
  
          <div class="mb-3">
            <label for="artist-bio" class="form-label">Biografía</label>
            <RichTextEditor 
              id="artist-bio"
              bind:value={artist.bio} 
              height="300px"
              placeholder="Escribe la biografía del artista aquí..."
            />
          </div>
  
          <button type="button" class="btn btn-primary mt-2" on:click={() => step = 2}>Siguiente</button>
        </div>
      {/if}
  
      {#if step === 2}
        <div class="card p-4 shadow-sm" id="step2">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="artist-instagram" class="form-label">Instagram</label>
              <input id="artist-instagram" class="form-control" type="text" bind:value={artist.social.instagram}>
            </div>
            <div class="col-md-6 mb-3">
              <label for="artist-facebook" class="form-label">Facebook</label>
              <input id="artist-facebook" class="form-control" type="text" bind:value={artist.social.facebook}>
            </div>
            <div class="col-md-6 mb-3">
              <label for="artist-youtube" class="form-label">YouTube</label>
              <input id="artist-youtube" class="form-control" type="text" bind:value={artist.social.youtube}>
            </div>
            <div class="col-md-6 mb-3">
              <label for="artist-spotify" class="form-label">Spotify</label>
              <input id="artist-spotify" class="form-control" type="text" bind:value={artist.social.spotify}>
            </div>
            <div class="col-md-6 mb-3">
              <label for="artist-bandcamp" class="form-label">Bandcamp</label>
              <input id="artist-bandcamp" class="form-control" type="text" bind:value={artist.social.bandcamp}>
            </div>
          </div>
  
          <div class="mb-3">
            <label class="form-label">Imagen Actual</label>
            <div class="mb-2">
              <img src={imageUrl} alt={artist.name} class="img-thumbnail" style="max-width: 200px;">
            </div>
            <label for="artist-image" class="form-label">Subir Nueva Imagen (opcional)</label>
            <input id="artist-image" class="form-control" type="file" accept="image/*" on:change={(e) => file = e.target.files[0]}>
          </div>
  
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" on:click={() => step = 1}>Atrás</button>
            <button type="button" class="btn btn-primary" on:click={() => step = 3}>Siguiente</button>
          </div>
        </div>
      {/if}
  
      {#if step === 3}
        <div class="card p-4 shadow-sm" id="step3">
          <h5>Revisá los datos antes de actualizar el artista:</h5>
          <ul class="list-group my-3">
            <li class="list-group-item"><strong>Nombre:</strong> {artist.name}</li>
            <li class="list-group-item"><strong>Slug:</strong> {artist.slug}</li>
            <li class="list-group-item"><strong>Biografía:</strong> {artist.bio}</li>
            <li class="list-group-item"><strong>Instagram:</strong> {artist.social.instagram}</li>
            <li class="list-group-item"><strong>Facebook:</strong> {artist.social.facebook}</li>
            <li class="list-group-item"><strong>YouTube:</strong> {artist.social.youtube}</li>
            <li class="list-group-item"><strong>Spotify:</strong> {artist.social.spotify}</li>
            <li class="list-group-item"><strong>Bandcamp:</strong> {artist.social.bandcamp}</li>
            <li class="list-group-item"><strong>Nueva imagen:</strong> {file?.name || 'No se cambiará la imagen'}</li>
          </ul>
  
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" on:click={() => step = 2}>Atrás</button>
            <button type="submit" class="btn btn-success" disabled={isSubmitting}>
              {#if isSubmitting}
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Procesando...
              {:else}
                Actualizar Artista
              {/if}
            </button>
          </div>
        </div>
      {/if}
    </form>
  {/if}
</div>
