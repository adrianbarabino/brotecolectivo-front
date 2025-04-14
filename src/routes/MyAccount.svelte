<script>
    import Header from '../components/Header.svelte';
    import { user } from '../stores/user.js';
    import { links } from 'svelte-routing';
    import UserBands from '../components/UserBands.svelte';
    import UserEvents from '../components/UserEvents.svelte';
  
    let loading = false;
    let error = '';
    let breadcrumbs = ['Home', 'Mi Cuenta'];
  
    $: loggedUser = $user;
  
  </script>
  
  <Header title="Mi Cuenta" subhead="Tu información y vinculación artística" breadcrumbs={breadcrumbs} />
  
  <section class="container">
    <div class="card">
      <h2 class="title">Hola, {loggedUser.name}</h2>
      <p><strong>Email:</strong> {loggedUser.email}</p>
      <p><strong>Rol general:</strong> {loggedUser.role}</p>
    </div>
  
    {#if loggedUser.loggedIn}
      <div class="card">
        <UserBands userId={loggedUser.id} />
      </div>

      <div class="card">
        <UserEvents userId={loggedUser.id} />
      </div>

    {/if}

    <div class="actions">
      <a href="/admin/artists/add" use:links class="btn btn-primary">Solicitar creación de artista</a>
      <a href="/admin/events/add" use:links class="btn btn-primary">Solicitar creación de evento</a>
    </div>
  </section>
  
  <style>
    section.container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
  
    .card {
      background: #f9f9f9;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
    }
  
    .title {
      margin-bottom: 1rem;
    }
  
    .artist-list {
      list-style: none;
      padding: 0;
      margin-top: 1rem;
    }
  
    .artist-item {
      padding: 1rem;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      display: flex;
      flex-direction: column;
    }
  
    .artist-name {
      font-weight: bold;
      margin-bottom: 0.3rem;
    }
  
    .rol,
    .estado {
      font-size: 0.9rem;
      color: #555;
    }
  
    .info {
      color: #666;
    }
  
    .error {
      color: red;
      font-weight: bold;
    }
  
    .actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  
    .btn {
      padding: 0.75rem 1.25rem;
      border: none;
      border-radius: 6px;
      background-color: #444;
      color: white;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.2s;
      text-align: center;
      text-decoration: none;
    }
  
    .btn:hover {
      background-color: #222;
    }
  
    .btn-primary {
      background-color: #007BFF;
    }
  
    .btn-primary:hover {
      background-color: #0056b3;
    }
  </style>