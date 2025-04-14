
<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import RichTextEditor from '../../../components/RichTextEditor.svelte';
  import { user } from '../../../stores/auth.js';
  import { API_URL } from '../../../config.js';

  let article = {
    title: '',
    content: '',
    type: 'news'
  };

  let isSubmitting = false;
  let submitted = false;
  let imageFile = null;
  let imagePreview = null;

  function removeImage() {
    imageFile = null;
    imagePreview = null;
    // Reset file input
    const fileInput = document.getElementById('image');
    if (fileInput) fileInput.value = '';
  }

  async function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      imageFile = file;
      imagePreview = URL.createObjectURL(file);
    }
  }

  async function handleSubmit() {
    isSubmitting = true;
    try {
      // Primero subimos la imagen si existe
      let imageUrl = '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('type', 'news');
        
        const imageResponse = await fetch(`${API_URL}/submissions/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${$user.token}`
          },
          body: formData
        });
        
        if (!imageResponse.ok) throw new Error('Error al subir la imagen');
        const imageData = await imageResponse.json();
        imageUrl = imageData.url;
      }

      // Si es admin, crear directamente, si no, crear submission
      if ($user?.role === 'admin') {
        const response = await fetch(`${API_URL}/news`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${$user.token}`
          },
          body: JSON.stringify({
            ...article,
            image: imageUrl
          })
        });

        if (!response.ok) throw new Error('Error al crear la noticia');
      } else {
        // Crear submission
        const submissionData = {
          type: 'news',
          data: {
            ...article,
            image: imageUrl
          }
        };

        const response = await fetch(`${API_URL}/submissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${$user.token}`
          },
          body: JSON.stringify(submissionData)
        });

        if (!response.ok) throw new Error('Error al crear la submission');
      }

      submitted = true;
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al crear la noticia. Por favor, intenta nuevamente.');
    } finally {
      isSubmitting = false;
    }
  }

  onMount(() => {
    if (!$user) {
      goto('/login');
    }
  });
</script>

{#if !submitted}
<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6">Crear Nueva Noticia</h1>
  
  <form on:submit|preventDefault={handleSubmit} class="max-w-2xl">
    <div class="mb-4">
      <label for="title" class="block text-sm font-medium text-gray-700">Título</label>
      <input
        type="text"
        id="title"
        bind:value={article.title}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        required
      />
    </div>

    <div class="mb-4">
      <label for="content" class="block text-sm font-medium text-gray-700">Contenido</label>
      <div class="mt-1">
        <RichTextEditor bind:value={article.content} />
      </div>
    </div>

    {#if imagePreview}
      <div class="mb-4">
        <img src={imagePreview} alt="Preview" class="max-w-xs" />
        <button 
          type="button" 
          class="mt-2 text-red-600 hover:text-red-800"
          on:click={removeImage}
        >
          Eliminar imagen
        </button>
      </div>
    {/if}

    <div class="mb-4">
      <label for="image" class="block text-sm font-medium text-gray-700">Imagen Principal</label>
      <input
        type="file"
        id="image"
        accept="image/*"
        on:change={handleImageChange}
        class="mt-1 block w-full"
      />
    </div>

    <div class="flex justify-end gap-4">
      <button
        type="button"
        on:click={() => goto('/news')}
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Enviando...' : 'Crear Noticia'}
      </button>
    </div>
  </form>
</div>
{:else}
<div class="container mx-auto px-4 py-8 text-center">
  <h2 class="text-2xl font-bold mb-4">¡Gracias por enviar tu noticia!</h2>
  <p class="mb-4">
    {#if $user?.role === 'admin'}
      Tu noticia ha sido creada exitosamente.
    {:else}
      Tu noticia ha sido enviada para revisión. Te notificaremos cuando sea aprobada.
    {/if}
  </p>
  <button
    on:click={() => goto($user?.role === 'admin' ? '/admin/news' : '/my-account')}
    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
  >
    {$user?.role === 'admin' ? 'Ir al Panel de Noticias' : 'Ir a Mi Cuenta'}
  </button>
</div>
{/if}
