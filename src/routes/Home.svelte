<script>
  import NewsBlock from '../components/NewsBlock.svelte';
  import Header from '../components/Header.svelte';
  import { API, TOKEN, MEDIA_URL } from '../config.js';
  import Sidebar from '../components/Sidebar.svelte';
  import { user } from '../stores/user';

  console.log("Vamos a pasar los datos del user");
  console.log($user);
  console.log($user.id);
  console.log($user.role);
  
  
  let breadcrumbs = ['Home', 'Noticias'];
  
</script>

<Header title="Bienvenido a Brote Colectivo" subhead="sitio de difusión cultural en Santa Cruz, Argentina" breadcrumbs={breadcrumbs} />

<section class="container my-4">
  <div class="row">
    <div class="col-md-8">
      <NewsBlock {API} {TOKEN} {MEDIA_URL} />
    </div>

    <Sidebar />
  </div>
</section>
