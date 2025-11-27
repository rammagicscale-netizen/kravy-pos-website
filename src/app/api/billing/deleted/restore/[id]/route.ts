import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Params may be Promise in latest Next.js App Router
    const { id: restoreId } = await params;

    // 1️⃣ Fetch deleted snapshot
    const entry = await prisma.deleteHistory.findUnique({
      where: { id: restoreId },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const snap: any = entry.snapshot;

    // 2️⃣ Restore BILL
    await prisma.bill.create({
      data: {
        id: snap.id,
        userId: snap.userId,
        clerkUserId: snap.clerkUserId ?? null,
        customerId: snap.customerId ?? null,
        total: snap.total ?? 0,
        discount: snap.discount ?? null,
        gst: snap.gst ?? null,
        grandTotal: snap.grandTotal ?? null,
        paymentStatus: snap.paymentStatus ?? "pending",
        paymentMode: snap.paymentMode ?? null,
        notes: snap.notes ?? null,

        dueDate: snap.dueDate ? new Date(snap.dueDate) : null,
        holdBy: snap.holdBy ?? null,
        holdAt: snap.holdAt ? new Date(snap.holdAt) : null,
        resumedBy: snap.resumedBy ?? null,
        resumedAt: snap.resumedAt ? new Date(snap.resumedAt) : null,

        createdAt: snap.createdAt ? new Date(snap.createdAt) : new Date(),
      },
    });

    // 3️⃣ Restore PRODUCTS (loop – Mongo safe)
    if (snap.products && snap.products.length > 0) {
      for (const p of snap.products) {
        await prisma.billProduct.create({
          data: {
            id: p.id,
            billId: snap.id,
            itemId: p.itemId,
            name: p.name,
            quantity: p.quantity,
            price: p.price,
            gst: p.gst ?? 0,
            discount: p.discount ?? 0,
            total: p.total ?? 0,
          },
        });
      }
    }

    // 4️⃣ Restore PAYMENTS
    if (snap.payments && snap.payments.length > 0) {
      for (const pay of snap.payments) {
        await prisma.payment.create({
          data: {
            id: pay.id,
            billId: snap.id,
            amount: pay.amount,
            mode: pay.mode ?? "cash",
            status: pay.status ?? "completed",
            createdAt: pay.createdAt ? new Date(pay.createdAt) : new Date(),
          },
        });
      }
    }

    // 5️⃣ Restore HISTORY
    if (snap.history && snap.history.length > 0) {
      for (const h of snap.history) {
        await prisma.billHistory.create({
          data: {
            id: h.id,
            billId: snap.id,
            action: h.action,
            userId: h.userId ?? null,
            timestamp: h.timestamp ? new Date(h.timestamp) : new Date(),
          },
        });
      }
    }

    // 6️⃣ Delete from deleteHistory
    await prisma.deleteHistory.delete({
      where: { id: restoreId },
    });

    return NextResponse.json({
      success: true,
      message: "Bill restored successfully",
    });
  } catch (error) {
    console.error("RESTORE ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
