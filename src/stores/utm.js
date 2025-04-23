import { writable } from 'svelte/store';

export const utm = writable({
	source: null,
	medium: null,
	campaign: null,
	term: null,
	content: null
});
