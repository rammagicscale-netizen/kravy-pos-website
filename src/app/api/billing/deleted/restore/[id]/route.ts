import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: any) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restoreId = params.id;

    // 🔍 1. Find deleted entry
    const entry = await prisma.deleteHistory.findUnique({
      where: { id: restoreId },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const snap: any = entry.snapshot;

    // 🧾 2. Restore MAIN BILL
    const restoredBill = await prisma.bill.create({
      data: {
        id: snap.id,
        userId: snap.userId,
        clerkUserId: snap.clerkUserId,
        customerId: snap.customerId,
        total: snap.total,
        discount: snap.discount,
        gst: snap.gst,
        grandTotal: snap.grandTotal,
        paymentStatus: snap.paymentStatus,
        paymentMode: snap.paymentMode,
        notes: snap.notes,

        dueDate: snap.dueDate ? new Date(snap.dueDate) : null,
        holdBy: snap.holdBy,
        holdAt: snap.holdAt ? new Date(snap.holdAt) : null,
        resumedAt: snap.resumedAt ? new Date(snap.resumedAt) : null,

        createdAt: snap.createdAt ? new Date(snap.createdAt) : new Date(),
      },
    });

    // 🛒 3. Restore BILL ITEMS
    if (snap.items && snap.items.length > 0) {
      for (const item of snap.items) {
        await prisma.billItem.create({
          data: {
            id: item.id,
            billId: snap.id,
            productId: item.productId,
            name: item.name,
            price: item.price,
            qty: item.qty,
            total: item.total,
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          },
        });
      }
    }

    // 🗑 4. Remove the entry from deleteHistory
    await prisma.deleteHistory.delete({
      where: { id: restoreId },
    });

    return NextResponse.json({
      success: true,
      message: "Bill restored successfully",
      restoredBill,
    });
  } catch (error: any) {
    console.error("Restore Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
