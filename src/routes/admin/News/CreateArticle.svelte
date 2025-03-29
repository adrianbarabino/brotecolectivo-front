<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';
    import Swal from 'sweetalert2';
    import { API, TOKEN, MEDIA_URL } from '../../../config.js';
    import Header from '../../../components/Header.svelte';
  
    let step = 1;
    let file;
    let slugModified = false;
    let isSubmitting = false; // Estado para controlar el envío múltiple
  
    let news = {
      title: '',
      slug: '',
      content: '',
      date: new Date().toISOString().slice(0, 10),
      band_ids: []
    };
  
    let allBands = [];
  
    onMount(async () => {
      const res = await fetch(`${API}/bands`);
      allBands = await res.json();
    });
  
    $: {
      if (news.title && !slugModified) {
        news.slug = news.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .substring(0, 50);
      }
    }
  
    async function slugExists(slug) {
      const res = await fetch(`${API}/news/${slug}`);
      return res.ok;
    }
  
    async function submitForm() {
      try {
        // Prevenir múltiples envíos
        if (isSubmitting) return;
        isSubmitting = true;
        
        if (await slugExists(news.slug)) {
          Swal.fire({
            title: 'Slug en uso',
            text: 'Ya existe una noticia con ese slug. Elegí otro.',
            icon: 'warning'
          });
          isSubmitting = false; // Resetear el estado para permitir corregir y reenviar
          return;
        }
  
        const res = await fetch(`${API}/news`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
          },
          body: JSON.stringify(news)
        });
  
        if (!res.ok) {
          const text = await res.text();
          Swal.fire({
            title: 'Error al crear la noticia',
            text: text,
            icon: 'error'
          });
          isSubmitting = false; // Resetear el estado en caso de error
          return;
        }
  
        const created = await res.json();
  
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('slug', created.slug);
  
          const uploadRes = await fetch(`${API}/news/upload-image`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${TOKEN}` },
            body: formData
          });
  
          if (!uploadRes.ok) {
            Swal.fire({
              title: 'Noticia creada, pero hubo un problema al subir la imagen',
              icon: 'warning'
            });
          }
        }
  
        Swal.fire({
          title: 'Noticia creada con éxito',
          html: `<strong>${created.title}</strong><br><a href="/noticias/${created.slug}" target="_blank">Ver noticia</a>`,
          imageUrl: `${MEDIA_URL}news/${created.slug}.jpg`,
          imageHeight: 200,
          confirmButtonText: 'OK'
        });
  
        navigate('/admin/news');
  
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: 'Error inesperado',
          text: error.message,
          icon: 'error'
        });
        isSubmitting = false; // Resetear el estado en caso de error
      }
    }
  
    let breadcrumbs = ['Home', 'Noticias'];
  </script>
  
  <Header title="Crear Noticia" subhead="Formulario de creación paso a paso" breadcrumbs={breadcrumbs} admin />
  
  <div class="container my-4">
    <ul class="nav nav-pills mb-4 justify-content-center">
      <li class="nav-item">
        <button 
          class="nav-link {step === 1 ? 'active' : ''}" 
          on:click={() => step = 1}
          type="button"
          aria-label="Ir al paso 1: Datos Básicos">
          1. Datos Básicos
        </button>
      </li>
      <li class="nav-item">
        <button 
          class="nav-link {step === 2 ? 'active' : ''}" 
          on:click={() => step = 2}
          type="button"
          aria-label="Ir al paso 2: Contenido e Imagen">
          2. Contenido + Imagen
        </button>
      </li>
      <li class="nav-item">
        <button 
          class="nav-link {step === 3 ? 'active' : ''}" 
          on:click={() => step = 3}
          type="button"
          aria-label="Ir al paso 3: Confirmación">
          3. Confirmación
        </button>
      </li>
    </ul>
  
    <form on:submit|preventDefault={submitForm}>
      {#if step === 1}
        <div class="card p-4 shadow-sm">
          <div class="mb-3">
            <label class="form-label" for="title">Título</label>
            <input class="form-control" type="text" id="title" bind:value={news.title} required>
          </div>
  
          <div class="mb-3">
            <label class="form-label" for="slug">Slug</label>
            <input class="form-control" type="text" id="slug" bind:value={news.slug} on:input={() => slugModified = true}>
          </div>
  
          <div class="mb-3">
            <label class="form-label" for="date">Fecha</label>
            <input class="form-control" type="date" id="date" bind:value={news.date} required>
          </div>
  
          <div class="mb-3">
            <label class="form-label" for="bands-select">Bandas asociadas</label>
            <select class="form-select" multiple id="bands-select" bind:value={news.band_ids}>
              {#each allBands as band}
                <option value={band.id}>{band.name}</option>
              {/each}
            </select>
          </div>
  
          <button type="button" class="btn btn-primary mt-2" on:click={() => step = 2}>Siguiente</button>
        </div>
      {/if}
  
      {#if step === 2}
        <div class="card p-4 shadow-sm">
          <div class="mb-3">
            <label class="form-label" for="content">Contenido</label>
            <textarea class="form-control" rows="10" id="content" bind:value={news.content}></textarea>
          </div>
  
          <div class="mb-3">
            <label class="form-label" for="image-upload">Imagen</label>
            <input class="form-control" type="file" id="image-upload" accept="image/*" on:change={(e) => file = e.target.files[0]}>
          </div>
  
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" on:click={() => step = 1}>Atrás</button>
            <button type="button" class="btn btn-primary" on:click={() => step = 3}>Siguiente</button>
          </div>
        </div>
      {/if}
  
      {#if step === 3}
        <div class="card p-4 shadow-sm">
          <h5>Revisá los datos antes de crear la noticia:</h5>
          <ul class="list-group my-3">
            <li class="list-group-item"><strong>Título:</strong> {news.title}</li>
            <li class="list-group-item"><strong>Slug:</strong> {news.slug}</li>
            <li class="list-group-item"><strong>Fecha:</strong> {news.date}</li>
            <li class="list-group-item"><strong>Bandas:</strong> {news.band_ids.length} seleccionadas</li>
            <li class="list-group-item"><strong>Contenido:</strong> {news.content.slice(0, 100)}...</li>
            <li class="list-group-item"><strong>Imagen seleccionada:</strong> {file?.name || 'Ninguna'}</li>
          </ul>
  
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" on:click={() => step = 2}>Atrás</button>
            <button type="submit" class="btn btn-success" disabled={isSubmitting}>
              {#if isSubmitting}
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Procesando...
              {:else}
                Crear Noticia
              {/if}
            </button>
          </div>
        </div>
      {/if}
    </form>
  </div>