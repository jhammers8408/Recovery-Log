import { PushNotifications } from '@capacitor/push-notifications'

export const registerForPushNotifications = async () => {
  try {
    const permission = await PushNotifications.requestPermissions()
    
    if (permission.receive === 'granted') {
      await PushNotifications.register()
      
      PushNotifications.addListener('registration', token => {
        console.log('Push token:', token.value)
        localStorage.setItem('push_token', token.value)
      })

      PushNotifications.addListener('registrationError', err => {
        console.log('Push registration error:', err)
      })

      PushNotifications.addListener('pushNotificationReceived', notification => {
        console.log('Notification received:', notification)
      })

      PushNotifications.addListener('pushNotificationActionPerformed', action => {
        console.log('Notification tapped:', action)
      })

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
  // Notifications are handled server-side for native apps
  return true
}
