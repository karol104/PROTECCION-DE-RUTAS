import { Notify } from "quasar"

export function useNotifications() {
  
  const success = (message, caption = '') => {
    Notify.create({
      type: 'positive',
      message: message,
      caption: caption,
      position: 'top',
      timeout: 3000,
      icon: 'check_circle',
      actions: [{ icon: 'close', color: 'white' }]
    })
  }

  const error = (message, caption = '') => {
    Notify.create({
      type: 'negative',
      message: message,
      caption: caption,
      position: 'top',
      timeout: 4000,
      icon: 'error',
      actions: [{ icon: 'close', color: 'white' }]
    })
  }

  const warning = (message, caption = '') => {
    Notify.create({
      type: 'warning',
      message: message,
      caption: caption,
      position: 'top',
      timeout: 3500,
      icon: 'warning',
      actions: [{ icon: 'close', color: 'white' }]
    })
  }

  const info = (message, caption = '') => {
    Notify.create({
      type: 'info',
      message: message,
      caption: caption,
      position: 'top',
      timeout: 3000,
      icon: 'info',
      actions: [{ icon: 'close', color: 'white' }]
    })
  }

  return { success, error, warning, info }
}