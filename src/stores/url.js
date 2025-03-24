import { writable } from 'svelte/store';

function createUrlStore() {
  const { subscribe, set } = writable(window.location.pathname);

  function updateUrl() {
    set(window.location.pathname);
  }

  // Escuchar cuando el usuario navega con el navegador (botón atrás/adelante)
  window.addEventListener('popstate', updateUrl);

  // Interceptar pushState y replaceState para detectar navegación sin recarga
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    updateUrl();
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    updateUrl();
  };

  return {
    subscribe
  };
}

export const url = createUrlStore();
