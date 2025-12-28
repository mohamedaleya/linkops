'use client';

import { useState } from 'react';
import { LinkData } from './LinksDataTable';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogCancel,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Activity,
  Globe,
  Link as LinkIcon,
  ArrowRightLeft,
  Clock,
  Info,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EditLinkDialogProps {
  link: LinkData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLinkDialog({
  link,
  open,
  onOpenChange,
}: EditLinkDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(
    link.expiresAt ? new Date(link.expiresAt) : undefined
  );

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      originalUrl: formData.get('originalUrl'),
      isEnabled: formData.get('isEnabled') === 'on',
      isPublic: formData.get('isPublic') === 'on',
      redirectType: formData.get('redirectType'),
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
    };

    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update link');

      toast.success('Link updated successfully');
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Error updating link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
          <DialogDescription>
            Update your link details. Changes are applied immediately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label
              htmlFor="originalUrl"
              className="flex items-center gap-1.5 text-left"
            >
              <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
              Destination URL
            </Label>
            <Input
              id="originalUrl"
              name="originalUrl"
              defaultValue={link.originalUrl}
              placeholder="https://example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="redirectType"
              className="flex items-center gap-1.5 text-left"
            >
              <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
              Redirect Type
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 cursor-help text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[280px] p-3 text-xs leading-relaxed">
                    <div className="space-y-2 text-left">
                      <p>
                        <span className="font-bold">301 Permanent:</span> Best
                        for SEO. Tells browsers to cache the URL indefinitely.
                      </p>
                      <p>
                        <span className="font-bold">302 Found:</span> Standard
                        temporary redirect for short-term changes.
                      </p>
                      <p>
                        <span className="font-bold">307 Temporary:</span> Like
                        302, but ensures the HTTP method stays the same (e.g.,
                        POST).
                      </p>
                      <p>
                        <span className="font-bold">308 Permanent:</span> Like
                        301, but ensures the HTTP method stays the same.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Select
              name="redirectType"
              defaultValue={link.redirectType || '307'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="301">301 (Permanent)</SelectItem>
                <SelectItem value="302">302 (Found)</SelectItem>
                <SelectItem value="307">307 (Temporary)</SelectItem>
                <SelectItem value="308">308 (Permanent)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-left">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              Expiration Date
            </Label>
            <DatePicker
              date={expiresAt}
              setDate={setExpiresAt}
              placeholder="Pick a date"
            />
          </div>

          <div className="border-muted-foreground/10 bg-muted/30 flex items-center justify-between rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="border-muted-foreground/10 rounded-lg border bg-background p-2">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <Label className="block text-left">Link Status</Label>
                <p className="text-left text-xs text-muted-foreground">
                  Enable or disable this redirect
                </p>
              </div>
            </div>
            <Switch name="isEnabled" defaultChecked={link.isEnabled} />
          </div>

          <div className="border-muted-foreground/10 bg-muted/30 flex items-center justify-between rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="border-muted-foreground/10 rounded-lg border bg-background p-2">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <Label className="block text-left">Public Link</Label>
                <p className="text-left text-xs text-muted-foreground">
                  Display in the global activity feed
                </p>
              </div>
            </div>
            <Switch name="isPublic" defaultChecked={link.isPublic} />
          </div>

          <DialogFooter>
            <DialogCancel disabled={isLoading}>Cancel</DialogCancel>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
