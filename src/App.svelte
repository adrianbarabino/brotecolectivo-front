<script>
	import Navbar from './components/Navbar.svelte';
	import Router from 'svelte-spa-router';
  
	import Home from './routes/Home.svelte';
	import Artists from './routes/Artists.svelte';
	import Venues from './routes/Venues.svelte';
	import Events from './routes/Events.svelte';
  
	const routes = {
	  '/': Home,
	  '/artists': Artists,
	  '/venues': Venues,
	  '/events': Events
	};
  </script>
  
  <Navbar />
  
  <main>
	<Router {routes} />
  </main>
  
  <style>
	main {
	  margin-top: 4rem;
	}
  </style>
  