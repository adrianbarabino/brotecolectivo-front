<script>
    import { navigate } from 'svelte-routing';
    import Swal from 'sweetalert2';
    import { API, TOKEN } from '../../../config.js';
    import Header from '../../../components/Header.svelte';
    export let user = { id: 21, role: 'user' }; // esto viene del padre
  
    let step = 1;
    let file;
    let slugModified = false;
  
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
  
    async function slugExists(slug) {
      const res = await fetch(`${API}/bands/slug/${slug}`);
      return res.ok;
    }
  
    async function submitForm() {
  try {
    const isAdmin = user.role === 'admin';

    // validación de slug (solo admins)
    if (isAdmin && await slugExists(artist.slug)) {
      Swal.fire({
        title: 'Slug en uso',
        text: 'Ya existe un artista con ese slug. Por favor elegí otro.',
        icon: 'warning'
      });
      return;
    }

    let newArtist;
// subir imagen si no es admin (guarda en /pending/)
if (file && !isAdmin) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('slug', artist.slug);

  const uploadRes = await fetch(`${API}/submissions/upload-image`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}` },
    body: formData
  });

  if (!uploadRes.ok) {
    Swal.fire({
      title: 'Error al subir imagen (temporal)',
      icon: 'error'
    });
    return;
  }
}

    if (isAdmin) {
      // guardar directo como artista
      const res = await fetch(`${API}/bands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify(artist)
      });

      if (!res.ok) {
        const text = await res.text();
        Swal.fire({
          title: 'Error al crear el artista',
          text: text,
          icon: 'error'
        });
        return;
      }

      newArtist = await res.json();

    } else {
      // guardar como submission
      const submission = {
        user_id: user.id,
        type: 'banda',
        data: artist
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
          title: 'Error al enviar la propuesta',
          text: text,
          icon: 'error'
        });
        return;
      }

      Swal.fire({
        title: '¡Gracias!',
        text: 'Tu propuesta fue enviada y será revisada.',
        icon: 'success'
      });

      navigate('/');
      return;
    }

    // subir imagen (solo admins)
    if (file && isAdmin) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', newArtist.slug);

      const uploadRes = await fetch(`${API}/bands/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${TOKEN}` },
        body: formData
      });

      if (!uploadRes.ok) {
        Swal.fire({
          title: 'Error al subir imagen',
          icon: 'error'
        });
        return;
      }
    }

    Swal.fire({
      title: 'Artista creado con éxito',
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
  }
}

  
    let breadcrumbs = ['Home', 'Artistas'];
  </script>
  
  <Header title="Crear Artista" subhead="Wizard de creación paso a paso" breadcrumbs={breadcrumbs} />
  
  <div class="container my-4">
  
    <!-- Stepper -->
    <ul class="nav nav-pills mb-4 justify-content-center">
      <li class="nav-item">
        <a class="nav-link {step === 1 ? 'active' : ''}">1. Datos Básicos</a>
      </li>
      <li class="nav-item">
        <a class="nav-link {step === 2 ? 'active' : ''}">2. Redes + Imagen</a>
      </li>
      <li class="nav-item">
        <a class="nav-link {step === 3 ? 'active' : ''}">3. Confirmación</a>
      </li>
    </ul>
  
    <form on:submit|preventDefault={submitForm}>
      {#if step === 1}
        <div class="card p-4 shadow-sm">
          <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input class="form-control" type="text" bind:value={artist.name} required>
          </div>
  
          <div class="mb-3">
            <label class="form-label">Slug</label>
            <input class="form-control" type="text" bind:value={artist.slug} on:input={() => slugModified = true}>
          </div>
  
          <div class="mb-3">
            <label class="form-label">Biografía</label>
            <textarea class="form-control" rows="5" bind:value={artist.bio}></textarea>
          </div>
  
          <button type="button" class="btn btn-primary mt-2" on:click={() => step = 2}>Siguiente</button>
        </div>
      {/if}
  
      {#if step === 2}
        <div class="card p-4 shadow-sm">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Instagram</label>
              <input class="form-control" type="text" bind:value={artist.social.instagram}>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Facebook</label>
              <input class="form-control" type="text" bind:value={artist.social.facebook}>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">YouTube</label>
              <input class="form-control" type="text" bind:value={artist.social.youtube}>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Spotify</label>
              <input class="form-control" type="text" bind:value={artist.social.spotify}>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Bandcamp</label>
              <input class="form-control" type="text" bind:value={artist.social.bandcamp}>
            </div>
          </div>
  
          <div class="mb-3">
            <label class="form-label">Imagen</label>
            <input class="form-control" type="file" accept="image/*" on:change={(e) => file = e.target.files[0]}>
          </div>
  
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" on:click={() => step = 1}>Atrás</button>
            <button type="button" class="btn btn-primary" on:click={() => step = 3}>Siguiente</button>
          </div>
        </div>
      {/if}
  
      {#if step === 3}
        <div class="card p-4 shadow-sm">
          <h5>Revisá los datos antes de crear el artista:</h5>
          <ul class="list-group my-3">
            <li class="list-group-item"><strong>Nombre:</strong> {artist.name}</li>
            <li class="list-group-item"><strong>Slug:</strong> {artist.slug}</li>
            <li class="list-group-item"><strong>Biografía:</strong> {artist.bio}</li>
            <li class="list-group-item"><strong>Instagram:</strong> {artist.social.instagram}</li>
            <li class="list-group-item"><strong>Facebook:</strong> {artist.social.facebook}</li>
            <li class="list-group-item"><strong>YouTube:</strong> {artist.social.youtube}</li>
            <li class="list-group-item"><strong>Spotify:</strong> {artist.social.spotify}</li>
            <li class="list-group-item"><strong>Bandcamp:</strong> {artist.social.bandcamp}</li>
            <li class="list-group-item"><strong>Imagen seleccionada:</strong> {file?.name || 'Ninguna'}</li>
          </ul>
  
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" on:click={() => step = 2}>Atrás</button>
            <button type="submit" class="btn btn-success">Crear Artista</button>
          </div>
        </div>
      {/if}
    </form>
  </div>
  