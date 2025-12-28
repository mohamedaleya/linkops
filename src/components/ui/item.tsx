import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const itemVariants = cva(
  'group relative flex w-full items-center gap-4 transition-colors',
  {
    variants: {
      variant: {
        default: '',
        outline:
          'rounded-xl border border-muted-foreground/10 bg-muted/20 p-4 hover:bg-muted/30',
        ghost: 'p-2 hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'p-4',
        sm: 'p-3',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ItemProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof itemVariants> {
  asChild?: boolean;
}

const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        ref={ref}
        className={cn(itemVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Item.displayName = 'Item';

const ItemMedia = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex shrink-0 items-center justify-center pt-0.5',
      className
    )}
    {...props}
  />
));
ItemMedia.displayName = 'ItemMedia';

const ItemContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-1 flex-col gap-1 text-left', className)}
    {...props}
  />
));
ItemContent.displayName = 'ItemContent';

const ItemTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
ItemTitle.displayName = 'ItemTitle';

const ItemDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs text-muted-foreground', className)}
    {...props}
  />
));
ItemDescription.displayName = 'ItemDescription';

const ItemActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('ml-auto flex items-center gap-2', className)}
    {...props}
  />
));
ItemActions.displayName = 'ItemActions';

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
};
