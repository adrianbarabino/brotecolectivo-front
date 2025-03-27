<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';
    import { user } from '../stores/user.js';
    import Header from '../components/Header.svelte';
    let sections = [
      { label: 'Usuarios', route: '/admin/users', icon: 'fas fa-users' },
      { label: 'Artistas', route: '/admin/artists', icon: 'fas fa-microphone' },
      { label: 'Noticias', route: '/admin/news', icon: 'fas fa-newspaper' },
      { label: 'Lugares', route: '/admin/venues', icon: 'fas fa-map-marker-alt' },
      { label: 'Fechas', route: '/admin/events', icon: 'fas fa-calendar' },
      { label: 'Videos', route: '/admin/videos', icon: 'fas fa-video' },
      { label: 'Canciones', route: '/admin/songs', icon: 'fas fa-music' },
    ];
  
    $: currentUser = $user;
  
    onMount(() => {
      if (!currentUser.loggedIn || currentUser.role !== 'admin') {
        navigate('/');
      }
    });
    let breadcrumbs = ['Home', 'Admin'];
  </script>
  <Header title="Panel de administración" breadcrumbs={breadcrumbs} />
  <style>
    .admin-container {
      max-width: 1000px;
      margin: 2rem auto;
      padding: 1rem;
    }
    .card {
      cursor: pointer;
      transition: transform 0.2s ease-in-out;
    }
    .card:hover {
      transform: translateY(-3px);
    }
  </style>
  
  <section class="admin-container">
    <h2>Panel de administración</h2>
    <div class="row mt-4">
      {#each sections as section}
        <div class="col-md-4 mb-4">
          <div class="card shadow-sm" on:click={() => navigate(section.route)}>
            <div class="card-body d-flex align-items-center gap-3">
              <i class={section.icon + ' fa-2x text-primary'}></i>
              <div>
                <h5 class="card-title mb-0">{section.label}</h5>
                <small class="text-muted">Ir a {section.label.toLowerCase()}</small>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>
  