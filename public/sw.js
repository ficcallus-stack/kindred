self.addEventListener('push', function(event) {
    if (!event.data) return;
    
    try {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: data.icon || '/favicon.png',
            badge: '/favicon.png',
            data: {
                url: data.url || '/dashboard/notifications'
            },
            vibrate: [100, 50, 100],
            actions: [
                { action: 'open', title: 'View Details' },
                { action: 'close', title: 'Dismiss' }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    } catch (err) {
        console.error('Push SW Error:', err);
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    const targetUrl = event.notification.data.url;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (const client of clientList) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
