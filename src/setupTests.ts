import 'whatwg-fetch';

const mockNextRequest = function (input: URL | string, init?: RequestInit) {
  const url = input instanceof URL ? input : new URL(input);
  return {
    url: url.toString(),
    method: init?.method || 'GET',
    headers: new Headers(init?.headers),
    body: init?.body,
    bodyUsed: false,
    nextUrl: url,
    json: async () => {
      if (typeof init?.body === 'string') {
        return JSON.parse(init.body);
      }
      return {};
    },
  };
};

global.Request = Request;
// @ts-expect-error - Mocking NextRequest for testing purposes
global.NextRequest = mockNextRequest;

// Mock NextResponse.json
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      json: (data: unknown, init?: ResponseInit) => {
        return new Response(JSON.stringify(data), {
          ...init,
          headers: {
            'content-type': 'application/json',
            ...init?.headers,
          },
        });
      },
      redirect: (url: string | URL, init?: number | ResponseInit) => {
        const baseUrl = 'http://localhost:3000';
        const fullUrl = url.toString().startsWith('http')
          ? url.toString()
          : `${baseUrl}${url}`;
        return new Response(null, {
          status: typeof init === 'number' ? init : 307,
          headers: {
            Location: fullUrl,
            ...(typeof init !== 'number' ? init?.headers : {}),
          },
        });
      },
    },
  };
});
