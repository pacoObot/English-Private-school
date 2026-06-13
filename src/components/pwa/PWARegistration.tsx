"use client";

import { useEffect } from "react";

type PWARegistrationProps = {
  userId?: string;
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PWARegistration({ userId }: PWARegistrationProps) {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      return;
    }

    const registerSWAndSubscribe = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("PWA Service Worker registered scoping:", registration.scope);

        if (!userId) {
          return;
        }

        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            console.log("Notification permission denied by user.");
            return;
          }
        } else if (Notification.permission === "denied") {
          console.log("Notification permission was previously denied.");
          return;
        }

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.warn("VAPID public key not defined in environment.");
          return;
        }

        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        let subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          console.log("Existing push subscription found.");
        } else {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          });
          console.log("New push subscription created.");
        }

        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subscription }),
        });
      } catch (err) {
        console.error("Error registering SW or subscribing to Push:", err);
      }
    };

    registerSWAndSubscribe();
  }, [userId]);

  return null;
}
