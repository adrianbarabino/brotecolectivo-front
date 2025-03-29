<?php
// Obtener la ruta solicitada
$path = isset($_GET['path']) ? $_GET['path'] : '';
if (empty($path)) $path = '/';

// Configuración del sitio
$siteUrl = 'https://www.brotecolectivo.com';
$apiUrl = 'https://api.brotecolectivo.com';
$defaultImage = $siteUrl . '/img/rrss.jpg';

// Definir metadatos por defecto
$metadata = [
    'title' => 'Brote Colectivo',
    'description' => 'Brote Colectivo es un espacio cultural en linea, donde las bandas locales tendrán un espacio para mostrar su música, y los artistas locales tendrán un espacio para mostrar su arte.',
    'image' => $defaultImage,
    'url' => $siteUrl . $path,
    'type' => 'website',
    'locale' => 'es_ES'
];

// Función para hacer peticiones a la API
function fetchFromApi($endpoint) {
    global $apiUrl;
    $ch = curl_init($apiUrl . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5); // Timeout de 5 segundos para no bloquear la página
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode == 200 && $response) {
        return json_decode($response, true);
    }
    return null;
}

// Determinar metadatos basados en la ruta
if (preg_match('/^\/artistas\/([^\/]+)$/', $path, $matches)) {
    $artistId = $matches[1];
    
    // Intentar obtener datos del artista desde la API
    $artistData = fetchFromApi("/artists/$artistId");
    
    if ($artistData) {
        $metadata = [
            'title' => $artistData['name'] . " | Brote Colectivo",
            'description' => isset($artistData['bio']) ? substr(strip_tags($artistData['bio']), 0, 160) . "..." : "Perfil del artista " . $artistData['name'],
            'image' => !empty($artistData['image']) ? $artistData['image'] : $defaultImage,
            'url' => $siteUrl . "/artistas/" . $artistId,
            'type' => 'profile',
            'locale' => 'es_ES'
        ];
    } else {
        // Fallback si no se puede acceder a la API
        $metadata['title'] = "Artista | Brote Colectivo";
        $metadata['description'] = "Perfil completo del artista con su música y eventos.";
        $metadata['url'] = $siteUrl . "/artistas/" . $artistId;
    }
} elseif (preg_match('/^\/agenda-cultural\/([^\/]+)$/', $path, $matches) || preg_match('/^\/eventos\/([^\/]+)$/', $path, $matches)) {
    $eventSlug = $matches[1];
    
    // Intentar obtener datos del evento desde la API
    $eventData = fetchFromApi("/events/$eventSlug");
    
    if ($eventData) {
        $metadata = [
            'title' => $eventData['title'] . " | Brote Colectivo",
            'description' => isset($eventData['description']) ? substr(strip_tags($eventData['description']), 0, 160) . "..." : "Detalles del evento cultural " . $eventData['title'],
            'image' => !empty($eventData['image']) ? $eventData['image'] : $defaultImage,
            'url' => $siteUrl . "/agenda-cultural/" . $eventSlug,
            'type' => 'event',
            'locale' => 'es_ES'
        ];
        
        // Añadir metadatos específicos para eventos si están disponibles
        if (isset($eventData['startDate'])) {
            $metadata['event:start_time'] = $eventData['startDate'];
        }
        if (isset($eventData['endDate'])) {
            $metadata['event:end_time'] = $eventData['endDate'];
        }
        if (isset($eventData['location'])) {
            $metadata['event:location'] = $eventData['location'];
        }
    } else {
        // Fallback si no se puede acceder a la API
        $metadata['title'] = "Evento Cultural | Brote Colectivo";
        $metadata['description'] = "Detalles completos del evento cultural.";
        $metadata['url'] = $siteUrl . "/agenda-cultural/" . $eventSlug;
    }
} elseif (preg_match('/^\/noticias\/([^\/]+)$/', $path, $matches)) {
    $newsSlug = $matches[1];
    
    // Intentar obtener datos de la noticia desde la API
    $newsData = fetchFromApi("/news/$newsSlug");
    
    if ($newsData) {
        $metadata = [
            'title' => $newsData['title'] . " | Brote Colectivo",
            'description' => isset($newsData['content']) ? substr(strip_tags($newsData['content']), 0, 160) . "..." : "Noticia cultural: " . $newsData['title'],
            'image' => !empty($newsData['image']) ? $newsData['image'] : $defaultImage,
            'url' => $siteUrl . "/noticias/" . $newsSlug,
            'type' => 'article',
            'locale' => 'es_ES'
        ];
        
        // Añadir metadatos específicos para artículos si están disponibles
        if (isset($newsData['publishedAt'])) {
            $metadata['article:published_time'] = $newsData['publishedAt'];
        }
        if (isset($newsData['author'])) {
            $metadata['article:author'] = $newsData['author'];
        }
    } else {
        // Fallback si no se puede acceder a la API
        $metadata['title'] = "Noticia Cultural | Brote Colectivo";
        $metadata['description'] = "Noticias y novedades del movimiento artístico independiente.";
        $metadata['url'] = $siteUrl . "/noticias/" . $newsSlug;
        $metadata['type'] = 'article';
    }
} elseif ($path == '/artists' || $path == '/artistas') {
    $metadata = [
        'title' => "Artistas | Brote Colectivo",
        'description' => "Conocé a los artistas independientes que forman parte de nuestra localidad.",
        'image' => $defaultImage,
        'url' => $siteUrl . "/artists",
        'type' => 'website',
        'locale' => 'es_ES'
    ];
} elseif ($path == '/events' || $path == '/eventos') {
    $metadata = [
        'title' => "Agenda Cultural | Brote Colectivo",
        'description' => "Enterate de todos los eventos y actividades.",
        'image' => $defaultImage,
        'url' => $siteUrl . "/events",
        'type' => 'website',
        'locale' => 'es_ES'
    ];
} elseif ($path == '/venues' || $path == '/espacios') {
    $metadata = [
        'title' => "Espacios Culturales | Brote Colectivo",
        'description' => "Descubrí los espacios donde la cultura florece.",
        'image' => $defaultImage,
        'url' => $siteUrl . "/venues",
        'type' => 'website',
        'locale' => 'es_ES'
    ];
}

