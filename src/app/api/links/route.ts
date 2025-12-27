import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const recentLinks = await prisma.shortLink.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const headers = new Headers();
    headers.set("Cache-Control", "no-store, max-age=0");

    return NextResponse.json(recentLinks, { headers });
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.error("Error fetching recent links:", error);
    }
    return NextResponse.json(
      { error: "Error fetching recent links" },
      { status: 500 }
    );
  }
}
