import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:suporte@delsonps.local",
    vapidPublicKey,
    vapidPrivateKey
  );
} else {
  console.warn("VAPID keys are not set in environment variables. Web Push will not function.");
}

export async function sendPushNotification(
  userId: string,
  title: string,
  message: string,
  url?: string
) {
  if (!vapidPublicKey || !vapidPrivateKey) return;

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  const payload = JSON.stringify({
    title,
    body: message,
    url: url || "/",
  });

  const sendPromises = subscriptions.map((sub) => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    return webpush
      .sendNotification(pushSubscription, payload)
      .catch(async (error) => {
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`Push subscription expired/invalid for endpoint: ${sub.endpoint}. Deleting...`);
          await prisma.pushSubscription.delete({
            where: { id: sub.id },
          }).catch((e) => console.error("Error deleting expired subscription:", e));
        } else {
          console.error(`Error sending push notification to endpoint ${sub.endpoint}:`, error);
        }
      });
  });

  await Promise.all(sendPromises);
}

export async function createSystemNotification(data: {
  userId: string;
  title: string;
  message: string;
  type: string;
  evaluationId?: string;
  debateSessionId?: string;
  url?: string;
}) {
  const dbNotification = await prisma.notification.create({
    data: {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      evaluationId: data.evaluationId,
      debateSessionId: data.debateSessionId,
    },
  });

  sendPushNotification(
    data.userId,
    data.title,
    data.message,
    data.url || (data.debateSessionId ? `/student/debates` : "/")
  ).catch((err) => console.error("Failed to send push notification:", err));

  return dbNotification;
}

export async function createSystemNotifications(
  notifications: {
    userId: string;
    title: string;
    message: string;
    type: string;
    evaluationId?: string;
    debateSessionId?: string;
    url?: string;
  }[]
) {
  const dbNotifications = await prisma.notification.createMany({
    data: notifications.map((n) => ({
      userId: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
      evaluationId: n.evaluationId,
      debateSessionId: n.debateSessionId,
    })),
  });

  const sendPromises = notifications.map((n) =>
    sendPushNotification(
      n.userId,
      n.title,
      n.message,
      n.url || (n.debateSessionId ? `/student/debates` : "/")
    ).catch((err) => console.error("Failed to send push notification:", err))
  );

  await Promise.all(sendPromises);
  return dbNotifications;
}
