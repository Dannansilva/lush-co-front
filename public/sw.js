self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'Lush & Co';
  const options = {
    body: data.body || "Don't forget to mark your attendance!",
    icon: '/img/logo.png', // Fallback icon path (public/img/logo.png)
    badge: '/img/logo.png',
    vibrate: [200, 100, 200, 100, 200], // vibration pattern
    sound: 'default',
    tag: 'attendance-reminder', // grouping notifications
    requireInteraction: true, // keeps notification active until action
    data: {
      dateOfArrival: Date.now()
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();

  // Open the Lush & Co attendance page when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('/owner/attendance') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/owner/attendance');
      }
    })
  );
});
