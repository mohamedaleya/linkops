'use client';

import * as React from 'react';
import { format } from 'date-fns';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Copy,
  Trash2,
  Eye,
  Pencil,
  Globe,
  Lock,
  Power,
  PowerOff,
  Loader2,
  X,
  Link2Off,
  Plus,
  ShieldCheck,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';
import { cn } from '@/lib/utils';
import { AddLinkDialog } from './AddLinkDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

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
import { EditLinkDialog } from './EditLinkDialog';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from '@/components/ui/item';
import { AnimatePresence, motion } from 'framer-motion';

export type LinkData = {
  id: string;
  originalUrl: string;
  shortened_id: string;
  visits: number;
  isEnabled: boolean;
  expiresAt: string | null;
  createdAt: string;
  redirectType: string;
  isPublic: boolean;
  hasPassword?: boolean;
  // Encryption fields
  isEncrypted?: boolean;
  encryptedUrl?: string | null;
  encryptionIv?: string | null;
  // Security fields
  isVerified?: boolean;
  securityStatus?: string;
};

import { DecryptedUrl } from './DecryptedUrl';

function DecryptedUrlCell({ link }: { link: LinkData }) {
  return (
    <DecryptedUrl
      isEncrypted={link.isEncrypted ?? false}
      originalUrl={link.originalUrl}
      encryptedUrl={link.encryptedUrl}
      encryptionIv={link.encryptionIv}
    />
  );
}

