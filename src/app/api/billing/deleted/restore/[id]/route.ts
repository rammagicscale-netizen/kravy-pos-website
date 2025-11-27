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

    // Next.js may wrap params in a Promise
    const { id: restoreId } = await params;

    // 1️⃣ Fetch deleted bill snapshot
    const entry = await prisma.deleteHistory.findUnique({
      where: { id: restoreId },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const snap: any = entry.snapshot;

    // 2️⃣ Restore the bill
    const restoredBill = await prisma.bill.create({
      data: {
        id: snap.id,
        userId: snap.userId,
        clerkUserId: snap.clerkUserId ?? null,
        customerId: snap.customerId ?? null,
        total: snap.total ?? 0,
        discount: snap.discount ?? null,
        gst: snap.gst ?? null,
        grandTotal: snap.grandTotal ?? null,
        paymentStatus: snap.paymentStatus ?? null,
        paymentMode: snap.paymentMode ?? null,
        notes: snap.notes ?? null,
        dueDate: snap.dueDate ? new Date(snap.dueDate) : null,

        holdBy: snap.holdBy ?? null,
        holdAt: snap.holdAt ? new Date(snap.holdAt) : null,

        createdAt: snap.createdAt ? new Date(snap.createdAt) : new Date(),
      },
    });

    // 3️⃣ Restore Products
    if (snap.products && snap.products.length > 0) {
      const productsData = snap.products.map((p: any) => ({
        id: p.id,
        billId: snap.id,
        itemId: p.itemId,
        quantity: p.quantity,
        price: p.price,
        total: p.total,
      }));

      for (const prod of productsData) {
        await prisma.billProduct.create({
          data: prod,
        });
      }
    }

    // 4️⃣ Restore Payments
    if (snap.payments && snap.payments.length > 0) {
      const paymentsData = snap.payments.map((pay: any) => ({
        id: pay.id,
        billId: snap.id,
        amount: pay.amount,
        method: pay.method,
        createdAt: pay.createdAt ? new Date(pay.createdAt) : new Date(),
      }));

      for (const pay of paymentsData) {
        await prisma.payment.create({
          data: pay,
        });
      }
    }

    // 5️⃣ Delete deleteHistory entry
    await prisma.deleteHistory.delete({
      where: { id: restoreId },
    });

    return NextResponse.json({
      success: true,
      message: "Bill restored successfully",
      data: restoredBill,
    });
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
