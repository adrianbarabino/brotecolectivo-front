<script>
	import { onMount } from 'svelte';
	import { Router, Route } from 'svelte-routing';
	import { url } from './stores/url.js';
	import { applyMetatags } from './metatags.js';
	import Player  from './components/Player.svelte';
	// Componentes globales
	import Navbar from './components/Navbar.svelte';
  
	// Rutas
	import Home from './routes/Home.svelte';
	import News from './routes/News.svelte';
	import Artists from './routes/Artists.svelte';
	import Venues from './routes/Venues.svelte';
	import Events from './routes/Events.svelte';
	import Login from './routes/Login.svelte';
    import ArtistDetail from './routes/ArtistDetail.svelte';
    import EventDetail from './routes/EventDetail.svelte';
	import NewsDetail from './routes/NewsDetail.svelte';

	// Detectar cambios de ruta y aplicar metatags automáticamente
	url.subscribe((path) => {
	  const routeKey = getRouteKey(path);
	  applyMetatags(routeKey);
	  scrollTo(0, 0); // scroll al top cuando cambia ruta
	});
  
	function getRouteKey(path) {
	  if (path === '/') return 'home';
	  if (path.startsWith('/artists')) return 'artists';
	  if (path.startsWith('/news')) return 'news';
	  if (path.startsWith('/venues')) return 'venues';
	  if (path.startsWith('/events')) return 'events';
	  if (path.startsWith('/events/')) return 'event';
	  if (path.startsWith('/login')) return 'login';
	  if (path.startsWith('/panel')) return 'panel';
	  return 'default';
	}
  </script>
  
  <Navbar />
  
  <main>
	<Router>
		<Route path="/" component={Home} />
		<Route path="/news" component={News} />
		<Route path="/news/:slug" component={NewsDetail} />
		<Route path="/artists" component={Artists} />
		<Route path="/artists/:id" component={ArtistDetail} />
	  <Route path="/venues" component={Venues} />
	  <Route path="/events" component={Events} />
	  <Route path="/events/:slug" component={EventDetail} />
	  <Route path="/login" component={Login} />
	</Router>
  </main>
  <Player />
  