import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";

export default function NotFound() {
  return (
    <html>
      <body>
        <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
          <div className="text-center space-y-6 max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
              <LinkIcon className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">404</h1>
            <p className="text-xl text-gray-600">
              This shortened URL doesn&apos;t exist or has been removed.
            </p>
            <Button asChild className="w-full">
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
