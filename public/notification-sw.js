// Service Worker for push notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, badge, tag } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: icon || '/coding.png',
      badge: badge || '/coding.png',
      tag: tag || 'app-reminder',
      requireInteraction: true,
      vibrate: [200, 100, 200],
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});
