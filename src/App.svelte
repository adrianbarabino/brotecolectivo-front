<script>
	import { onMount } from 'svelte';
	import { Router, Route, useLocation } from 'svelte-routing';
	import { url } from './stores/url.js';
	import { applyMetatags } from './metatags.js';
	import Player  from './components/Player.svelte';
	import Navbar from './components/Navbar.svelte';
    import { user } from './stores/user.js';

	// Rutas públicas
	import Home from './routes/Home.svelte';
	import Artists from './routes/Artists.svelte';
	import Venues from './routes/Venues.svelte';
	import Events from './routes/Events.svelte';
	import Login from './routes/Login.svelte';
	import NewsDetail from './routes/NewsDetail.svelte';
	import ArtistDetail from './routes/ArtistDetail.svelte';
	import EventDetail from './routes/EventDetail.svelte';
	import MyAccount from './routes/MyAccount.svelte';
	import ArtistsTable from './routes/admin/Artists/ArtistsTable.svelte';
	// Admin
	import Admin from './routes/Admin.svelte';
    import CreateArtist from './routes/admin/Artists/CreateArtist.svelte';
    import EditArtist from './routes/admin/Artists/EditArtist.svelte';
	import SubmissionsTable from './routes/admin/Submissions/SubmissionsTable.svelte';
    import SubmissionEdit from './routes/admin/Submissions/SubmissionEdit.svelte';
    import EventsTable from './routes/admin/Events/EventsTable.svelte';
    import CreateEvent from './routes/admin/Events/CreateEvent.svelte';
    import EditEvent from './routes/admin/Events/EditEvent.svelte';
    import NewsTable from './routes/admin/News/NewsTable.svelte';
    import CreateArticle from './routes/admin/News/CreateArticle.svelte';
    import UsersTable from './routes/admin/Users/UsersTable.svelte';
	// Placeholder para futuras secciones admin
	// Podés reemplazar estos con sus componentes reales más adelante
	const Placeholder = { render: () => 'En construcción...' };

	// Escuchamos cambios en la ubicación
	const location = useLocation();
	let currentPath = '';
	let documentTitle = '';

	// Estado global para el título y descripción de la página
	let pageTitle = 'Brote Colectivo | Portal de difusión cultural en Santa Cruz';
	let pageDescription = 'Brote Colectivo es el portal cultural de Santa Cruz, Patagonia Argentina. Descubrí artistas, eventos, noticias, espacios culturales y más.';

	// Función para actualizar Analytics
	function updateAnalytics(path, title, description) {
		if (typeof gtag === 'function') {
			// Enviar cambio de página
			gtag('config', 'G-XX3XMK8GZX', {
				page_path: path,
				page_title: title,
				page_location: window.location.href
			});

			// Evento personalizado con más información
			gtag('event', 'page_view', {
				page_title: title,
				page_path: path,
				page_location: window.location.href,
				page_description: description
			});
		}
	}

	// Observar cambios en la ruta y en el título del documento
	$: if ($location && ($location.pathname !== currentPath || document.title !== documentTitle)) {
		currentPath = $location.pathname;
		documentTitle = document.title;
		
		// Enviamos la información a Analytics después de un breve retraso
		// para dar tiempo a que los componentes actualicen metadatos
		setTimeout(() => {
			// Capturar el título y descripción actual
			const currentTitle = document.title || pageTitle;
			const metaDescription = document.querySelector('meta[name="description"]');
			const currentDescription = metaDescription ? metaDescription.getAttribute('content') : pageDescription;
			
			updateAnalytics(currentPath, currentTitle, currentDescription);
		}, 100);
	}
  
	onMount(() => {
		const token = localStorage.getItem('access_token');
		if (token) {
			// parse payload but fixing charset issues 
			const base64Url = token.split('.')[1];
			const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			}).join(''));
			const payload = JSON.parse(jsonPayload);
			
			user.set({
				id: payload.user_id,
				email: payload.user_name,
				name: payload.real_name,
				role: payload.role,
				loggedIn: true
			});
		}
	});

	function getRouteKey(path) {
		if (path === '/') return 'home';
		if (path.startsWith('/artists')) return 'artists';
		if (path.startsWith('/news')) return 'news';
		if (path.startsWith('/venues')) return 'venues';
		if (path.startsWith('/events')) return 'events';
		if (path.startsWith('/login')) return 'login';
		if (path.startsWith('/panel')) return 'panel';
		if (path.startsWith('/my-account')) return 'my-account';
		if (path.startsWith('/admin')) return 'admin';
		return 'default';
	}

	// Aplicar metatags iniciales basados en la ruta
	url.subscribe((path) => {
		const routeKey = getRouteKey(path);
		applyMetatags(routeKey);
		scrollTo(0, 0);
	});
</script>

<Navbar />

<main class="container">
	<Router>
		<Route path="/" component={Home} />
		<Route path="/news-page/:page" component={Home} />
		<Route path="/news" component={Home} />
		<Route path="/noticias/:slug" component={NewsDetail} />
		<Route path="/artists" component={Artists} />
		<Route path="/artistas" component={Artists} />
		<Route path="/artists-page/:page" component={Artists} />
		<Route path="/artistas/:id" component={ArtistDetail} />
		<Route path="/venues" component={Venues} />
		<Route path="/events" component={Events} />
		<Route path="/eventos" component={Events} />
		<Route path="/agenda-cultural" component={Events} />
		<Route path="/events-page/:page" component={Events} />
		<Route path="/agenda-cultural-page/:page" component={Events} />
		<Route path="/agenda-cultural/:slug" component={EventDetail} />
		<Route path="/my-account" component={MyAccount} />
		<Route path="/mi-cuenta" component={MyAccount} />
		<Route path="/login" component={Login} />

		<!-- Panel de administración -->
		<Route path="/admin" component={Admin} />
		<Route path="/admin/users" component={UsersTable} />
		<Route path="/admin/news" component={NewsTable} />
		<Route path="/admin/news/add" component={CreateArticle} />
		<Route path="/admin/artists" component={ArtistsTable} />
		<Route path="/admin/artists/add" component={CreateArtist} />
		<Route path="/admin/artists/edit/:id" component={EditArtist} />
		<Route path="/admin/submissions" component={SubmissionsTable} />
		<Route path="/admin/submissions/:id" component={SubmissionEdit} />
		<Route path="/admin/venues" component={Placeholder} />
		<Route path="/admin/events" component={EventsTable} />
		<Route path="/admin/events/add" component={CreateEvent} />
		<Route path="/admin/events/edit/:id" component={EditEvent} />
		<Route path="/admin/videos" component={Placeholder} />
		<Route path="/admin/songs" component={Placeholder} />
	</Router>
</main>

<Player />
