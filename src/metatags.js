import { SITE_URL } from './config.js';

export const metatags = {
    default: {
      title: "Brote Colectivo",
      description: "Brote Colectivo es un espacio cultural en linea, donde las bandas locales tendrán un espacio para mostrar su música, y los artistas locales tendrán un espacio para mostrar su arte.",
      openGraph: {
        title: "Brote Colectivo",
        description: "Explorá la cultura independiente en un solo lugar.",
        url: `${SITE_URL}/`,
        image: `${SITE_URL}/img/rrss.jpg`,
        type: "website",
        locale: "es_ES",
      },
      twitter: {
        card: "summary_large_image",
        title: "Brote Colectivo",
        description: "Cultura viva y colaborativa.",
        image: `${SITE_URL}/img/rrss.jpg`,
      },
    },
  
    home: {
      title: "Brote Colectivo",
      description: "Noticias y novedades del movimiento artístico independiente.",
      openGraph: {
        title: "Inicio | Brote Colectivo",
        description: "Lo último del arte y la cultura independiente.",
        url: `${SITE_URL}/`,
        image: `${SITE_URL}/img/rrss.jpg`,
      },
      twitter: {
        title: "Inicio | Brote Colectivo",
        description: "Novedades y cultura al alcance de todos.",
        image: `${SITE_URL}/img/rrss.jpg`,
      },
    },
  
    artists: {
      title: "Artistas | Brote Colectivo",
      description: "Conocé a los artistas independientes que forman parte de nuestra localidad.",
      openGraph: {
        title: "Artistas | Brote Colectivo",
        description: "Explorá el talento emergente.",
        url: `${SITE_URL}/artists`,
        image: `${SITE_URL}/img/rrss.jpg`,
      },
      twitter: {
        title: "Artistas | Brote Colectivo",
        description: "Mirá quiénes hacen vibrar la escena cultural.",
        image: `${SITE_URL}/img/rrss.jpg`,
      },
    },
  
    venues: {
      title: "Espacios Culturales | Brote Colectivo",
      description: "Descubrí los espacios donde la cultura florece.",
      openGraph: {
        title: "Espacios Culturales | Brote Colectivo",
        description: "Teatro, música, arte y más.",
        url: `${SITE_URL}/venues`,
        image: `${SITE_URL}/img/rrss.jpg`,
      },
      twitter: {
        title: "Espacios Culturales | Brote Colectivo",
        description: "Lugares que albergan el arte independiente.",
        image: `${SITE_URL}/img/rrss.jpg`,
      },
    },
  
    events: {
      title: "Agenda Cultural | Brote Colectivo",
      description: "Enterate de todos los eventos y actividades.",
      openGraph: {
        title: "Agenda Cultural | Brote Colectivo",
        description: "Tu guía cultural diaria.",
        url: `${SITE_URL}/events`,
        image: `${SITE_URL}/img/rrss.jpg`,
      },
      twitter: {
        title: "Agenda Cultural | Brote Colectivo",
        description: "No te pierdas ningún evento.",
        image: `${SITE_URL}/img/rrss.jpg`,
      },
    },
  
    login: {
      title: "Iniciar sesión | Brote Colectivo",
      description: "Accedé a tu cuenta para gestionar contenido.",
      openGraph: {
        title: "Iniciar sesión | Brote Colectivo",
        description: "Entrá y gestioná tu perfil y tus contenidos.",
        url: `${SITE_URL}/login`,
        image: `${SITE_URL}/img/rrss.jpg`,
      },
      twitter: {
        title: "Iniciar sesión | Brote Colectivo",
        description: "Accedé con tu cuenta.",
        image: `${SITE_URL}/img/rrss.jpg`,
      },
    },
  
    panel: {
      title: "Panel de Usuario | Brote Colectivo",
      description: "Administrá tus eventos, noticias y perfil.",
      openGraph: {
        title: "Panel de Usuario | Brote Colectivo",
        description: "Tu espacio para gestionar tu arte.",
        url: `${SITE_URL}/panel`,
        image: `${SITE_URL}/img/rrss.jpg`,
      },
      twitter: {
        title: "Panel de Usuario | Brote Colectivo",
        description: "Gestión completa de tu presencia en la plataforma.",
        image: `${SITE_URL}/img/rrss.jpg`,
      },
    },
  };

