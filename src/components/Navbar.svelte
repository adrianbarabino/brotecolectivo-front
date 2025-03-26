<script>
      import { link } from 'svelte-routing';
      import { url } from '../stores/url.js';
      $: current = $url;
  </script>
  
  <style>
    nav {
      background-color: #060606;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    nav .container{
      width:100%;
      display:flex;
      max-width:1100px;
      margin:0 auto;

      align-items: center;
      justify-content: space-between;
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
      color: #ffffff;
      text-decoration: none;
      font-weight: 500;
      text-transform:lowercase;
      padding: 0.4rem 0.6rem;
      border-radius: 5px;
    }
  
    a:hover,
    a.active {
      background-color: transparent;
      color: #00cc3d;
    }

    nav a small{
      display:block;
      color:#777;
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
    <section class="container">


  <div class="logo">
    <figure>
      <img src="/img/logo.png" alt="Logo" width="180" />
    </figure>
  </div>
  <div class="nav-links">
    <a href="/" use:link class:active={current === '/'}>Inicio<small>del sitio</small></a>
    <a href="/news" use:link class:active={current === '/news'}>Noticias<small>culturales</small></a>
    <a href="/artists" use:link class:active={current === '/artists'}>Artistas<small>de la provincia</small></a>
    <!-- <a href="/venues" use:link class:active={current === '/venues'}>Espacios culturales</a> -->
    <a href="/events" use:link class:active={current === '/events'}>Agenda Cultural<small>eventos</small></a>
    <!-- <a href="/login" use:link class:active={current === '/login'}>Iniciar sesión</a> -->
  </div>
</section>
</nav>