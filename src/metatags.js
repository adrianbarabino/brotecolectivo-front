export const metatags = {
    default: {
      title: "Brote Colectivo",
      description: "Brote Colectivo es un espacio cultural en linea, donde las bandas locales tendrán un espacio para mostrar su música, y los artistas locales tendrán un espacio para mostrar su arte.",
      openGraph: {
        title: "Brote Colectivo",
        description: "Explorá la cultura independiente en un solo lugar.",
        url: "https://brotecolectivo.com/",
        image: "https://brotecolectivo.com/logo.png",
        type: "website",
        locale: "es_ES",
      },
      twitter: {
        card: "summary_large_image",
        title: "Brote Colectivo",
        description: "Cultura viva y colaborativa.",
        image: "https://brotecolectivo.com/logo.png",
      },
    },
  
    home: {
      title: "Brote Colectivo",
      description: "Noticias y novedades del movimiento artístico independiente.",
      openGraph: {
        title: "Inicio | Brote Colectivo",
        description: "Lo último del arte y la cultura independiente.",
        url: "https://brotecolectivo.com/",
        image: "https://brotecolectivo.com/logo.png",
      },
      twitter: {
        title: "Inicio | Brote Colectivo",
        description: "Novedades y cultura al alcance de todos.",
        image: "https://brotecolectivo.com/logo.png",
      },
    },
  
    artists: {
      title: "Artistas | Brote Colectivo",
      description: "Conocé a los artistas independientes que forman parte de nuestra localidad.",
      openGraph: {
        title: "Artistas | Brote Colectivo",
        description: "Explorá el talento emergente.",
        url: "https://brotecolectivo.com/artists",
        image: "https://brotecolectivo.com/logo.png",
      },
      twitter: {
        title: "Artistas | Brote Colectivo",
        description: "Mirá quiénes hacen vibrar la escena cultural.",
        image: "https://brotecolectivo.com/logo.png",
      },
    },
  
    venues: {
      title: "Espacios Culturales | Brote Colectivo",
      description: "Descubrí los espacios donde la cultura florece.",
      openGraph: {
        title: "Espacios Culturales | Brote Colectivo",
        description: "Teatro, música, arte y más.",
        url: "https://brotecolectivo.com/venues",
        image: "https://brotecolectivo.com/logo.png",
      },
      twitter: {
        title: "Espacios Culturales | Brote Colectivo",
        description: "Lugares que albergan el arte independiente.",
        image: "https://brotecolectivo.com/logo.png",
      },
    },
  
    events: {
      title: "Agenda Cultural | Brote Colectivo",
      description: "Enterate de todos los eventos y actividades.",
      openGraph: {
        title: "Agenda Cultural | Brote Colectivo",
        description: "Tu guía cultural diaria.",
        url: "https://brotecolectivo.com/events",
        image: "https://brotecolectivo.com/logo.png",
      },
      twitter: {
        title: "Agenda Cultural | Brote Colectivo",
        description: "No te pierdas ningún evento.",
        image: "https://brotecolectivo.com/logo.png",
      },
    },
  
    login: {
      title: "Iniciar sesión | Brote Colectivo",
      description: "Accedé a tu cuenta para gestionar contenido.",
      openGraph: {
        title: "Iniciar sesión | Brote Colectivo",
        description: "Entrá y gestioná tu perfil y tus contenidos.",
        url: "https://brotecolectivo.com/login",
        image: "https://brotecolectivo.com/logo.png",
      },
      twitter: {
        title: "Iniciar sesión | Brote Colectivo",
        description: "Accedé con tu cuenta.",
        image: "https://brotecolectivo.com/logo.png",
      },
    },
  
    panel: {
      title: "Panel de Usuario | Brote Colectivo",
      description: "Administrá tus eventos, noticias y perfil.",
      openGraph: {
        title: "Panel de Usuario | Brote Colectivo",
        description: "Tu espacio para gestionar tu arte.",
        url: "https://brotecolectivo.com/panel",
        image: "https://brotecolectivo.com/logo.png",
      },
      twitter: {
        title: "Panel de Usuario | Brote Colectivo",
        description: "Gestión completa de tu presencia en la plataforma.",
        image: "https://brotecolectivo.com/logo.png",
      },
    },
  };

 export function applyMetatags(key = 'default') {
    const tag = metatags[key] || metatags.default;
  
    document.title = tag.title;
  
    setMetaTag('description', tag.description);
    setMetaTag('og:title', tag.openGraph?.title);
    setMetaTag('og:description', tag.openGraph?.description);
    setMetaTag('og:url', tag.openGraph?.url);
    setMetaTag('og:image', tag.openGraph?.image);
    setMetaTag('og:type', tag.openGraph?.type || 'website');
    setMetaTag('og:locale', tag.openGraph?.locale || 'es_ES');
  
    setMetaTag('twitter:card', tag.twitter?.card);
    setMetaTag('twitter:title', tag.twitter?.title);
    setMetaTag('twitter:description', tag.twitter?.description);
    setMetaTag('twitter:image', tag.twitter?.image);
  }
  
  function setMetaTag(name, content) {
    if (!content) return;
    let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      if (name.startsWith('og:') || name.startsWith('twitter:')) {
        el.setAttribute('property', name);
      } else {
        el.setAttribute('name', name);
      }
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }
  