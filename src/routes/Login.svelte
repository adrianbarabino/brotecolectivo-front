<script>
  import Header from '../components/Header.svelte';
  import Swal from 'sweetalert2';

  import Sidebar from '../components/Sidebar.svelte';
  import { user } from '../stores/user.js';
  import { navigate } from 'svelte-routing';
  import { PublicClientApplication } from '@azure/msal-browser';
  import { API, TOKEN, MEDIA_URL } from '../config.js';

  import { onMount } from 'svelte';

  onMount(() => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: "382515905376-8bk2lapo9fhhi6n1vghe4ubkngdpcm3o.apps.googleusercontent.com",
        callback: handleGoogleResponse
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "outline", size: "large", shape: "pill", text: "signin_with", logo_alignment: "left" }
      );
    }
  });
  let email = '';
  let name = '';
  let password = '';
  let isRegistering = false;

  let provider = 'email';

  const msalInstance = new PublicClientApplication({
    auth: {
      clientId: 'dfe94ad3-7ac2-4eaf-b9b5-04068159b0c0',
      authority: 'https://login.microsoftonline.com/common',
      redirectUri: window.location.origin + '/login'
    }
  });

  let msalReady = false;

  // Inicializar MSAL
  msalInstance.initialize().then(() => {
    msalReady = true;
  });

  async function loginWithMicrosoft() {
    if (!msalReady) {
  await Swal.fire({
    icon: 'info',
    title: 'Esperá un toque...',
    text: 'MSAL todavía se está cargando, intentá en un segundo.'
  });
  return;
}


    try {
      const loginResponse = await msalInstance.loginPopup({
        scopes: ['user.read', 'openid', 'profile', 'email']
      });

      const account = loginResponse.account;
      const idToken = loginResponse.idToken;
      const email = account.username;
      const name = account.name;

      const res = await fetch( `${API}/auth/provider-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          provider: 'microsoft',
          token: idToken
        })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('access_token', data.token);
        user.set({
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          loggedIn: true
        });
        navigate('/');
      } else {
        await Swal.fire({
  icon: 'error',
  title: 'Error',
  text: 'No se pudo iniciar sesión con Microsoft.'
});
      }
    } catch (err) {
      console.error('Error MS login:', err);
      await Swal.fire({
  icon: 'error',
  title: 'Error',
  text: 'No se pudo iniciar sesión con Microsoft.'
});
    }
  }
  async function login() {
    const res = await fetch( `${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('access_token', data.token);
      user.update(u => ({ ...u })); // fuerza actualización del store reactivo

      user.set({
        id: data.id,
  email: data.email,
  name: data.name,
  role: data.role,
  loggedIn: true
});      navigate('/');
    } else {
      await Swal.fire({
  icon: 'error',
  title: 'Oops...',
  text: 'Email o contraseña incorrectos.'
});

    }
  }

  async function register() {
  const res = await fetch(`${API}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username: email, realName: name, password })
  });

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem('access_token', data.token);
    user.set({ email: data.email, name });

    await Swal.fire({
      icon: 'success',
      title: '¡Registro exitoso!',
      text: 'Ya podés iniciar sesión con tu cuenta.',
      confirmButtonText: 'Ir al login'
    });

    isRegistering = false; // volvemos al modo login
    navigate('/login');
  } else {
    const error = await res.text();
    Swal.fire({
      icon: 'error',
      title: 'Error al registrarse',
      text: error
    });
  }
}



  async function loginWithProvider(providerName) {
    provider = providerName;
    const res = await fetch( `${API}/auth/provider-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, provider, token: '' })
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('access_token', data.token);
      user.update(u => ({ ...u })); // fuerza actualización del store reactivo

      user.set({
        id: data.id,
  email: data.email,
  name: data.name,
  role: data.role,
  loggedIn: true
});

      navigate('/');
    } else {
      await Swal.fire({
  icon: 'error',
  title: 'Error',
  text: `No se pudo iniciar sesión con ${providerName}.`
});

    }
  }

  function toggleForm() {
    isRegistering = !isRegistering;
  }
  function decodeJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

window.handleGoogleResponse = async (response) => {
  const idToken = response.credential;
  const payload = decodeJwt(idToken);
  console.log(payload);

  const email = payload.email;
  let name = payload.name;
  // sanitize name because á appears wrong

  const res = await fetch( `${API}/auth/provider-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, provider: 'google', token: idToken })
  });

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem('access_token', data.token);
    user.set({
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      loggedIn: true
    });
    navigate('/');
  } else {
    await Swal.fire({
  icon: 'error',
  title: 'Error',
  text: 'No se pudo iniciar sesión con Google.'
});

  }
};

</script>
<Header title="Iniciar sesión" subhead="Ingresá con tu cuenta" />
<section class="container row">
  <div class="col-md-8">
    <div class="card p-4 border-0 shadow-sm" style="width: 100%;">
      <h2 class="text-center mb-4">{isRegistering ? 'Registrarse' : 'Iniciar sesión'}</h2>
  
      <form on:submit|preventDefault={isRegistering ? register : login}>
        <div class="mb-3">
          <input type="email" class="form-control" bind:value={email} placeholder="Email" required />
        </div>
  
        {#if isRegistering}
          <div class="mb-3">
            <input type="text" class="form-control" bind:value={name} placeholder="Nombre completo" required />
          </div>
        {/if}
  
        <div class="mb-3">
          <input type="password" class="form-control" bind:value={password} placeholder="Contraseña" required />
        </div>
  
        <button type="submit" class="btn btn-primary w-100 mb-3">
          {isRegistering ? 'Registrarse' : 'Iniciar sesión'}
        </button>
      </form>
  
      <div class="text-center mb-3">O accedé con:</div>
  
      <div class="d-flex justify-content-center gap-2 mb-3">
        <div id="googleSignInDiv"></div>
        <button class="btn btn-outline-secondary rounded-pill border-light shadow-sm" on:click={loginWithMicrosoft}> <i class="fab fa-microsoft"></i> Microsoft</button>
      </div>
  
      <p class="text-center">
        {#if isRegistering}
          ¿Ya tenés cuenta? <a href="#" on:click|preventDefault={toggleForm}>Iniciá sesión</a>
        {:else}
          ¿No tenés cuenta? <a href="#" on:click|preventDefault={toggleForm}>Registrate</a>
        {/if}
      </p>
    </div>


  

</div>
<Sidebar />
</section>
