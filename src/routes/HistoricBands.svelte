<script>
    import Header from '../components/Header.svelte';
    import Sidebar from '../components/Sidebar.svelte';
    import { user } from '../stores/user';
    import { onMount } from 'svelte';
  
    let breadcrumbs = ['Home', 'Línea de tiempo'];
    let timeline;
  
    onMount(() => {
      const script = document.createElement('script');
      script.src = 'https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js';
      script.onload = () => {
        timeline = new TL.Timeline(
          'my-timeline',
          'https://docs.google.com/spreadsheets/d/1JDzXUIHiI93d7ssKyCCsiULofIu-iE3eVbA5L04NzNg/pubhtml',
          {
            lang: 'es'
          }
        );
      };
      document.body.appendChild(script);
    });
  </script>
  
  <link
    rel="stylesheet"
    href="https://cdn.knightlab.com/libs/timeline3/latest/css/timeline.css"
  />
  
  <Header
  title="Historia del Rock en Santa Cruz"
  subhead="Una línea de tiempo de bandas, recitales y cultura alternativa"
  breadcrumbs={breadcrumbs}
/>


  
  <section class="container my-4">
    <div class="row">
      <div class="col-md-12">
        <p>
            Presentamos esta linea de tiempo, que fue realizada con el apoyo de la comunidad de músicos locales en un grupo de Facebook en el año 2013. Si querés sumar tu material podés enviarlo a info@brotecolectivo.com así lo agregamos. 
            </p>
            <p>
                La idea es generar un archivo digital, de bandas y artistas que fueron parte de la historia, y que algunas siguen en actividad, como también recuerdos de entradas, flyers o listas de temas. 
            </p>
        <div id="my-timeline" style="width: 100%; height: 600px;"></div>
      </div>
    </div>
  </section>
  