/**
 * @jest-environment jsdom
 */

import { NextRequest } from 'next/server';
import { PATCH, DELETE } from '../../app/api/links/bulk/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    shortLink: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    linkClickDaily: { deleteMany: jest.fn() },
    linkReferrerDaily: { deleteMany: jest.fn() },
    linkGeoDaily: { deleteMany: jest.fn() },
  },
}));
jest.mock('@/lib/auth', () => ({
  auth: { api: { getSession: jest.fn() } },
}));
jest.mock('next/headers', () => ({
  headers: jest.fn(async () => new Headers()),
}));
jest.mock('@/lib/cache', () => ({ invalidateLinks: jest.fn() }));

const req = (method: string, body: unknown) =>
  new Request('http://localhost:3000/api/links/bulk', {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;

describe('/api/links/bulk', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects unauthenticated bulk delete', async () => {
    (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(null);
    const response = await DELETE(req('DELETE', { ids: ['a', 'b'] }));
    expect(response.status).toBe(401);
    expect(prisma.shortLink.deleteMany).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated bulk disable', async () => {
    (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(null);
    const response = await PATCH(
      req('PATCH', { ids: ['a'], isEnabled: false })
    );
    expect(response.status).toBe(401);
    expect(prisma.shortLink.updateMany).not.toHaveBeenCalled();
  });

  it("only touches the caller's own links", async () => {
    (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({
      user: { id: 'user-1' },
    });
    (prisma.shortLink.findMany as jest.Mock).mockResolvedValue([
      { id: 'a', shortened_id: 'aaa' },
    ]);
    (prisma.shortLink.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

    const response = await DELETE(
      req('DELETE', { ids: ['a', 'someone-else'] })
    );
    expect(response.status).toBe(200);
    expect(prisma.shortLink.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['a', 'someone-else'] }, userId: 'user-1' },
      })
    );
    expect(prisma.shortLink.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['a'] } },
    });
  });
});
