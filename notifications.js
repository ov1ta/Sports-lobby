// Unique layered synth notification sound using Web Audio API
export function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime

    // Layer 1: soft sub thud
    const sub = ctx.createOscillator()
    const subGain = ctx.createGain()
    sub.type = 'sine'
    sub.frequency.setValueAtTime(80, now)
    sub.frequency.exponentialRampToValueAtTime(40, now + 0.15)
    subGain.gain.setValueAtTime(0.4, now)
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
    sub.connect(subGain)
    subGain.connect(ctx.destination)
    sub.start(now)
    sub.stop(now + 0.2)

    // Layer 2: bright crystal ting
    const crystal = ctx.createOscillator()
    const crystalGain = ctx.createGain()
    crystal.type = 'sine'
    crystal.frequency.setValueAtTime(1200, now + 0.05)
    crystal.frequency.exponentialRampToValueAtTime(900, now + 0.4)
    crystalGain.gain.setValueAtTime(0, now + 0.05)
    crystalGain.gain.linearRampToValueAtTime(0.3, now + 0.1)
    crystalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
    crystal.connect(crystalGain)
    crystalGain.connect(ctx.destination)
    crystal.start(now + 0.05)
    crystal.stop(now + 0.5)

    // Layer 3: harmonic overtone
    const overtone = ctx.createOscillator()
    const overtoneGain = ctx.createGain()
    overtone.type = 'triangle'
    overtone.frequency.setValueAtTime(2400, now + 0.08)
    overtone.frequency.exponentialRampToValueAtTime(1800, now + 0.35)
    overtoneGain.gain.setValueAtTime(0, now + 0.08)
    overtoneGain.gain.linearRampToValueAtTime(0.15, now + 0.12)
    overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
    overtone.connect(overtoneGain)
    overtoneGain.connect(ctx.destination)
    overtone.start(now + 0.08)
    overtone.stop(now + 0.4)

    setTimeout(() => ctx.close(), 600)
  } catch (e) {
    console.warn('Audio not available')
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function sendNotification(title, body, tag) {
  if (Notification.permission === 'granted') {
    playNotificationSound()
    new Notification(title, {
      body,
      tag,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100]
    })
  }
}
