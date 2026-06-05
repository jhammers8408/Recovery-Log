export const registerForPushNotifications = async () => {
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    const permission = await PushNotifications.requestPermissions()
    if (permission.receive === 'granted') {
      await PushNotifications.register()
      return true
    }
    return false
  } catch (err) {
    console.log('Push notifications not available:', err)
    return false
  }
}

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js')
    } catch (err) {
      console.log('Service worker registration failed:', err)
    }
  }
}

export const requestNotificationPermission = async () => {
  return await registerForPushNotifications()
}

export const scheduleNotifications = async () => {
  return true
}