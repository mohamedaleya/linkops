'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogCancel,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Cookie } from 'lucide-react';
import Link from 'next/link';

type CookieConsent = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
};

// Helper for cookie management
const COOKIE_NAME = 'cookie-consent';
const EXPIRY_DAYS = 365;

function setCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + date.toUTCString();
  document.cookie = name + '=' + value + ';' + expires + ';path=/;SameSite=Lax';
}

function getCookie(name: string) {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookieConsent>(() => {
    if (typeof document === 'undefined')
      return {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      };
    const storedConsent = getCookie(COOKIE_NAME);
    if (storedConsent) {
      try {
        return JSON.parse(storedConsent);
      } catch {
        // fall through
      }
    }
    return {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
  });

  useEffect(() => {
    // Check if consent cookie exists
    const storedConsent = getCookie(COOKIE_NAME);
    if (!storedConsent) {
      // Add a small delay for a smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (settings: CookieConsent) => {
    setCookie(COOKIE_NAME, JSON.stringify(settings), EXPIRY_DAYS);
    setPreferences(settings);
    setIsVisible(false);
    setShowSettings(false);

    // Here you would typically trigger your analytics init
    console.log('Consent saved:', settings);
  };

  const handleAcceptAll = () => {
    const allContent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveConsent(allContent);
  };

  const handleDeclineAll = () => {
    const essentialOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    saveConsent(essentialOnly);
  };

  const handleSavePreferences = () => {
    // Necessary is always true
    saveConsent({ ...preferences, necessary: true });
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
          >
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 rounded-xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-card/85 md:flex-row md:p-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Cookie className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold tracking-tight">
                    Privacy & Transparency
                  </h3>
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  We use cookies to improve your experience, analyze site
                  traffic, and serve targeted content. By accepting, you agree
                  to our use of cookies as outlined in our{' '}
                  <Link
                    href="/privacy"
                    className="underline transition-colors hover:text-primary"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
              <div className="flex w-full min-w-[320px] flex-col gap-3 sm:flex-row md:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(true)}
                  className="flex-1 font-medium"
                >
                  Settings
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDeclineAll}
                  className="flex-1 font-medium"
                >
                  Reject
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  className="flex-1 font-medium shadow-md"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog
        open={showSettings}
        onOpenChange={(open) => {
          // If user closes dialog without saving, we re-show banner if it was hidden?
          // Actually, if they close the dialog, the banner is still visible behind it (if strict mode didn't hide it).
          // But we conditionally render the banner.
          // In this logic: "isVisible" becomes false only on save.
          // The Dialog is independent. However, if the banner was visible, we want it to stay visible if they cancel settings.
          setShowSettings(open);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
            <DialogDescription>
              Customize your cookie settings. Necessary cookies are always
              enabled to ensure the website functions correctly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            {/* Necessary */}
            <div className="flex items-start justify-between space-x-4">
              <div className="space-y-1">
                <Label className="text-base font-semibold">
                  Strictly Necessary
                </Label>
                <p className="text-sm text-muted-foreground">
                  Essential for the website to function (e.g., security,
                  networking).
                </p>
              </div>
              <Switch
                checked={true}
                disabled
                aria-label="Strictly necessary cookies"
              />
            </div>

            {/* Preferences */}
            <div className="flex items-start justify-between space-x-4">
              <div className="space-y-1">
                <Label htmlFor="prefs" className="text-base font-semibold">
                  Preferences
                </Label>
                <p className="text-sm text-muted-foreground">
                  Remember your settings and choices (e.g., language, theme).
                </p>
              </div>
              <Switch
                id="prefs"
                checked={preferences.preferences}
                onCheckedChange={(checked) =>
                  setPreferences((p) => ({ ...p, preferences: checked }))
                }
              />
            </div>

            {/* Analytics */}
            <div className="flex items-start justify-between space-x-4">
              <div className="space-y-1">
                <Label htmlFor="analytics" className="text-base font-semibold">
                  Analytics
                </Label>
                <p className="text-sm text-muted-foreground">
                  Help us understand how visitors use the site.
                </p>
              </div>
              <Switch
                id="analytics"
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences((p) => ({ ...p, analytics: checked }))
                }
              />
            </div>

            {/* Marketing */}
            <div className="flex items-start justify-between space-x-4">
              <div className="space-y-1">
                <Label htmlFor="marketing" className="text-base font-semibold">
                  Marketing
                </Label>
                <p className="text-sm text-muted-foreground">
                  Used to deliver relevant advertisements and track ad
                  performance.
                </p>
              </div>
              <Switch
                id="marketing"
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences((p) => ({ ...p, marketing: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogCancel>Cancel</DialogCancel>
            <Button onClick={handleSavePreferences}>Save Preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
