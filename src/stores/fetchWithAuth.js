// utils/fetchWithAuth.js
export async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('access_token');
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    });
  }
  