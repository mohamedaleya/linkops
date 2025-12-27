import { GET } from "../../app/[shortened_id]/route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    shortLink: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("GET /[shortened_id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should redirect to the original URL and increment visits", async () => {
    const mockLink = {
      id: "1",
      shortened_id: "abc123",
      originalUrl: "https://example.com",
      visits: 0,
    };

    (prisma.shortLink.findUnique as jest.Mock).mockResolvedValue(mockLink);
    (prisma.shortLink.update as jest.Mock).mockResolvedValue({
      ...mockLink,
      visits: 1,
    });

    const request = new Request("http://localhost:3000/abc123");
    const response = await GET(request, {
      params: Promise.resolve({ shortened_id: "abc123" }),
    });

    expect(response.status).toBe(307);
    expect(response.headers.get("Location")).toBe("https://example.com");
  });

  it("should return 404 if short code is not found", async () => {
    (prisma.shortLink.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/nonexistent");
    const response = await GET(request, {
      params: Promise.resolve({ shortened_id: "nonexistent" }),
    });

    expect(response.status).toBe(404);
  });

  it("should return 500 if there is an error", async () => {
    (prisma.shortLink.findUnique as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const request = new Request("http://localhost:3000/error");
    const response = await GET(request, {
      params: Promise.resolve({ shortened_id: "error" }),
    });

    expect(response.status).toBe(500);
  });
});
