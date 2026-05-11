"use server";

import { getCurrentSession } from "@/features/auth/current-user";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const session = await getCurrentSession();
  if (!session) return [];

  return prisma.notification.findMany({
    where: { userId: session.userId },
    include: {
      evaluation: {
        select: {
          acknowledgedAt: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 10
  });
}

export async function markAsRead(notificationId: string) {
  const session = await getCurrentSession();
  if (!session) return { success: false };

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.userId },
    data: { isRead: true }
  });

  revalidatePath("/");
  return { success: true };
}

export async function markAllAsRead() {
  const session = await getCurrentSession();
  if (!session) return { success: false };

  await prisma.notification.updateMany({
    where: { userId: session.userId, isRead: false },
    data: { isRead: true }
  });

  revalidatePath("/");
  return { success: true };
}
