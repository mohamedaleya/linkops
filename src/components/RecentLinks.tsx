import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ShortLink } from "@/types/shortLink";
import { prisma } from "@/lib/prisma";

async function getRecentLinks(): Promise<ShortLink[]> {
  try {
    const recentLinks = await prisma.shortLink.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return recentLinks.map((link) => ({
      ...link,
      createdAt: link.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching recent links:", error);
    return [];
  }
}

const LinkItem = ({ link }: { link: ShortLink }) => (
  <li className="border-b pb-4">
    <div className="space-y-2">
      <div>
        <strong>Original URL:</strong>{" "}
        <a
          href={link.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline break-all inline-block max-w-full"
        >
          {link.originalUrl}
        </a>
      </div>
      <div>
        <strong>Short URL:</strong>{" "}
        <a
          data-testid="shortened-url"
          href={`${process.env.NEXT_PUBLIC_URL || ""}/${link.shortened_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline break-all"
        >
          {`${process.env.NEXT_PUBLIC_URL || ""}/${link.shortened_id}`}
        </a>
      </div>
      <div>
        <strong>Visits:</strong>{" "}
        <span data-testid="visit-count">{link.visits}</span>
      </div>
      <div>
        <strong>Created:</strong> {new Date(link.createdAt).toLocaleString()}
      </div>
    </div>
  </li>
);

export default async function RecentLinks() {
  const links = await getRecentLinks();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Links</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4" data-testid="recent-links">
          {links.length === 0 ? (
            <p className="text-center text-gray-500">
              No shortened links found.
            </p>
          ) : (
            links.map((link) => <LinkItem key={link.id} link={link} />)
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
