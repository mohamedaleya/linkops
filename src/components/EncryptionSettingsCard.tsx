'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEncryption } from '@/context/EncryptionContext';
import { ChangeEncryptionPasswordDialog } from '@/components/ChangeEncryptionPasswordDialog';

export function EncryptionSettingsCard() {
  const { isEncryptionEnabled } = useEncryption();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Data Privacy & Encryption
        </CardTitle>
        <CardDescription>
          Manage your end-to-end encryption keys and vault security
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
          <div className="space-y-0.5">
            <p className="font-medium">Encryption Status</p>
            <p className="text-sm text-muted-foreground">
              {isEncryptionEnabled
                ? 'Your links are protected with zero-knowledge encryption.'
                : 'Encryption is not enabled on your account.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                isEncryptionEnabled
                  ? 'bg-emerald-500'
                  : 'bg-muted-foreground/30'
              )}
            />
            <span className="text-sm font-medium">
              {isEncryptionEnabled ? 'Active' : 'Not Setup'}
            </span>
          </div>
        </div>

        {isEncryptionEnabled && (
          <div className="space-y-4">
            <div className="flex flex-col gap-4 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Encryption Password</p>
                <p className="text-sm text-muted-foreground">
                  The password used to unlock your link vault
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
              >
                <Key className="mr-2 h-3.5 w-3.5" />
                Change Password
              </Button>
            </div>
          </div>
        )}

        <ChangeEncryptionPasswordDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </CardContent>
    </Card>
  );
}