// Función para generar metadatos dinámicos para artistas
export function generateArtistMetatags(artist) {
  if (!artist) return metatags.artists;
  
  return {
    title: `${artist.name} | Brote Colectivo`,
    description: artist.bio ? (artist.bio.substring(0, 160) + (artist.bio.length > 160 ? '...' : '')) : `Perfil del artista ${artist.name}`,
    openGraph: {
      title: `${artist.name} | Brote Colectivo`,
      description: artist.bio ? (artist.bio.substring(0, 160) + (artist.bio.length > 160 ? '...' : '')) : `Perfil del artista ${artist.name}`,
      url: `${SITE_URL}/artistas/${artist.id || artist.slug}`,
      image: artist.image || `${SITE_URL}/img/rrss.jpg`,
      type: 'profile',
      locale: 'es_ES',
    },
    twitter: {
      card: "summary_large_image",
      title: `${artist.name} | Brote Colectivo`,
      description: artist.bio ? (artist.bio.substring(0, 160) + (artist.bio.length > 160 ? '...' : '')) : `Perfil del artista ${artist.name}`,
      image: artist.image || `${SITE_URL}/img/rrss.jpg`,
    }
  };
}

// Función para generar metadatos dinámicos para eventos
export function generateEventMetatags(event) {
  if (!event) return metatags.events;
  
  return {
    title: `${event.title} | Brote Colectivo`,
    description: event.description ? (event.description.substring(0, 160) + (event.description.length > 160 ? '...' : '')) : `Evento cultural: ${event.title}`,
    openGraph: {
      title: `${event.title} | Brote Colectivo`,
      description: event.description ? (event.description.substring(0, 160) + (event.description.length > 160 ? '...' : '')) : `Evento cultural: ${event.title}`,
      url: `${SITE_URL}/agenda-cultural/${event.slug}`,
      image: event.image || `${SITE_URL}/img/rrss.jpg`,
      type: 'event',
      locale: 'es_ES',
      startTime: event.startDate,
      endTime: event.endDate,
      location: event.location
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.title} | Brote Colectivo`,
      description: event.description ? (event.description.substring(0, 160) + (event.description.length > 160 ? '...' : '')) : `Evento cultural: ${event.title}`,
      image: event.image || `${SITE_URL}/img/rrss.jpg`,
    }
  };
}

// Función para generar metadatos dinámicos para noticias
export function generateNewsMetatags(news) {
  if (!news) return metatags.default;
  
  return {
    title: `${news.title} | Brote Colectivo`,
    description: news.content ? (news.content.substring(0, 160) + (news.content.length > 160 ? '...' : '')) : `Noticia cultural: ${news.title}`,
    openGraph: {
      title: `${news.title} | Brote Colectivo`,
      description: news.content ? (news.content.substring(0, 160) + (news.content.length > 160 ? '...' : '')) : `Noticia cultural: ${news.title}`,
      url: `${SITE_URL}/noticias/${news.slug}`,
      image: news.image || `${SITE_URL}/img/rrss.jpg`,
      type: 'article',
      locale: 'es_ES',
      publishedTime: news.publishedAt,
      author: news.author
    },
    twitter: {
      card: "summary_large_image",
      title: `${news.title} | Brote Colectivo`,
      description: news.content ? (news.content.substring(0, 160) + (news.content.length > 160 ? '...' : '')) : `Noticia cultural: ${news.title}`,
      image: news.image || `${SITE_URL}/img/rrss.jpg`,
    }
  };
}

// Función para generar metadatos dinámicos para espacios culturales
export function generateVenueMetatags(venue) {
  if (!venue) return metatags.venues;
  
  return {
    title: `${venue.name} | Brote Colectivo`,
    description: venue.description ? (venue.description.substring(0, 160) + (venue.description.length > 160 ? '...' : '')) : `Espacio cultural: ${venue.name}`,
    openGraph: {
      title: `${venue.name} | Brote Colectivo`,
      description: venue.description ? (venue.description.substring(0, 160) + (venue.description.length > 160 ? '...' : '')) : `Espacio cultural: ${venue.name}`,
      url: `${SITE_URL}/espacios/${venue.slug || venue.id}`,
      image: venue.image || `${SITE_URL}/img/rrss.jpg`,
      type: 'place',
      locale: 'es_ES',
      location: venue.address,
      latitude: venue.latitude,
      longitude: venue.longitude
    },
    twitter: {
      card: "summary_large_image",
      title: `${venue.name} | Brote Colectivo`,
      description: venue.description ? (venue.description.substring(0, 160) + (venue.description.length > 160 ? '...' : '')) : `Espacio cultural: ${venue.name}`,
      image: venue.image || `${SITE_URL}/img/rrss.jpg`,
    }
  };
}

export function applyMetatags(key = 'default', data = null) {
  let tag;
  
  // Si se proporciona data, generar metadatos dinámicos según el tipo de ruta
  if (data) {
    switch(key) {
      case 'artist':
        tag = generateArtistMetatags(data);
        break;
      case 'event':
        tag = generateEventMetatags(data);
        break;
      case 'news':
        tag = generateNewsMetatags(data);
        break;
      case 'venue':
        tag = generateVenueMetatags(data);
        break;
      default:
        tag = metatags[key] || metatags.default;
    }
  } else {
    // Si no hay data, usar los metadatos estáticos
    tag = metatags[key] || metatags.default;
  }

  document.title = tag.title;

  setMetaTag('description', tag.description);
  setMetaTag('og:title', tag.openGraph?.title);
  setMetaTag('og:description', tag.openGraph?.description);
  setMetaTag('og:url', tag.openGraph?.url);
  setMetaTag('og:image', tag.openGraph?.image);
  setMetaTag('og:type', tag.openGraph?.type || 'website');
  setMetaTag('og:locale', tag.openGraph?.locale || 'es_ES');
  
  // Metadatos adicionales para eventos
  if (tag.openGraph?.type === 'event') {
    if (tag.openGraph.startTime) setMetaTag('og:start_time', tag.openGraph.startTime);
    if (tag.openGraph.endTime) setMetaTag('og:end_time', tag.openGraph.endTime);
    if (tag.openGraph.location) setMetaTag('og:location', tag.openGraph.location);
  }
  
  // Metadatos adicionales para artículos
  if (tag.openGraph?.type === 'article') {
    if (tag.openGraph.publishedTime) setMetaTag('article:published_time', tag.openGraph.publishedTime);
    if (tag.openGraph.author) setMetaTag('article:author', tag.openGraph.author);
  }
  
  // Metadatos adicionales para lugares
  if (tag.openGraph?.type === 'place') {
    if (tag.openGraph.location) setMetaTag('place:location:latitude', tag.openGraph.latitude);
    if (tag.openGraph.longitude) setMetaTag('place:location:longitude', tag.openGraph.longitude);
  }

  setMetaTag('twitter:card', tag.twitter?.card || 'summary_large_image');
  setMetaTag('twitter:title', tag.twitter?.title);
  setMetaTag('twitter:description', tag.twitter?.description);
  setMetaTag('twitter:image', tag.twitter?.image);
}

function setMetaTag(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    if (name.startsWith('og:') || name.startsWith('twitter:') || name.startsWith('article:') || name.startsWith('place:')) {
      el.setAttribute('property', name);
    } else {
      el.setAttribute('name', name);
    }
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

// Función para limpiar texto HTML y limitar longitud
export function sanitizeDescription(text, maxLength = 160) {
  if (!text) return '';
  // Eliminar etiquetas HTML
  const sanitized = text.replace(/<\/?[^>]+(>|$)/g, '');
  // Limitar longitud
  return sanitized.length > maxLength ? sanitized.substring(0, maxLength) + '...' : sanitized;
}