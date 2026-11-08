import { handleShortLinkRedirect } from '@/lib/redirect-link';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleShortLinkRedirect(request, id);
}
