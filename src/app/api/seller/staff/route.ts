import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getEffectiveClerkId } from "@/lib/auth-utils";


export const runtime = "nodejs";

// GET: List all staff for the logged-in Seller
export async function GET() {
  try {
    const effectiveId = await getEffectiveClerkId();
    if (!effectiveId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const seller = await prisma.user.findUnique({
      where: { clerkId: effectiveId },
    });

    if (!seller) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allUsers = await prisma.user.findMany();
    const staff = allUsers.filter((u: any) => u.ownerId === effectiveId).map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        clerkId: u.clerkId,
        allowedPaths: u.allowedPaths,
        isDisabled: u.isDisabled,
        createdAt: u.createdAt,
    }));

    return NextResponse.json(staff);
  } catch (error) {
    console.error("GET STAFF ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

// POST: Create a new staff member
export async function POST(req: Request) {
  try {
    const effectiveId = await getEffectiveClerkId();
    if (!effectiveId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const seller = await prisma.user.findUnique({
      where: { clerkId: effectiveId },
    });

    if (!seller) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create user in Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.createUser({
      emailAddress: [email],
      password,
      firstName: name,
      skipPasswordChecks: true,
      publicMetadata: { role: "USER", ownerId: effectiveId }
    });

    // 2. Create user in Prisma using type bypass
    const newUser = await (prisma.user as any).create({
      data: {
        clerkId: clerkUser.id,
        email,
        name,
        role: "USER",
        ownerId: effectiveId,
        allowedPaths: ["/dashboard"], // default
      }
    });

    return NextResponse.json(newUser);
  } catch (error: any) {
    console.error("CREATE STAFF ERROR:", error);
    return NextResponse.json({ error: error.message || "Failed to create staff" }, { status: 500 });
  }
}

// PUT: Update staff permissions
export async function PUT(req: Request) {
  try {
    const effectiveId = await getEffectiveClerkId();
    if (!effectiveId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { staffClerkId, allowedPaths, isDisabled, newPassword } = await req.json();

    // Verify this staff belongs to this seller by fetching and checking ownerId
    const staff = await prisma.user.findFirst({
      where: { clerkId: staffClerkId }
    });

    if (!staff || (staff as any).ownerId !== effectiveId) {
        return NextResponse.json({ error: "Staff user not found or not owned by you" }, { status: 404 });
    }

    // 1. If password update requested, update in Clerk
    if (newPassword) {
      const client = await clerkClient();
      await client.users.updateUser(staffClerkId, {
        password: newPassword,
        skipPasswordChecks: true,
      });
    }

    // 2. Update metadata in Prisma
    const updated = await (prisma.user as any).update({
      where: { clerkId: staffClerkId },
      data: {
        allowedPaths: allowedPaths !== undefined ? allowedPaths : undefined,
        isDisabled: isDisabled !== undefined ? isDisabled : undefined,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE STAFF ERROR:", error);
    return NextResponse.json({ error: "Failed to update staff" }, { status: 500 });
  }
}
