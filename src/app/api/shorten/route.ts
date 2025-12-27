import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const existingLink = await prisma.shortLink.findFirst({
      where: { originalUrl: url },
    });

    if (existingLink) {
      return NextResponse.json(
        {
          error: "This URL has already been shortened",
          shortened_id: existingLink.shortened_id,
        },
        { status: 409 }
      );
    }

    const shortened_id = nanoid(6);
    const shortLink = await prisma.shortLink.create({
      data: {
        originalUrl: url,
        shortened_id,
      },
    });

    revalidatePath("/");
    revalidatePath("/api/links");

    return NextResponse.json({ shortened_id: shortLink.shortened_id });
  } catch (error) {
    console.error("Error creating short link:", error);
    return NextResponse.json(
      { error: "Error creating short link" },
      { status: 500 }
    );
  }
}
