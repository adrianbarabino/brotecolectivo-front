<script>

    // we receive tree parameters
    // first the title
    // second the subhead
    // three the breadcrumbs array
    export let title = "Bienvenido a Brote Colectivo";
    export let subhead = "sitio de difusión cultural en Santa Cruz, Argentina";
    export let breadcrumbs = ["home", "bienvenido"];


</script>
<div id="masthead">
    <span class="head">{ title }</span><span class="subhead">{subhead }</span>

    {#if breadcrumbs.length > 0}
      <ul class="breadcrumbs">
        {#each breadcrumbs as breadcrumb, i}
          <li><a href="javascript:void(0)" id="bread{i+1}">{breadcrumb}</a> / </li>
        {/each}
      </ul>
    {/if}
  </div>