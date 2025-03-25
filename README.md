# 🎶 Brote Colectivo - Plataforma de difusión cultural

Este es el frontend de **Brote Colectivo**, un sitio web para la difusión de artistas, espacios culturales, noticias y eventos de la provincia de Santa Cruz, Argentina. Desarrollado en **Svelte** con un estilo moderno y adaptable, consume una API REST construida en Go (Golang).

---

## 🧰 Tecnologías usadas

- [Svelte](https://svelte.dev/) – Framework frontend
- [svelte-routing](https://github.com/EmilTholin/svelte-routing) – Enrutamiento
- [Leaflet](https://leafletjs.com/) – Mapas interactivos para venues
- HTML + CSS moderno (con Skeleton Loaders personalizados)
- Fetch con caching simple para mejorar rendimiento
- JWT Authentication (frontend login básico)

---

## 🚀 Instalación

```bash
git clone https://github.com/tuusuario/brotecolectivo-front.git
cd brotecolectivo-front
npm install
npm run dev
```

## Estructura del proyecto

```
src/
│
├── components/          # Navbar, SkeletonCard, etc
├── routes/              # Rutas: Home, Artists, Venues, Events, Panel, Login
├── stores/              # Store reactivo para la URL
├── utils/               # fetchWithCache.js (para mejorar UX)
├── App.svelte           # Enrutador principal
├── main.js              # Entrada de la app
└── metatags.js          # Sistema de metatags dinámicos
```
