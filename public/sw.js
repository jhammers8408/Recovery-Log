self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'RecoveryLog'
  const options = {
    body: data.body || 'Time to log your recovery!',
    icon: '/apple-touch-icon.png',
    badge: '/apple-touch-icon.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow('/')
    })
  )
})

// Schedule daily notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduleDailyNotifications()
  }
})

function scheduleDailyNotifications() {
  // Morning check-in reminder at 8am
  const now = new Date()
  const morning = new Date()
  morning.setHours(8, 0, 0, 0)
  if (morning < now) morning.setDate(morning.getDate() + 1)
  const morningDelay = morning - now

  setTimeout(() => {
    self.registration.showNotification('RecoveryLog', {
      body: "Good morning! Log your check-in to keep your streak alive.",
      icon: '/apple-touch-icon.png',
      badge: '/apple-touch-icon.png',
      vibrate: [100, 50, 100],
    })
  }, morningDelay)

  // Evening recovery reminder at 8pm
  const evening = new Date()
  evening.setHours(20, 0, 0, 0)
  if (evening < now) evening.setDate(evening.getDate() + 1)
  const eveningDelay = evening - now

  setTimeout(() => {
    self.registration.showNotification('RecoveryLog', {
      body: "Did you log your recovery today? Don't break your streak!",
      icon: '/apple-touch-icon.png',
      badge: '/apple-touch-icon.png',
      vibrate: [100, 50, 100],
    })
  }, eveningDelay)
}
