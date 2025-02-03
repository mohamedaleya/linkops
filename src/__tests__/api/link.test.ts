/**
 * @jest-environment jsdom
 */

import { GET } from "../../app/api/links/route";
import { PrismaClient } from "@prisma/client";

jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    shortLink: {
      findMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

describe("GET /api/links", () => {
  let mockPrismaClient: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrismaClient = new PrismaClient() as jest.Mocked<PrismaClient>;
  });

  it("should return recent links", async () => {
    const testDate = new Date().toISOString();
    const mockLinks = [
      {
        id: "1",
        originalUrl: "https://example.com",
        shortened_id: "abc123",
        visits: 0,
        createdAt: testDate,
      },
      {
        id: "2",
        originalUrl: "https://example.org",
        shortened_id: "def456",
        visits: 0,
        createdAt: testDate,
      },
    ];
    (mockPrismaClient.shortLink.findMany as jest.Mock).mockResolvedValue(
      mockLinks
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockLinks);
  });

  it("should return 500 if there is an error", async () => {
    (mockPrismaClient.shortLink.findMany as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: "Error fetching recent links",
    });
  });
});
