importScripts("https://www.gstatic.com/firebasejs/9.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.10.0/firebase-messaging-compat.js");

firebase.initializeApp(JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG));
// Necessary to receive background messages:
const messaging = firebase.messaging();

const handleNotification = (data) => {
  /**
   * @type {ServiceWorkerRegistration}
   */
  const reg = self.registration;

  reg.showNotification(data.title, {
    ...data,
    actions: JSON.parse(data.actions ?? "[]"),
    vibrate: JSON.parse(data.vibrate ?? "[]"),
    data
  })
}

self.addEventListener("message", (event) => {
  if (event.type === "SHOW_NOTIFICATION") {
    handleNotification(event.data.data)
  }
});


self.addEventListener("notificationclick", (event) => {
  console.log(event);
  
  const url = event.notification.data?.url;
  event.notification.close()

  if (!url) return;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// Optional:
messaging.onBackgroundMessage((payload) => {
  handleNotification(payload.data);
});

self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => self.clients.claim());