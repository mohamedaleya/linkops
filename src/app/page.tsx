import { Suspense } from "react";
import UrlShortener from "../components/UrlShortener";
import RecentLinks from "../components/RecentLinks";
import RecentLinksSkeleton from "@/components/RecentLinksSkeleton";
import { LinkIcon } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center flex items-center gap-2 justify-center">
        <LinkIcon /> <span>URL Shortener</span>
      </h1>
      <p className="text-center text-xs mb-8">Built by Mohamed Aleya</p>
      <UrlShortener />
      <Suspense fallback={<RecentLinksSkeleton />}>
        <RecentLinks />
      </Suspense>
    </main>
  );
}
