/**
 * @jest-environment jsdom
 */

import { NextRequest } from "next/server";
import { POST } from "../../app/api/shorten/route";
import { PrismaClient } from "@prisma/client";

jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    shortLink: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("POST /api/shorten", () => {
  let mockPrismaClient: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrismaClient = new PrismaClient() as jest.Mocked<PrismaClient>;
  });

  it("should return 400 if URL is not provided", async () => {
    const request = {
      url: "http://localhost:3000/api/shorten",
      method: "POST",
      headers: new Headers(),
      body: JSON.stringify({}),
      nextUrl: new URL("http://localhost:3000/api/shorten"),
      json: async () => ({}),
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "URL is required" });
  });

  it("should return existing short code if URL has already been shortened", async () => {
    const existingLink = { shortened_id: "abc123" };
    (mockPrismaClient.shortLink.findFirst as jest.Mock).mockResolvedValue(
      existingLink
    );

    const request = {
      url: "http://localhost:3000/api/shorten",
      method: "POST",
      headers: new Headers(),
      body: JSON.stringify({ url: "https://example.com" }),
      nextUrl: new URL("http://localhost:3000/api/shorten"),
      json: async () => ({ url: "https://example.com" }),
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: "This URL has already been shortened",
      shortened_id: "abc123",
    });
  });

  it("should create a new short link if URL has not been shortened before", async () => {
    (mockPrismaClient.shortLink.findFirst as jest.Mock).mockResolvedValue(null);
    (mockPrismaClient.shortLink.create as jest.Mock).mockResolvedValue({
      shortened_id: "new123",
    });

    const request = {
      url: "http://localhost:3000/api/shorten",
      method: "POST",
      headers: new Headers(),
      body: JSON.stringify({ url: "https://example.com" }),
      nextUrl: new URL("http://localhost:3000/api/shorten"),
      json: async () => ({ url: "https://example.com" }),
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ shortened_id: "new123" });
  });
});
