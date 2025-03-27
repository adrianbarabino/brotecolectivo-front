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

    .dropdown {
  position: relative;
  margin:0;
  padding:0;    color: #ffffff;
    text-decoration: none;
    font-weight: 500;
    text-transform: lowercase;
    padding: 0.4rem 0.6rem;
    border-radius: 5px;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #111;
  border: 1px solid #333;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  z-index: 1001;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-menu a {
  display: block;
  padding: 0.3rem 0;
  color: #fff;
}

.dropdown-menu a:hover {
  color: #00cc3d;
}

  </style>
  
  <nav>
    <section class="container">


  <div class="logo">
    <figure>
      <a href="/" use:link><img src="/img/logo.png" alt="Logo" width="180" /></a>
    </figure>
  </div>
  <div class="nav-links">
    <a href="/" use:link class:active={current === '/'}>Inicio<small>y noticias</small></a>
    <a href="/artists" use:link class:active={current === '/artists'}>Artistas<small>de la provincia</small></a>
    <!-- <a href="/venues" use:link class:active={current === '/venues'}>Espacios culturales</a> -->
    <a href="/events" use:link class:active={current === '/events'}>Agenda Cultural<small>eventos</small></a>
    {#if $user.loggedIn}
    <div class="dropdown">
      <a href="/my-account" use:link>
        {$user.name}
        {#if $user.role === 'admin'}
        <small>Administrador</small>

        {:else}
        <small>Mi cuenta</small>

      {/if}
      </a>
      <div class="dropdown-menu">
        <a href="#" on:click|preventDefault={logout}>Salir</a>
        {#if $user.role === 'admin'}
        <a href="/admin" use:link class:active={current === '/admin'}>
          Admin
        </a>
      {/if}
      </div>


    </div>
  {:else}
    <a href="/login" use:link class:active={current === '/login'}>
      Iniciar sesión
      <small>en tu cuenta</small>
    </a>
  {/if}
  
  
  
</div>
</section>
</nav>
