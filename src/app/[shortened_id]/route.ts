import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shortened_id: string }> }
) {
  try {
    const { shortened_id } = await params;
    const link = await prisma.shortLink.findUnique({
      where: { shortened_id },
    });

    if (!link) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.shortLink.update({
      where: { shortened_id },
      data: { visits: { increment: 1 } },
    });

    return NextResponse.redirect(link.originalUrl, { status: 307 });
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.error("Error redirecting:", error);
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
