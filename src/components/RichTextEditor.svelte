<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  
  export let value = '';
  export let id = 'editor-' + Math.random().toString(36).substring(2, 9);
  export let height = '300px';
  export let placeholder = 'Escribe aquí...';
  
  const dispatch = createEventDispatcher();
  let editor;
  let editorElement;
  let scriptLoaded = false;
  
  onMount(() => {
    // Cargar TinyMCE desde CDN
    if (!window.tinymce) {
      const script = document.createElement('script');
      script.src = 'https://cdn.tiny.cloud/1/arbvbz8yqzz1emhb8ckd2tb0bl42innyjnmfz910keepsx38/tinymce/6/tinymce.min.js';
      script.referrerPolicy = 'origin';
      script.onload = initEditor;
      document.head.appendChild(script);
    } else {
      initEditor();
    }
    
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  });
  
  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });
  
  function initEditor() {
    scriptLoaded = true;
    
    window.tinymce.init({
      target: editorElement,
      height,
      menubar: false,
      plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
      ],
      toolbar: 'undo redo | blocks | ' +
        'bold italic forecolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | help',
      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
      placeholder,
      setup: (ed) => {
        editor = ed;
        
        // Inicializar con el valor actual
        editor.on('init', () => {
          editor.setContent(value);
        });
        
        // Actualizar el valor cuando cambie el contenido
        editor.on('change', () => {
          const newValue = editor.getContent();
          value = newValue;
          dispatch('change', newValue);
        });
      }
    });
  }
  
  // Actualizar el editor cuando cambie el valor desde fuera
  $: if (editor && editor.initialized && value !== editor.getContent()) {
    editor.setContent(value);
  }
</script>

<div class="editor-container">
  <div bind:this={editorElement} {id}></div>
  {#if !scriptLoaded}
    <div class="loading-editor">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando editor...</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .editor-container {
    position: relative;
    width: 100%;
  }
  
  .loading-editor {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.8);
  }
</style>
