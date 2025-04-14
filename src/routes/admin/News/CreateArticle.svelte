<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';
    import Swal from 'sweetalert2';
    import { API, TOKEN, MEDIA_URL } from '../../../config.js';
    import Header from '../../../components/Header.svelte';
    import RichTextEditor from '../../../components/RichTextEditor.svelte';
    import { user } from '../../../stores/user.js';
  
    let step = 1;
    let file;
    let slugModified = false;
    let isSubmitting = false;
    let isGeneratingContent = false;
    let imagePreview = null;
  
    let news = {
      title: '',
      slug: '',
      content: '',
      image: '',
      date: new Date().toISOString().slice(0, 10) // Formato YYYY-MM-DD
    };

    function generateSlug(title) {
      if (!title) return '';
      if (slugModified) return news.slug;
      return title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 50);
    }

    $: {
      if (news.title && !slugModified) {
        news.slug = generateSlug(news.title);
      }
    }

    function handleSlugChange() {
      slugModified = true;
    }

    async function generateContent() {
      if (!news.title) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Por favor, ingresa un título primero'
        });
        return;
      }

      const { value: customPrompt } = await Swal.fire({
        title: 'Generar contenido con IA',
        input: 'textarea',
        inputLabel: 'Información adicional',
        inputPlaceholder: 'Agrega detalles o contexto sobre la noticia...',
        showCancelButton: true,
        confirmButtonText: 'Generar',
        cancelButtonText: 'Cancelar'
      });

      if (customPrompt === undefined) return; // Si se canceló el diálogo

      try {
        isGeneratingContent = true;
        // Usar el endpoint correcto según el rol
        const endpoint = $user?.role === 'admin' ? '/news/generate-content' : '/submissions/generate-content';
        
        const response = await fetch(`${API}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
          },
          body: JSON.stringify({
            title: news.title,
            custom_prompt: customPrompt || '',
            type: 'news' // Agregar el tipo para el endpoint de submissions
          })
        });

        if (!response.ok) throw new Error('Error al generar el contenido');
        
        const data = await response.json();
        news.content = data.content;

      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al generar el contenido con IA'
        });
      } finally {
        isGeneratingContent = false;
      }
    }

    async function handleImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('slug', news.slug); // Agregando el slug para la imagen
        
        try {
          // Si no es admin, usa el endpoint de submissions
          const uploadEndpoint = $user?.role === 'admin' ? '/news/upload-image' : '/submissions/upload-image';
          const response = await fetch(`${API}${uploadEndpoint}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${TOKEN}`
            },
            body: formData
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al subir la imagen');
          }

          const data = await response.json();
          news.image = data.url; // Guardando la URL de la imagen
          
          // Actualizar el preview con la URL real
          imagePreview = `${MEDIA_URL}${data.url}`;
        } catch (error) {
          console.error('Error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Error al subir la imagen'
          });
        }
      }
    }

    function removeImage() {
      news.image = '';
      imagePreview = null;
      const fileInput = document.getElementById('image');
      if (fileInput) fileInput.value = '';
    }

    async function handleSubmit() {
      if (isSubmitting) return;
      
      if (!news.title || !news.content || !news.date || !news.slug) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Por favor completa todos los campos requeridos'
        });
        return;
      }

      isSubmitting = true;

      try {
        // Si no es admin, envía a submissions
        if ($user?.role !== 'admin') {
          const response = await fetch(`${API}/submissions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
              type: 'news',
              user_id: $user.id, // Agregando el user_id
              data: {
                ...news,
                image: news.image || '' // Asegurando que image nunca sea undefined
              }
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al crear la submission');
          }

          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Tu noticia ha sido enviada para revisión',
            showConfirmButton: false,
            timer: 1500
          });

          navigate('/news');
        } else {
          // Si es admin, crea directamente
          const response = await fetch(`${API}/news`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
              ...news,
              image: news.image || '' // Asegurando que image nunca sea undefined
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al crear la noticia');
          }

          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'La noticia ha sido creada exitosamente',
            showConfirmButton: false,
            timer: 1500
          });

          navigate('/admin/news');
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Hubo un error al procesar la noticia'
        });
      } finally {
        isSubmitting = false;
      }
    }

    onMount(() => {
      if (!TOKEN) {
        navigate('/login');
      }
    });

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

  <form on:submit|preventDefault={handleSubmit}>
    {#if step === 1}
      <div class="card p-4 shadow-sm">
        <div class="mb-3">
          <label class="form-label" for="title">Título</label>
          <input
            type="text"
            id="title"
            bind:value={news.title}
            class="form-control"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label" for="slug">Slug</label>
          <input
            type="text"
            id="slug"
            bind:value={news.slug}
            on:input={handleSlugChange}
            class="form-control"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label" for="date">Fecha</label>
          <input
            type="date"
            id="date"
            bind:value={news.date}
            class="form-control"
            required
          />
        </div>

        <button type="button" class="btn btn-primary mt-2" on:click={() => step = 2}>
          Siguiente
        </button>
      </div>
    {/if}

    {#if step === 2}
      <div class="card p-4 shadow-sm">
        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label" for="content">Contenido</label>
            <button
              type="button"
              class="btn btn-outline-primary btn-sm"
              on:click={generateContent}
              disabled={isGeneratingContent}
            >
              {isGeneratingContent ? 'Generando...' : 'Generar con IA'}
            </button>
          </div>
          <div class="mt-1">
            <RichTextEditor bind:value={news.content} />
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label" for="image">Imagen Principal</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            on:change={handleImageChange}
            class="form-control"
          />
        </div>

        {#if imagePreview}
          <div class="mb-3">
            <div class="position-relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                class="img-fluid rounded"
                style="max-height: 300px; width: 100%; object-fit: contain;"
              />
              <button 
                type="button" 
                class="btn btn-danger position-absolute top-0 end-0 m-2"
                on:click={removeImage}
              >
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>
        {/if}

        <div class="d-flex justify-content-between">
          <button type="button" class="btn btn-secondary" on:click={() => step = 1}>
            Atrás
          </button>
          <button type="button" class="btn btn-primary" on:click={() => step = 3}>
            Siguiente
          </button>
        </div>
      </div>
    {/if}

    {#if step === 3}
      <div class="card p-4 shadow-sm">
        <h5>Revisá los datos antes de crear la noticia:</h5>
        <ul class="list-group my-3">
          <li class="list-group-item"><strong>Título:</strong> {news.title}</li>
          <li class="list-group-item"><strong>Slug:</strong> {news.slug}</li>
          <li class="list-group-item"><strong>Contenido:</strong> {news.content ? news.content.slice(0, 100) + '...' : 'Sin contenido'}</li>
          <li class="list-group-item"><strong>Imagen:</strong> {news.image ? 'Seleccionada' : 'No seleccionada'}</li>
          <li class="list-group-item"><strong>Fecha:</strong> {news.date}</li>
        </ul>

        <div class="d-flex justify-content-between">
          <button type="button" class="btn btn-secondary" on:click={() => step = 2}>
            Atrás
          </button>
          <button type="submit" class="btn btn-success" disabled={isSubmitting}>
            {#if isSubmitting}
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Procesando...
            {:else}
              {$user?.role === 'admin' ? 'Crear Noticia' : 'Enviar para revisión'}
            {/if}
          </button>
        </div>
      </div>
    {/if}
  </form>
</div>