function StatusToggleCell({ link }: { link: LinkData }) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isEnabled, setIsEnabled] = React.useState(link.isEnabled);
  const router = useRouter();

  const expiresAt = link.expiresAt;
  const isExpired = expiresAt && new Date(expiresAt) < new Date();

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    setIsEnabled(checked);
    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: checked }),
      });
      if (!res.ok) throw new Error('Failed to update link');
      toast.success(checked ? 'Link enabled' : 'Link disabled');
      router.refresh();
    } catch {
      setIsEnabled(!checked); // Revert on error
      toast.error('Error updating link status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isExpired) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="destructive" className="cursor-help">
              Expired
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>This link has expired and cannot be toggled</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isEnabled}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
        className="data-[state=checked]:bg-primary"
      />
      {isUpdating && (
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}

export const columns: ColumnDef<LinkData>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'shortened_id',
    header: 'Short Link',
    cell: ({ row }) => {
      const id = row.getValue('shortened_id') as string;
      const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/s/${id}`;
        navigator.clipboard.writeText(url);
        toast.success('Copied to clipboard');
      };

      return (
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-primary md:max-w-[120px]">
            {id}
          </span>
          <VerifiedBadge
            isVerified={row.original.isVerified}
            securityStatus={row.original.securityStatus}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground opacity-0 transition-all hover:bg-transparent hover:text-primary group-hover:opacity-100"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy link</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy link</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
  {
    accessorKey: 'originalUrl',
    header: 'Destination',
    cell: ({ row }) => <DecryptedUrlCell link={row.original} />,
  },
  {
    accessorKey: 'isEnabled',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          className={cn(
            'px-0 underline-offset-4 hover:bg-transparent hover:underline',
            isSorted && 'text-primary hover:text-primary'
          )}
          onClick={() => column.toggleSorting(isSorted === 'asc')}
        >
          Status
          {isSorted === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : isSorted === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => <StatusToggleCell link={row.original} />,
  },
  {
    accessorKey: 'isPublic',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          className={cn(
            'px-0 underline-offset-4 hover:bg-transparent hover:underline',
            isSorted && 'text-primary hover:text-primary'
          )}
          onClick={() => column.toggleSorting(isSorted === 'asc')}
        >
          Visibility
          {isSorted === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : isSorted === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const isPublic = row.original.isPublic;
      const hasPassword = row.original.hasPassword;
      const isEncrypted = row.original.isEncrypted;
      return (
        <div className="flex items-center gap-1">
          {isEncrypted && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-full bg-green-500/10 p-1.5 text-green-600 transition-colors dark:text-green-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>End-to-End Encrypted</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`rounded-full p-1.5 transition-colors ${
                    isPublic
                      ? 'bg-primary/5 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isPublic ? (
                    <Globe className="h-3.5 w-3.5" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPublic ? 'Publicly listed' : 'Private link'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {hasPassword && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-full bg-amber-500/10 p-1.5 text-amber-600 transition-colors dark:text-amber-400">
                    <KeyRound className="h-3.5 w-3.5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Password protected</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'visits',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          className={cn(
            'px-0 underline-offset-4 hover:bg-transparent hover:underline',
            isSorted && 'text-primary hover:text-primary'
          )}
          onClick={() => column.toggleSorting(isSorted === 'asc')}
        >
          Visits
          {isSorted === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : isSorted === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-mono">{row.getValue('visits')}</div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          className={cn(
            'px-0 underline-offset-4 hover:bg-transparent hover:underline',
            isSorted && 'text-primary hover:text-primary'
          )}
          onClick={() => column.toggleSorting(isSorted === 'asc')}
        >
          Created
          {isSorted === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : isSorted === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return (
        <div className="whitespace-nowrap text-[10px] text-muted-foreground md:text-xs">
          {format(date, 'MMM d, yyyy, h:mm a')}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    enableHiding: false,
    cell: ({ row }) => <LinkActionCell link={row.original} />,
  },
];

function LinkActionCell({ link }: { link: LinkData }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete link');

      toast.success('Link deleted successfully');
      setIsDeleteDialogOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Error deleting link');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            asChild
            className="flex cursor-pointer items-center gap-2"
          >
            <a
              href={`${typeof window !== 'undefined' ? window.location.origin : ''}/s/${link.shortened_id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" /> Visit
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="flex cursor-pointer items-center gap-2"
          >
            <Link href={`/dashboard/my-links/${link.id}`}>
              <Eye className="h-4 w-4" /> Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsEditDialogOpen(true)}
            className="flex cursor-pointer items-center gap-2"
          >
            <Pencil className="h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex cursor-pointer items-center gap-2"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditLinkDialog
        link={link}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this link? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              This will permanently delete{' '}
              <span className="font-mono font-bold">
                /s/{link.shortened_id}
              </span>{' '}
              and all its associated analytics data.
            </div>
          </div>
          <DialogFooter>
            <DialogCancel disabled={isDeleting}>Cancel</DialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={isDeleting}
            >
              {isDeleting ? 'Deleting' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function LinksDataTable({ data }: { data: LinkData[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isBulkLoading, setIsBulkLoading] = React.useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const router = useRouter();

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId: (row) => row.id,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row) => row.original.id);
  const hasSelection = selectedIds.length > 0;

  const handleBulkEnable = async (enable: boolean) => {
    setIsBulkLoading(true);
    try {
      const res = await fetch('/api/links/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, isEnabled: enable }),
      });
      if (!res.ok) throw new Error('Failed to update links');
      toast.success(
        `${selectedIds.length} links ${enable ? 'enabled' : 'disabled'}`
      );
      setRowSelection({});
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Error updating links');
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkLoading(true);
    try {
      const res = await fetch('/api/links/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) throw new Error('Failed to delete links');
      toast.success(`${selectedIds.length} links deleted`);
      setRowSelection({});
      setIsDeleteDialogOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Error deleting links');
    } finally {
      setIsBulkLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Input
          placeholder="Filter by short link or destination..."
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="h-10 w-full text-base sm:max-w-sm"
        />
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 gap-2">
                Columns <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className=""
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === 'shortened_id'
                        ? 'Short Link'
                        : column.id === 'originalUrl'
                          ? 'Destination'
                          : column.id === 'isEnabled'
                            ? 'Status'
                            : column.id === 'isPublic'
                              ? 'Visibility'
                              : column.id === 'visits'
                                ? 'Visits'
                                : column.id === 'createdAt'
                                  ? 'Created'
                                  : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="h-10 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Link
          </Button>
        </div>
      </div>

      {/* Add Link Dialog */}
      <AddLinkDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {/* Bulk Actions Toolbar */}
      <AnimatePresence initial={false}>
        {hasSelection && (
          <motion.div
            key="bulk-actions"
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{
              type: 'tween',
              duration: 0.2,
              ease: 'easeOut',
            }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setRowSelection({})}
                >
                  <X className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {selectedIds.length} link{selectedIds.length > 1 ? 's' : ''}{' '}
                  selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2"
                        onClick={() => handleBulkEnable(true)}
                        loading={isBulkLoading}
                      >
                        <Power className="h-3.5 w-3.5" />
                        Enable
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Enable all selected links</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2"
                        onClick={() => handleBulkEnable(false)}
                        loading={isBulkLoading}
                      >
                        <PowerOff className="h-3.5 w-3.5" />
                        Disable
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Disable all selected links</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 gap-2"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        disabled={isBulkLoading}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete all selected links</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Delete {selectedIds.length} Link
              {selectedIds.length > 1 ? 's' : ''}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.length} link
              {selectedIds.length > 1 ? 's' : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-xl border border-muted-foreground/10 bg-muted/30 p-4 text-sm text-muted-foreground">
              This will permanently delete all selected links and their
              associated analytics data.
            </div>
          </div>
          <DialogFooter>
            <DialogCancel disabled={isBulkLoading}>Cancel</DialogCancel>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              loading={isBulkLoading}
            >
              {isBulkLoading
                ? 'Deleting'
                : `Delete ${selectedIds.length} Link${selectedIds.length > 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-4 overflow-hidden rounded-2xl border bg-card/50 shadow backdrop-blur-xl">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-muted/20 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-12 text-foreground">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="group border-muted/10 transition-colors hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-48 border-0 p-0"
                >
                  <div className="flex h-full items-center justify-center p-8">
                    <Item
                      variant="ghost"
                      className="max-w-xs flex-col items-center gap-4 p-8 hover:bg-inherit"
                    >
                      <ItemMedia>
                        <div className="rounded-full p-4 text-muted-foreground">
                          <Link2Off className="h-8 w-8 opacity-20" />
                        </div>
                      </ItemMedia>
                      <ItemContent className="text-center">
                        <ItemTitle className="text-lg font-semibold text-muted-foreground">
                          No links found
                        </ItemTitle>
                        <ItemDescription>
                          Create your first shortened link to see it appear here
                          in your dashboard.
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-9 rounded-lg px-4"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-9 rounded-lg px-4"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
