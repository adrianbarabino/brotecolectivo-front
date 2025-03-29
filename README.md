# 🎶 Brote Colectivo - Plataforma de difusión cultural

Este es el frontend de **Brote Colectivo**, un sitio web para la difusión de artistas, espacios culturales, noticias y eventos de la provincia de Santa Cruz, Argentina. Desarrollado en **Svelte** con un estilo moderno y adaptable, consume una API REST construida en Go (Golang).

---

## 🧰 Tecnologías usadas

- [Svelte](https://svelte.dev/) – Framework frontend
- [svelte-routing](https://github.com/EmilTholin/svelte-routing) – Enrutamiento
- [Leaflet](https://leafletjs.com/) – Mapas interactivos
- HTML + CSS
- Fetch con caching para mejorar rendimiento
- JWT Authentication
- Sistema de prerrenderizado para SEO y OpenGraph

---

## 🚀 Instalación y desarrollo local

```bash
git clone https://github.com/tuusuario/brotecolectivo-front.git
cd brotecolectivo-front
npm install
npm run dev
```

Para compilar la aplicación para producción:

```bash
npm run build
```

## 📁 Estructura del proyecto

```
src/
│
├── components/          # Componentes reutilizables (Navbar, Player, etc.)
├── routes/              # Páginas principales y admin
│   ├── admin/           # Panel de administración
│   │   ├── Artists/     # Gestión de artistas
│   │   ├── Events/      # Gestión de eventos
│   │   ├── News/        # Gestión de noticias
│   │   ├── Submissions/ # Gestión de colaboraciones
│   │   └── Users/       # Gestión de usuarios
│   └── ...              # Páginas públicas (Home, ArtistDetail, etc.)
├── stores/              # Stores Svelte (user.js, url.js)
├── utils/               # Utilidades (fetchWithCache.js)
├── App.svelte           # Componente principal y rutas
├── main.js              # Punto de entrada
└── metatags.js          # Sistema de metatags dinámicos
```

## 🔍 Sistema de SEO y OpenGraph

La aplicación implementa una solución para el problema de SEO en SPAs mediante:

1. **Sistema de metatags dinámicos**: El archivo `metatags.js` permite generar dinámicamente metadatos OpenGraph y Twitter Cards para cada página.

2. **Prerrenderizado para crawlers**: Mediante un sistema de detección de bots en `.htaccess` y un script PHP (`prerender.php`), se sirven versiones estáticas con metadatos apropiados a los crawlers de redes sociales y motores de búsqueda.

### Cómo funciona el sistema de metatags

```javascript
// Ejemplo de uso en una página de artista
import { applyMetatags } from '../../metatags.js';

// En el onMount o cuando carguen los datos
applyMetatags({
  title: `${artist.name} - Brote Colectivo`,
  description: artist.bio.substring(0, 160),
  image: `https://brotecolectivo.com/img/artists/${artist.slug}.jpg`,
  type: 'profile',
  url: `https://brotecolectivo.com/artist/${artist.slug}`
});
```

## 🔐 Autenticación

El sistema utiliza autenticación JWT con roles (admin, editor, user) y soporte para múltiples proveedores de autenticación.

## 📱 Responsive Design

La interfaz está completamente adaptada para dispositivos móviles, tablets y escritorio, garantizando una experiencia de usuario óptima en cualquier tamaño de pantalla.

## 🌐 Despliegue

La aplicación está configurada para desplegarse en un hosting compartido con cPanel:

1. Compilar con `npm run build`
2. Subir el contenido de la carpeta `public` al directorio raíz del hosting
3. Asegurarse de que el archivo `.htaccess` esté correctamente configurado para el enrutamiento y el sistema de prerrenderizado

## 👨‍💻 Colaboración

¿Querés contribuir al proyecto? ¡Genial! Seguí estos pasos:

1. Hacé un fork del repositorio
2. Creá una nueva rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commiteá tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Pusheá a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrí un Pull Request

---

Desarrollado con ❤️ por el equipo de Brote Colectivo
