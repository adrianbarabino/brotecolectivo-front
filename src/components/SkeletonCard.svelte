<script>
    export let lines = 3;
  </script>
  
  <style>
    .skeleton {
      background: #fff;
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      animation: pulse 1.5s infinite;
    }
  
    .skeleton-line {
      height: 14px;
      border-radius: 6px;
      background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.2s infinite;
    }
  
    .skeleton-title {
      height: 20px;
      width: 60%;
      margin-bottom: 0.5rem;
    }
  
    .skeleton-line:nth-child(2) { width: 90%; }
    .skeleton-line:nth-child(3) { width: 80%; }
  
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  </style>
  
  <div class="skeleton">
    <div class="skeleton-line skeleton-title"></div>
    {#each Array(lines) as _, i}
      <div class="skeleton-line" style="width: {80 - i * 10}%"></div>
    {/each}
  </div>
  