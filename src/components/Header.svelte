<script>
    import { links } from 'svelte-routing';

    // we receive tree parameters
    // first the title
    // second the subhead
    // three the breadcrumbs array
    export let title = "Bienvenido a Brote Colectivo";
    export let subhead = "sitio de difusión cultural en Santa Cruz, Argentina";
    export let breadcrumbs = ["home", "bienvenido"];
    export let admin = false;

    // Map breadcrumb text to their corresponding routes
    function getBreadcrumbUrl(breadcrumb, index) {
        // If breadcrumb is an object with href property, use that
        if (typeof breadcrumb === 'object' && breadcrumb !== null && breadcrumb.href) {
            return breadcrumb.href;
        }
        
        // Otherwise, handle as before
        const breadcrumbText = typeof breadcrumb === 'string' ? breadcrumb : (breadcrumb?.name || '');
        const lowerBreadcrumb = breadcrumbText.toLowerCase();
        
        if (index === 0 || lowerBreadcrumb === 'home') {
            return '/';
        }
        
        // Map common breadcrumbs to their routes
        const routeMap = {
            'artistas': '/artistas',
            'noticias': '/',
            'agenda cultural': '/agenda-cultural',
            'eventos': '/agenda-cultural',
            'espacios culturales': '/espacios-culturales',
            'espacios': '/espacios-culturales',
            'venues': '/espacios-culturales',
            'admin': '/admin',
            'mi cuenta': '/mi-cuenta',
            'login': '/login',
            'registro': '/login',
            'usuarios': '/admin/users',
            'bandas': '/artistas',
            'submissions': '/admin/submissions'
        };
        
        // Return the mapped route or a fallback
        return routeMap[lowerBreadcrumb] || '#';
    }
    
    // Get the display text for a breadcrumb (handles both string and object)
    function getBreadcrumbText(breadcrumb) {
        return typeof breadcrumb === 'string' ? breadcrumb : (breadcrumb?.name || '');
    }
</script>
<div id="masthead">
    <span class="head">{ title }</span><span class="subhead">{subhead }</span>

    {#if breadcrumbs.length > 0}
      <ul class="breadcrumbs">
        {#each breadcrumbs as breadcrumb, i}
          <li>
            {#if i < breadcrumbs.length - 1 || (typeof breadcrumb === 'string' ? breadcrumb.toLowerCase() !== 'detalle' : getBreadcrumbText(breadcrumb).toLowerCase() !== 'detalle')}
              <a href={getBreadcrumbUrl(breadcrumb, i)} use:links>{getBreadcrumbText(breadcrumb)}</a>
            {:else}
              <span>{getBreadcrumbText(breadcrumb)}</span>
            {/if}
            {#if i < breadcrumbs.length - 1}
              <span> / </span>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <style>
    #masthead{
      position:relative;
    }
  </style>