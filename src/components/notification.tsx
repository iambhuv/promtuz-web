
"use client";
import { useStore } from '@/store';
import React, { useEffect, useRef } from 'react'
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use

const firebaseConfig = {
  apiKey: "AIzaSyAr-hubneOMLZC79zKTPlhsYejvIMCxhAQ",
  authDomain: "promtuz-7c9a4.firebaseapp.com",
  projectId: "promtuz-7c9a4",
  storageBucket: "promtuz-7c9a4.firebasestorage.app",
  messagingSenderId: "971979484967",
  appId: "1:971979484967:web:b6ac7f97a1ff2325f20302",
  measurementId: "G-73ER74VEMN"
};


const app = initializeApp(firebaseConfig);


// Initialize Firebase
const messaging = getMessaging(app)

const Notifications = () => {
  const push_token = useStore((store) => store.pushToken);
  const ws_emit = useStore((store) => store.emit);

  const sw = useRef<ServiceWorkerRegistration>(null)


  const requestNotification = async () => {
    try {
      sw.current?.update();

      const perm = await Notification.requestPermission();

      if (perm == 'granted') {
        const token = await getToken(messaging, { serviceWorkerRegistration: sw.current!, vapidKey: process.env.NEXT_PUBLIC_VAPID_PUB_KEY });
        console.log({ token });

        if (token !== push_token) {
          ws_emit("PUSH_TOKEN", { token })
        }

      }

    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    navigator.serviceWorker.register("/push.js").then(reg => {
      sw.current = reg
    });

    requestNotification();

    onMessage(messaging, (msg) => {
      sw.current?.active?.postMessage({
        type: "SHOW_NOTIFICATION",
        data: msg.data,
      });
    })

  })

  return null;
}

export default Notifications