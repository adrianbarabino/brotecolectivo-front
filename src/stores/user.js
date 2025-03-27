// stores/user.js
import { writable } from 'svelte/store';

export const user = writable({
    id: null,
  email: '',
  name: '',
  role: '',
  loggedIn: false
});

