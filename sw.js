// sw.js

// Altere a versão do cache para forçar a atualização quando você mudar os arquivos
const CACHE_NAME = 'gerenciador-transporte-v2'; 

// Adicione todos os ícones e a página principal ao cache
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  // IMPORTANTE: Adicione aqui os outros ícones que você listou no manifest.json
  // '/icon-192.png',
  // '/icon-512.png',
  // '/maskable-icon.png'
];

// Evento de instalação: abre o cache e adiciona os arquivos principais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cache aberto. Adicionando URLs ao cache.');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Evento de ativação: limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

// Evento de fetch: serve os arquivos do cache primeiro, se disponíveis
self.addEventListener('fetch', event => {
  // Ignora requisições que não são GET (ex: API do Supabase)
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Se o recurso estiver no cache, retorna ele
      if (cachedResponse) {
        return cachedResponse;
      }

      // Se não, busca na rede
      return fetch(event.request);
    })
  );
});