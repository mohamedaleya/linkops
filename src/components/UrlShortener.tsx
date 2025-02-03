"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import type React from "react";

export default function UrlShortener() {
  const [url, setUrl] = useState("");
  const [shortenedId, setShortenedId] = useState("");
  const [isShortening, setIsShortening] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsShortening(true);
    setError("");
    setShortenedId("");

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        if (response.status === 409 && data.shortened_id) {
          setShortenedId(data.shortened_id);
        }
        return;
      }

      if (data.shortened_id) {
        setShortenedId(data.shortened_id);
        setUrl("");
        router.refresh();
      }
    } catch (error) {
      console.log(error);
      setError("An unexpected error occurred");
    } finally {
      setIsShortening(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Shorten a URL</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {error && (
            <Alert
              variant="destructive"
              className="mb-4"
              data-testid="error-message"
            >
              {error}
            </Alert>
          )}
          <Input
            type="url"
            placeholder="Enter URL to shorten"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            disabled={isShortening}
            data-testid="url-input"
          />
          <Button
            type="submit"
            disabled={isShortening}
            data-testid="shorten-button"
            style={{ zIndex: 1 }}
          >
            {isShortening ? "Shortening..." : "Shorten"}
          </Button>
        </form>
        {shortenedId && (
          <div className="mt-4" data-testid="shortened-url-container">
            <p>Shortened URL:</p>
            <a
              href={`/${shortenedId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
              data-testid="shortened-url"
            >
              {`${
                process.env.NEXT_PUBLIC_URL || window.location.origin
              }/${shortenedId}`}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