// Generar HTML con los metadatos
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title><?php echo htmlspecialchars($metadata['title']); ?></title>
    <meta name="description" content="<?php echo htmlspecialchars($metadata['description']); ?>">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="<?php echo htmlspecialchars($metadata['type']); ?>">
    <meta property="og:url" content="<?php echo htmlspecialchars($metadata['url']); ?>">
    <meta property="og:title" content="<?php echo htmlspecialchars($metadata['title']); ?>">
    <meta property="og:description" content="<?php echo htmlspecialchars($metadata['description']); ?>">
    <meta property="og:image" content="<?php echo htmlspecialchars($metadata['image']); ?>">
    <meta property="og:locale" content="<?php echo htmlspecialchars($metadata['locale']); ?>">
    
    <?php if ($metadata['type'] == 'event' && isset($metadata['event:start_time'])): ?>
    <meta property="event:start_time" content="<?php echo htmlspecialchars($metadata['event:start_time']); ?>">
    <?php endif; ?>
    
    <?php if ($metadata['type'] == 'event' && isset($metadata['event:end_time'])): ?>
    <meta property="event:end_time" content="<?php echo htmlspecialchars($metadata['event:end_time']); ?>">
    <?php endif; ?>
    
    <?php if ($metadata['type'] == 'event' && isset($metadata['event:location'])): ?>
    <meta property="event:location" content="<?php echo htmlspecialchars($metadata['event:location']); ?>">
    <?php endif; ?>
    
    <?php if ($metadata['type'] == 'article' && isset($metadata['article:published_time'])): ?>
    <meta property="article:published_time" content="<?php echo htmlspecialchars($metadata['article:published_time']); ?>">
    <?php endif; ?>
    
    <?php if ($metadata['type'] == 'article' && isset($metadata['article:author'])): ?>
    <meta property="article:author" content="<?php echo htmlspecialchars($metadata['article:author']); ?>">
    <?php endif; ?>
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="<?php echo htmlspecialchars($metadata['url']); ?>">
    <meta property="twitter:title" content="<?php echo htmlspecialchars($metadata['title']); ?>">
    <meta property="twitter:description" content="<?php echo htmlspecialchars($metadata['description']); ?>">
    <meta property="twitter:image" content="<?php echo htmlspecialchars($metadata['image']); ?>">
    
    <!-- Redirección a la SPA después de que los crawlers lean los metadatos -->
    <meta http-equiv="refresh" content="0;url=<?php echo htmlspecialchars($metadata['url']); ?>">
    
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin: 50px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
        }
        p {
            color: #666;
        }
        .loader {
            border: 5px solid #f3f3f3;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 2s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1><?php echo htmlspecialchars($metadata['title']); ?></h1>
        <p><?php echo htmlspecialchars($metadata['description']); ?></p>
        <div class="loader"></div>
        <p>Redirigiendo a Brote Colectivo...</p>
    </div>
</body>
</html>