
"use client";
import { useStore } from '@/store';
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { useEffect, useState } from 'react';
// TODO: Add SDKs for Firebase products that you want to use

const firebaseConfig = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG!);

const app = initializeApp(firebaseConfig);


// Initialize Firebase
const messaging = getMessaging(app)

const Notifications = () => {
  const push_token = useStore((store) => store.pushToken);
  const ws_emit = useStore((store) => store.emit);

  const [swr, setSwr] = useState<ServiceWorkerRegistration>();
  // const [gotToken, setGotToken] = useState(false);


  const requestNotification = async () => {
    try {
      const perm = await Notification.requestPermission();

      if (perm == 'granted') {
        const token = await getToken(messaging, { serviceWorkerRegistration: swr, vapidKey: process.env.NEXT_PUBLIC_VAPID_PUB_KEY });

        console.info("Got Token", { token })

        if (token !== push_token) {
          ws_emit("PUSH_TOKEN", { token })
        }
      }
    } catch { }
  }

  useEffect(() => {
    navigator.serviceWorker.register("/push.js").then(reg => {
      setSwr(reg)
    });
  })

  useEffect(() => {
    requestNotification();
    const offMessage = onMessage(messaging, (msg) => {
      swr?.active?.postMessage({
        type: "SHOW_NOTIFICATION",
        data: msg,
      });
    })

    return () => {
      offMessage();
    }
  }, [swr])

  return null;
}

export default Notifications