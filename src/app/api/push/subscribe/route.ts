import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/features/auth/current-user";

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subscription } = await req.json();
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    if (!p256dh || !auth) {
      return NextResponse.json({ error: "Invalid subscription keys" }, { status: 400 });
    }

    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    });

    if (existing) {
      if (existing.userId !== session.userId || existing.p256dh !== p256dh || existing.auth !== auth) {
        await prisma.pushSubscription.update({
          where: { endpoint },
          data: {
            userId: session.userId,
            p256dh,
            auth,
          },
        });
      }
    } else {
      await prisma.pushSubscription.create({
        data: {
          userId: session.userId,
          endpoint,
          p256dh,
          auth,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { endpoint } = await req.json();
    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        userId: session.userId,
        endpoint,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete push subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
