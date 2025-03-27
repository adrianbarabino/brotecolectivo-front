<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';
    import { API, TOKEN } from '../../../config.js';
    import Header from '../../../components/Header.svelte';
    import { user } from '../../../stores/user.js';
    import Swal from 'sweetalert2';
  
    export let id;
  
    let submission = null;
    let bandData = {
      name: '',
      slug: '',
      bio: '',
      social: {}
    };
    let file;
    let error = '';
    let comment = '';
    let aprobando = false;
    let aprobada = false;
  
    async function fetchSubmission() {
      const res = await fetch(`${API}/submissions/${id}`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      if (!res.ok) {
        error = 'No se pudo cargar la submission';
        return;
      }
      submission = await res.json();
      bandData = submission.data || {};
      comment = submission.comment || '';
      
    }
  
    async function guardarCambios() {
      const res = await fetch(`${API}/submissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`
        },
        body: JSON.stringify({
          data: bandData,
          comment,
          status: 'pending',
          reviewer_id: $user.id
        })
      });
  
      if (!res.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Error al guardar los cambios',
          text: 'No se pudieron guardar los cambios. Intenta nuevamente.'
        });
        return;
      }
  
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('slug', bandData.slug);
  
        const uploadRes = await fetch(`${API}/submissions/upload-image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${TOKEN}` },
          body: formData
        });
  
        if (!uploadRes.ok) {
          Swal.fire({
            icon: 'error',
            title: 'Error al subir imagen (temporal)',
            text: 'No se pudo subir la nueva imagen. Intenta nuevamente.'
          });
          return;
        }
      }
  
      // swal
      Swal.fire({
        icon: 'success',
        title: 'Cambios guardados',
        text: 'La submission ha sido actualizada.'
      });
        navigate('/admin/submissions');
    }
  
    async function aprobarSubmission() {
      if (!confirm('¿Estás seguro de que querés aprobar esta banda?')) return;
      aprobando = true;
  
      const res = await fetch(`${API}/submissions/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`
        },
        body: JSON.stringify({ reviewer_id: $user.id })
      });
  
      aprobando = false;
  
      if (res.ok) {
        aprobada = true;
        Swal.fire({
          icon: 'success',
          title: '¡Aprobada!',
          text: 'La banda ha sido creada exitosamente.'
        });
        navigate('/admin/bands');
      } else {
        const msg = await res.text();
        // alert('Error al aprobar: ' + msg);
        Swal.fire({
          icon: 'error',
          title: 'Error al aprobar',
          text: msg
        });
      }
    }
  
    async function rechazarSubmission() {
      if (!confirm('¿Rechazar esta submission?')) return;
  
      const res = await fetch(`${API}/submissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`
        },
        body: JSON.stringify({
          status: 'rechazado',
          comment,
          reviewer_id: $user.id
        })
      });
  
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Rechazada',
          text: 'La submission ha sido rechazada.'
        });
        navigate('/admin/submissions');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al rechazar',
          text: 'No se pudo rechazar la submission.'
        });
      }
    }
  
    onMount(fetchSubmission);
  </script>
  
  <Header title="Revisar Submission" />
  
  <div class="container mt-4">
    {#if error}
      <div class="alert alert-danger">{error}</div>
    {:else if !submission}
      <p>Cargando datos...</p>
    {:else}
      <form on:submit|preventDefault={guardarCambios}>
        <div class="card p-3 mb-4">
          <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input class="form-control" type="text" bind:value={bandData.name} />
          </div>
          <div class="mb-3">
            <label class="form-label">Slug</label>
            <input class="form-control" type="text" bind:value={bandData.slug} />
          </div>
          <div class="mb-3">
            <label class="form-label">Biografía</label>
            <textarea class="form-control" rows="4" bind:value={bandData.bio}></textarea>
          </div>
  
          <div class="mb-3">
            <label class="form-label">Redes Sociales</label>
            {#each ['instagram', 'facebook', 'youtube', 'spotify', 'bandcamp'] as key}
              <input
                class="form-control mb-2"
                placeholder={key}
                bind:value={bandData.social[key]}
              />
            {/each}
          </div>
  
          <div class="mb-3">
            <label class="form-label">Imagen actual</label><br />
            <img
              src={`https://brotecolectivo.sfo3.digitaloceanspaces.com/pending/${bandData.slug}.jpg`}
              width="300"
              class="mb-3"
            />
            <input
              type="file"
              accept="image/*"
              class="form-control"
              on:change={(e) => file = e.target.files[0]}
            />
          </div>
  
          <div class="mb-3">
            <label class="form-label">Comentario interno (opcional)</label>
            <textarea class="form-control" rows="2" bind:value={comment}></textarea>
          </div>
  
          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary">Guardar Cambios</button>
            <button type="button" class="btn btn-success" on:click={aprobarSubmission} disabled={aprobando || aprobada}>
              <i class="fa fa-check"></i> Aprobar
            </button>
            <button type="button" class="btn btn-danger" on:click={rechazarSubmission}>
              <i class="fa fa-times"></i> Rechazar
            </button>
          </div>
        </div>
      </form>
    {/if}
  </div>
  