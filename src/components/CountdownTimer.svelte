<script>
    import { onMount } from 'svelte';
    import dayjs from 'dayjs';
    import duration from 'dayjs/plugin/duration';
    dayjs.extend(duration);
  
    export let date = null;
  
    let countdown = {
      months: '0',
      days: '0',
      hours: '0',
      minutes: '0',
      seconds: '0'
    };
  
    let timer;
  
    function updateCountdown() {
      if (!date) return;
  
      const now = dayjs();
      const target = dayjs(date);
      const diff = Math.abs(target.diff(now));
      const dur = dayjs.duration(diff);
  
      countdown = {
        months: Math.floor(dur.asMonths()).toString().padStart(2, '0'),
        days: Math.floor(dur.days()).toString().padStart(2, '0'),
        hours: dur.hours().toString().padStart(2, '0'),
        minutes: dur.minutes().toString().padStart(2, '0'),
        seconds: dur.seconds().toString().padStart(2, '0')
      };
    }
  
    onMount(() => {
      updateCountdown();
      timer = setInterval(updateCountdown, 1000);
      return () => clearInterval(timer);
    });
  
    $: isFuture = dayjs().isBefore(date);
  </script>
  

  <div class="countdown-box">
    {#if +countdown.months > 0}    {#if isFuture}
    Faltan
  {:else}
    Pasaron
  {/if}
      <div class="unit">
        <div class="value">{countdown.months}</div>
        <div class="label">MESES</div>
      </div>
    {/if}
  
    <div class="unit">
      <div class="value">{countdown.days}</div>
      <div class="label">DÍAS</div>
    </div>
  
    <div class="unit">
      <div class="value">{countdown.hours}</div>
      <div class="label">HORAS</div>
    </div>
  
    {#if +countdown.months === 0}
      <div class="unit">
        <div class="value">{countdown.minutes}</div>
        <div class="label">MINUTOS</div>
      </div>
    {/if}
  
    {#if +countdown.months === 0 && +countdown.days === 0}
      <div class="unit">
        <div class="value">{countdown.seconds}</div>
        <div class="label">SEGUNDOS</div>
      </div>
    {/if}
  </div>
  
  
  <style>
    .countdown-box {
      background: rgb(67, 67, 67);
      padding: 1rem 1.5rem;
      border-radius: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
  
    .unit {
      text-align: center;
      min-width: 60px;
    }
  
    .value {
      font-size: 2rem;
      font-weight: bold;
      color: #b7ff44;
    }
  
    .label {
      font-size: 0.85rem;
      color: #ccc;
      margin-top: 0.2rem;
      letter-spacing: 1px;
    }
  
    .countdown-text {
      text-align: center;
      font-size: 1.1rem;
      font-weight: 500;
      margin: 1rem 0 1rem;
      color: #333;
    }
  
    @media (max-width: 600px) {
      .value {
        font-size: 1.5rem;
      }
  
      .label {
        font-size: 0.75rem;
      }
  
      .countdown-box {
        gap: 1rem;
        padding: 0.75rem;
      }
    }
  </style>
  