<script>
	import { onMount } from 'svelte';
	import { Router, Route } from 'svelte-routing';
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
    import NewsTable from './routes/admin/News/NewsTable.svelte';
    import CreateArticle from './routes/admin/News/CreateArticle.svelte';
    import UsersTable from './routes/admin/Users/UsersTable.svelte';
	// Placeholder para futuras secciones admin
	// Podés reemplazar estos con sus componentes reales más adelante
	const Placeholder = { render: () => 'En construcción...' };

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
		<Route path="/artists-page/:page" component={Artists} />
		<Route path="/artistas/:id" component={ArtistDetail} />
		<Route path="/venues" component={Venues} />
		<Route path="/events" component={Events} />
		<Route path="/events-page/:page" component={Events} />
		<Route path="/agenda-cultural/:slug" component={EventDetail} />
		<Route path="/my-account" component={MyAccount} />
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
		<Route path="/admin/videos" component={Placeholder} />
		<Route path="/admin/songs" component={Placeholder} />
	</Router>
</main>

<Player />
