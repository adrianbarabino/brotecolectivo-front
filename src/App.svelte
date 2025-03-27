<script>
	import { onMount } from 'svelte';
	import { Router, Route } from 'svelte-routing';
	import { url } from './stores/url.js';
	import { applyMetatags } from './metatags.js';
	import Player  from './components/Player.svelte';
	// Componentes globales
	import Navbar from './components/Navbar.svelte';
    import { user } from './stores/user.js';

	onMount(() => {
  const token = localStorage.getItem('access_token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
	console.log(payload);
    user.set({
		id: payload.user_id,
      email: payload.user_name,
      name: payload.real_name, // o lo que venga en el payload si lo guardás ahí
      role: 'usuario',
      loggedIn: true
    });
  }
});

  function logout() {
    localStorage.removeItem('access_token');
    user.set({
		id: '',
      email: '',
      name: '',
      role: '',
      loggedIn: false
    });
  }
	// Rutas
	import Home from './routes/Home.svelte';
	import Artists from './routes/Artists.svelte';
	import Venues from './routes/Venues.svelte';
	import Events from './routes/Events.svelte';
	import Login from './routes/Login.svelte';
    import ArtistDetail from './routes/ArtistDetail.svelte';
    import EventDetail from './routes/EventDetail.svelte';
	import NewsDetail from './routes/NewsDetail.svelte';
	import MyAccount from './routes/MyAccount.svelte';

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
	  if (path.startsWith('/my-account')) return 'my-account';
	  return 'default';
	}
  </script>
  
  <Navbar />
  
  <main>
	<Router>
		<Route path="/" component={Home} />
		<Route path="/news-page/:page" component={Home} />

		<Route path="/news" component={Home} />
		<Route path="/news/:slug" component={NewsDetail} />
		<Route path="/artists" component={Artists} />
		<Route path="/artists-page/:page" component={Artists} />

		<Route path="/artists/:id" component={ArtistDetail} />
		<Route path="/venues" component={Venues} />
		<Route path="/my-account" component={MyAccount} />
		<Route path="/events" component={Events} />
	  <Route path="/events/:slug" component={EventDetail} />
	  <Route path="/login" component={Login} />
	</Router>
  </main>
  <Player />
  