<script>
	import { onMount } from 'svelte';
	import { Router, Route } from 'svelte-routing';
	import { url } from './stores/url.js';
	import { applyMetatags } from './metatags.js';
  
	// Componentes globales
	import Navbar from './components/Navbar.svelte';
  
	// Rutas
	import Home from './routes/Home.svelte';
	import Artists from './routes/Artists.svelte';
	import Venues from './routes/Venues.svelte';
	import Events from './routes/Events.svelte';
	import Login from './routes/Login.svelte';
  
	// Detectar cambios de ruta y aplicar metatags automáticamente
	url.subscribe((path) => {
	  const routeKey = getRouteKey(path);
	  applyMetatags(routeKey);
	  scrollTo(0, 0); // scroll al top cuando cambia ruta
	});
  
	function getRouteKey(path) {
	  if (path === '/') return 'home';
	  if (path.startsWith('/artists')) return 'artists';
	  if (path.startsWith('/venues')) return 'venues';
	  if (path.startsWith('/events')) return 'events';
	  if (path.startsWith('/login')) return 'login';
	  if (path.startsWith('/panel')) return 'panel';
	  return 'default';
	}
  </script>
  
  <Navbar />
  
  <main>
	<Router>
	  <Route path="/" component={Home} />
	  <Route path="/artists" component={Artists} />
	  <Route path="/venues" component={Venues} />
	  <Route path="/events" component={Events} />
	  <Route path="/login" component={Login} />
	</Router>
  </main>
  