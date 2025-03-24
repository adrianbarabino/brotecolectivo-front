const cache = new Map();

export async function fetchWithCache(key, url, options = {}) {
  if (cache.has(key)) {
    return cache.get(key);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Error al obtener ${key}`);
  }

  const data = await response.json();
  cache.set(key, data);
  return data;
}
