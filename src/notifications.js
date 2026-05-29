export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    console.log('Service worker registered')
    return registration
  } catch (err) {
    console.error('Service worker failed:', err)
    return null
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  const permission = await Notification.requestPermission()
  return permission
}

export async function scheduleNotifications() {
  const registration = await navigator.serviceWorker.ready
  if (registration && registration.active) {
    registration.active.postMessage({ type: 'SCHEDULE_NOTIFICATIONS' })
  }
}

export function sendLocalNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/apple-touch-icon.png',
    })
  }
}

export async function checkStreakAndNotify(streak) {
  if (Notification.permission !== 'granted') return
  const milestones = [3, 7, 14, 21, 30, 60, 100]
  if (milestones.includes(streak)) {
    sendLocalNotification(
      `${streak} Day Streak! 🔥`,
      `You've logged ${streak} days in a row. Keep it going!`
    )
  }
}
