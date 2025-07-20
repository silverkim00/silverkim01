// 간단한 Service Worker
const CACHE_NAME = 'company-app-v1';

// 설치 이벤트
self.addEventListener('install', function(event) {
  console.log('Service Worker 설치됨');
  self.skipWaiting();
});

// 활성화 이벤트
self.addEventListener('activate', function(event) {
  console.log('Service Worker 활성화됨');
  event.waitUntil(self.clients.claim());
});

// 요청 가로채기 (일단 기본만)
self.addEventListener('fetch', function(event) {
  // 간단하게 네트워크 요청만 통과
  event.respondWith(fetch(event.request));
});