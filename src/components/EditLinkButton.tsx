'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { EditLinkDialog } from './EditLinkDialog';
import { LinkData } from './LinksDataTable';

interface EditLinkButtonProps {
  link: LinkData;
}

export function EditLinkButton({ link }: EditLinkButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </Button>
      <EditLinkDialog link={link} open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
