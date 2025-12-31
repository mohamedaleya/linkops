'use client';

import { toast } from 'sonner';
import { Switch } from './switch';

interface DisabledSwitchWrapperProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled: boolean;
  disabledMessage?: string;
  id?: string;
}

/**
 * A wrapper for the Switch component that shows a toast message
 * when clicked while disabled, with a cursor-not-allowed style.
 */
export function DisabledSwitchWrapper({
  checked,
  onCheckedChange,
  disabled,
  disabledMessage = 'This option is currently unavailable.',
  id,
}: DisabledSwitchWrapperProps) {
  return (
    <div className="relative">
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      {disabled && (
        <div
          className="absolute inset-0 cursor-not-allowed"
          onClick={() => toast.info(disabledMessage)}
        />
      )}
    </div>
  );
}
