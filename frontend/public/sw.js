const CACHE_NAME = 'nonhyeon-life-v1.1.0';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// 캐시할 정적 파일들
const STATIC_FILES = [
  '/',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/og-image.jpg',
  '/site.webmanifest'
];

// 캐시할 API 엔드포인트들
const API_ENDPOINTS = [
  '/api/news',
  '/api/weather',
  '/api/medical',
  '/api/subway',
  '/api/stats',
  '/api/sync'
];

// Service Worker 설치
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker 설치 중...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 정적 파일 캐시 중...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker 설치 완료');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker 설치 실패:', error);
      })
  );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker 활성화 중...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ 이전 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker 활성화 완료');
        return self.clients.claim();
      })
  );
});

// 네트워크 요청 인터셉트
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청 처리 (Cache First with Network Fallback)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                // 백그라운드에서 업데이트
                fetch(request)
                  .then((response) => {
                    if (response.ok) {
                      cache.put(request, response.clone());
                    }
                  })
                  .catch(() => {
                    // 네트워크 오류 무시
                  });
                
                return cachedResponse;
              }
              
              // 캐시에 없으면 네트워크에서 가져오기
              return fetch(request)
                .then((response) => {
                  if (response.ok) {
                    cache.put(request, response.clone());
                  }
                  return response;
                })
                .catch(() => {
                  // 오프라인 시 기본 응답
                  return new Response(
                    JSON.stringify({
                      success: false,
                      error: '오프라인 상태입니다. 인터넷 연결을 확인해주세요.',
                      offline: true
                    }),
                    {
                      status: 503,
                      headers: { 'Content-Type': 'application/json' }
                    }
                  );
                });
            });
        })
    );
    return;
  }

  // HTML 파일 처리 (Network First - 항상 최신 버전 확인)
  if (request.method === 'GET' && request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            // 성공적인 응답은 캐시에 저장
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
            return response;
          }
          throw new Error('Network response was not ok');
        })
        .catch(() => {
          // 네트워크 실패 시 캐시된 버전 사용
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('🔄 오프라인: 캐시된 HTML 사용');
                return cachedResponse;
              }
              // 캐시도 없으면 메인 페이지
              return caches.match('/');
            });
        })
    );
    return;
  }

  // 기타 정적 파일 처리 (Cache First - CSS, JS, 이미지 등)
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              // 성공적인 응답만 캐시
              if (response.ok && response.type === 'basic') {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            })
            .catch(() => {
              // 정적 파일이 캐시에도 없고 네트워크도 안 되면 null
              return null;
            });
        })
    );
  }
});

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  console.log('🔄 백그라운드 동기화:', event.tag);
  
  if (event.tag === 'news-sync') {
    event.waitUntil(syncNewsData());
  }
});

// 푸시 알림 수신
self.addEventListener('push', (event) => {
  console.log('📲 푸시 알림 수신:', event);
  
  const options = {
    body: event.data ? event.data.text() : '새로운 소식이 있습니다!',
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    tag: 'news-notification',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: '확인하기',
        icon: '/android-chrome-192x192.png'
      },
      {
        action: 'close',
        title: '닫기'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('인천논현라이프', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 알림 클릭:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 뉴스 데이터 동기화 함수
async function syncNewsData() {
  try {
    const response = await fetch('/api/news?limit=50');
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put('/api/news', response.clone());
      console.log('✅ 뉴스 데이터 동기화 완료');
    }
  } catch (error) {
    console.error('❌ 뉴스 데이터 동기화 실패:', error);
  }
}

// 메시지 수신 처리
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 