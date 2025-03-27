<script>
        export let asideClass = 'col-md-4';


    import RandomBand from './RandomBand.svelte';
    import UpcomingEvents from './UpcomingEvents.svelte';
    import RandomVideo from './RandomVideo.svelte';
    
</script>
<aside class={asideClass}>
    <RandomBand />
    <UpcomingEvents />
    <RandomVideo />
  </aside>