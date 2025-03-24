<script>
      import { link } from 'svelte-routing';
      import { url } from '../stores/url.js';
      $: current = $url;
  </script>
  
  <style>
    nav {
      background-color: #ffffff;
      border-bottom: 1px solid #e0e0e0;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
  
    .logo {
      font-weight: bold;
      font-size: 1.2rem;
      color: #333;
    }
  
    .nav-links {
      display: flex;
      gap: 1.2rem;
    }
  
    a {
      color: #555;
      text-decoration: none;
      font-weight: 500;
      padding: 0.4rem 0.6rem;
      border-radius: 5px;
    }
  
    a:hover,
    a.active {
      background-color: #f0f0f0;
      color: #0077cc;
    }
  
    @media (max-width: 600px) {
      nav {
        flex-direction: column;
        align-items: flex-start;
      }
      .nav-links {
        flex-direction: column;
        gap: 0.6rem;
        margin-top: 0.5rem;
      }
    }
  </style>
  
  <nav>
  <div class="logo">Brote Colectivo</div>
  <div class="nav-links">
    <a href="/" use:link class:active={current === '/'}>Inicio</a>
    <a href="/artists" use:link class:active={current === '/artists'}>Artistas</a>
    <a href="/venues" use:link class:active={current === '/venues'}>Espacios culturales</a>
    <a href="/events" use:link class:active={current === '/events'}>Agenda</a>
    <a href="/login" use:link class:active={current === '/login'}>Iniciar sesión</a>
  </div>
</nav>