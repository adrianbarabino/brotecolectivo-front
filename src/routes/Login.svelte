<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing'; // ✅ usamos svelte-routing
  
    let username = '';
    let password = '';
    let error = '';
  
    const API = 'https://api.brotecolectivo.com';
  
    async function handleLogin() {
      error = '';
      try {
        const res = await fetch(`${API}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
  
        if (!res.ok) throw new Error('Credenciales inválidas');
  
        const data = await res.json();
        localStorage.setItem('token', data.token);
  
        navigate('/panel'); // ✅ redirigimos correctamente
      } catch (err) {
        error = err.message;
      }
    }
  </script>
  
  <style>
    .login-container {
      max-width: 400px;
      margin: 4rem auto;
      padding: 2rem;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
  
    input {
      width: 100%;
      padding: 0.75rem;
      margin-bottom: 1rem;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 6px;
    }
  
    button {
      width: 100%;
      background: #007bff;
      color: white;
      border: none;
      padding: 0.75rem;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
    }
  
    button:hover {
      background: #0056b3;
    }
  
    .error {
      color: red;
      margin-bottom: 1rem;
      text-align: center;
    }
  </style>
  
  <div class="login-container">
    <h2>Iniciar sesión</h2>
    {#if error}
      <div class="error">{error}</div>
    {/if}
    <input type="text" placeholder="Usuario" bind:value={username} />
    <input type="password" placeholder="Contraseña" bind:value={password} />
    <button on:click={handleLogin}>Entrar</button>
  </div>
  