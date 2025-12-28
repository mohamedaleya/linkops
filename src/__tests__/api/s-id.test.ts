import { GET } from '../../app/s/[id]/route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    shortLink: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('GET /s/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to the original URL and increment visits', async () => {
    const mockLink = {
      id: '1',
      shortened_id: 'abc123',
      originalUrl: 'https://example.com',
      visits: 0,
    };

    (prisma.shortLink.findUnique as jest.Mock).mockResolvedValue(mockLink);
    (prisma.shortLink.update as jest.Mock).mockResolvedValue({
      ...mockLink,
      visits: 1,
    });

    const request = new Request('http://localhost:3000/s/abc123');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'abc123' }),
    });

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toBe('https://example.com');
  });

  it('should redirect to link-not-found if short code is not found', async () => {
    (prisma.shortLink.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/s/nonexistent');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'nonexistent' }),
    });

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toContain('/link-not-found');
  });

  it('should return 500 if there is an error', async () => {
    (prisma.shortLink.findUnique as jest.Mock).mockRejectedValue(
      new Error('Database error')
    );

    const request = new Request('http://localhost:3000/s/error');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'error' }),
    });

    expect(response.status).toBe(500);
  });
});
