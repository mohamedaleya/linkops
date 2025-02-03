import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "test") {
  prisma = {
    shortLink: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaClient;
} else {
  prisma = new PrismaClient();
}

export async function GET(
  request: Request,
  { params }: { params: { shortened_id: string } }
) {
  try {
    const link = await prisma.shortLink.findUnique({
      where: { shortened_id: params.shortened_id },
    });

    if (!link) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.shortLink.update({
      where: { shortened_id: params.shortened_id },
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

export { prisma };
