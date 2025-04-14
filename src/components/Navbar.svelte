<script>
import { user } from '../stores/user.js';
import { link, navigate } from 'svelte-routing';
import { url } from '../stores/url.js';

$: current = $url;

  function logout() {
  localStorage.removeItem('access_token');
  user.set({
    email: '',
    id: '',
    name: '',
    role: '',
    loggedIn: false
  });
  navigate('/'); // redirecciona al home después de salir
}


// navbar-toggler function, for set the class active
  function toggleNavbar() {
    const navbar = document.querySelector('.navbar-collapse');
    navbar.classList.toggle('show');
  }
  // close the navbar when click on a link
  function closeNavbar() {
    const navbar = document.querySelector('.navbar-collapse');
    navbar.classList.remove('show');
  }
 </script>
  
  <style>

  </style>
  
  <nav>
    <section class="container">


  <div class="logo row">
    <figure class="col-10 col-md 12">
      <a href="/" use:link><img src="/img/logo.png" alt="Logo" width="180" /></a>
    </figure>
<!-- BOTÓN -->
<button 
  class="navbar-toggler d-inline col-2 col-md-0 text-white d-md-none"  
  on:click={toggleNavbar}
  type="button"
  aria-controls="navbarNav"
  aria-expanded="false"
  aria-label="Toggle navigation"
>
  <i class="fas fa-bars"></i>
</button>
  </div>
  <div class="nav-links collapse navbar-collapse" id="navbarNav">
    <a href="/" use:link on:click={closeNavbar} class:active={current === '/'}>Inicio<small>y noticias</small></a>
    <a href="/artists" use:link on:click={closeNavbar} class:active={current === '/artists'}>Artistas<small>de la provincia</small></a>
    <a href="/events" use:link on:click={closeNavbar} class:active={current === '/events'}>Agenda Cultural<small>eventos</small></a>
  
    {#if $user.loggedIn}
    <div class="dropdown">
      <a href="/my-account" use:link on:click={closeNavbar}>
        {$user.name}
        {#if $user.role === 'admin'}
          <small>Administrador</small>
        {:else}
          <small>Mi cuenta</small>
        {/if}
      </a>
      <div class="dropdown-menu">
      <!-- Links para crear artista y evento -->
      <a href="/admin/artists/add" use:link on:click={closeNavbar}>Nuevo artista</a>
      <a href="/admin/events/add" use:link on:click={closeNavbar}>Nuevo evento</a>
      <a href="/admin/news/add" use:link on:click={closeNavbar}>Nuevo artículo</a>

        <a href="#" on:click|preventDefault={() => { logout(); closeNavbar(); }}>Salir</a>
        {#if $user.role === 'admin'}
        <a href="/admin" use:link on:click={closeNavbar} class:active={current === '/admin'}>Admin</a>
        {/if}
      </div>
    </div>
    {:else}
    <a href="/login" use:link on:click={closeNavbar} class:active={current === '/login'}>Iniciar sesión<small>en tu cuenta</small></a>
    {/if}
  </div>
</section>
</nav>
