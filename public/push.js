importScripts("https://www.gstatic.com/firebasejs/9.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.10.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAr-hubneOMLZC79zKTPlhsYejvIMCxhAQ",
  authDomain: "promtuz-7c9a4.firebaseapp.com",
  projectId: "promtuz-7c9a4",
  storageBucket: "promtuz-7c9a4.firebasestorage.app",
  messagingSenderId: "971979484967",
  appId: "1:971979484967:web:b6ac7f97a1ff2325f20302",
  measurementId: "G-73ER74VEMN"
});
// Necessary to receive background messages:
const messaging = firebase.messaging();


self.addEventListener("message", (event) => {
  if (event.data?.type === "SHOW_NOTIFICATION") {
    /**
     * @type {ServiceWorkerRegistration}
     */
    const reg = self.registration;

    const notification = event.data.notification;
    const data = event.data.data;

    if (data.type == "MESSAGE_CREATE") {
      reg.showNotification(notification.title, {
        body: notification.body,
        icon: data.icon ?? "/assets/logo.png",
        image: data.image,
        lang: 'en',
        badge: "/assets/badge.png",
        tag: data.chat_id,
        renotify: true,
        timestamp: data.timestamp,
        vibrate: [30, 20, 30],
        actions: data.actions,

        data: data,
      });
    }
  }
});


self.addEventListener("notificationclick", (event) => {
  const data = event.notification.data;
  event.notification.close();

  if (data.type == "MESSAGE_CREATE") {
    let url = `/app/chats/${data.chat_id}`;

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
  }
});

// Optional:
messaging.onBackgroundMessage((m) => {
  console.log("onBackgroundMessage", m);
});