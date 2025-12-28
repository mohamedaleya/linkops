'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/UserAvatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Lock,
  Loader2,
  Upload,
  AtSign,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  PasswordStrengthChecklist,
  checkPasswordRequirements,
} from '@/components/PasswordStrengthChecklist';
import { useUploadThing } from '@/lib/uploadthing';
import { AvatarCropDialog } from '@/components/AvatarCropDialog';
import { UnsavedChangesDialog } from '@/components/UnsavedChangesDialog';
import { ConnectedAccountsCard } from '@/components/ConnectedAccountsCard';
import { deleteAvatarFromStorage } from '@/app/actions/uploadthing';

const getFileKey = (url: string): string | null => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // For URLs like https://utfs.io/f/key or https://utfs.io/key
    const key = urlObj.pathname.includes('/f/') ? pathParts[2] : pathParts[1];
    return key || null;
  } catch {
    // Fallback: extract last segment and remove query params
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart ? lastPart.split('?')[0] : null;
  }
};

export default function ProfilePage() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean>(true);
  const [isHasPasswordLoading, setIsHasPasswordLoading] = useState(true);

  // Profile form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');

  // Original values for dirty checking
  const [originalValues, setOriginalValues] = useState({
    firstName: '',
    lastName: '',
    username: '',
    avatar: '',
  });

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Username availability state
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailability, setUsernameAvailability] = useState<{
    available: boolean;
    message: string;
  } | null>(null);

  // Crop dialog state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unsaved changes dialog state
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );

  // UploadThing hook
  const { startUpload } = useUploadThing('avatarUploader');

  // Check if form is dirty
  const isDirty = useMemo(() => {
    return (
      firstName !== originalValues.firstName ||
      lastName !== originalValues.lastName ||
      username !== originalValues.username
    );
  }, [firstName, lastName, username, originalValues]);

  // Dialog state for avatar removal
  const [showRemoveAvatarDialog, setShowRemoveAvatarDialog] = useState(false);

  useEffect(() => {
    if (session?.user) {
      // Parse name into firstName and lastName
      const nameParts = (session.user.name || '').split(' ');
      const first = nameParts[0] || '';
      const last = nameParts.slice(1).join(' ') || '';
      const user = session.user as { username?: string };
      const uname = user.username || '';
      const img = session.user.image || '';

      setFirstName(first);
      setLastName(last);
      setUsername(uname);
      setAvatar(img);

      setOriginalValues({
        firstName: first,
        lastName: last,
        username: uname,
        avatar: img,
      });
    }

    const checkHasPassword = async () => {
      try {
        const response = await fetch('/api/auth/has-password');
        if (response.ok) {
          const data = await response.json();
          setHasPassword(data.hasPassword);
        }
      } catch (error: unknown) {
        console.error('Failed to check password status:', error);
      } finally {
        setIsHasPasswordLoading(false);
      }
    };

    checkHasPassword();
  }, [session]);

  // Handle browser back/forward/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleConfirmNavigation = () => {
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
  };

  const handleCancelNavigation = () => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

  // Intercept internal navigation clicks
  useEffect(() => {
    if (!isDirty) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (anchor) {
        const href = anchor.getAttribute('href');
        if (
          href &&
          (href.startsWith('/') || href.startsWith(window.location.origin))
        ) {
          if (
            anchor.hasAttribute('download') ||
            anchor.getAttribute('target') === '_blank'
          )
            return;

          e.preventDefault();
          e.stopPropagation();
          setPendingNavigation(href);
          setShowUnsavedDialog(true);
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [isDirty]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image size must be less than 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const updateUserImage = async (imageUrl: string | null) => {
    try {
      const response = await fetch('/api/auth/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile picture');
      }

      setAvatar(imageUrl ?? '');
      setOriginalValues((prev) => ({ ...prev, avatar: imageUrl ?? '' }));
      await refetch();
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update profile picture');
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      setIsUploadingAvatar(true);
      const file = new File([croppedBlob], 'avatar.jpg', {
        type: 'image/jpeg',
      });
      const uploadedFiles = await startUpload([file]);

      if (!uploadedFiles || uploadedFiles.length === 0) {
        throw new Error('Upload failed');
      }

      const uploadedUrl = uploadedFiles[0].ufsUrl; // Reverting to ufsUrl as per deprecation warning
      const oldAvatar = avatar; // Capture current avatar before updating

      await updateUserImage(uploadedUrl);

      // cleanup old avatar if it exists
      if (
        oldAvatar &&
        (oldAvatar.includes('utfs.io') ||
          oldAvatar.includes('ufs.sh') ||
          oldAvatar.includes('uploadthing.com'))
      ) {
        const fileKey = getFileKey(oldAvatar);

        if (fileKey) {
          // Delete silently, don't block UI
          deleteAvatarFromStorage(fileKey).catch((err) =>
            console.error('Failed to delete old avatar:', err)
          );
        }
      }

      setCropDialogOpen(false);
      setImageToCrop('');
      toast.success('Avatar updated successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setIsRemovingAvatar(true);
      if (
        avatar &&
        (avatar.includes('utfs.io') ||
          avatar.includes('ufs.sh') ||
          avatar.includes('uploadthing.com'))
      ) {
        const fileKey = getFileKey(avatar);

        if (fileKey) {
          await deleteAvatarFromStorage(fileKey);
        }
      }
      await updateUserImage(null);
      setShowRemoveAvatarDialog(false);
      toast.success('Avatar removed');
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove avatar');
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  const validateUsername = (value: string): boolean => {
    const usernameRegex = /^[a-z0-9_]{3,30}$/;
    return usernameRegex.test(value);
  };

  // Debounced username check
  useEffect(() => {
    if (!username || username === originalValues.username) {
      setUsernameAvailability(null);
      setIsCheckingUsername(false);
      return;
    }

    if (!validateUsername(username)) {
      setUsernameAvailability({
        available: false,
        message: 'Invalid username format',
      });
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const response = await fetch(
          `/api/auth/check-username?username=${encodeURIComponent(username)}`
        );
        if (response.ok) {
          const data = await response.json();
          setUsernameAvailability({
            available: data.available,
            message: data.available
              ? 'Username is available'
              : 'Username is already taken',
          });
        }
      } catch (error) {
        console.error('Failed to check username:', error);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, originalValues.username]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUsername(username)) {
      toast.error(
        'Username must be 3-30 characters, alphanumeric and underscores only'
      );
      return;
    }
    setIsLoading(true);
    const fullName = `${firstName} ${lastName}`.trim();

    try {
      const response = await fetch('/api/auth/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          username,
        }),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
        setOriginalValues({
          firstName,
          lastName,
          username,
          avatar,
        });
        refetch();
      } else {
        const data = await response.json();
        if (data.error?.message?.includes('username')) {
          toast.error('Username is already taken. Please choose another.');
        } else {
          toast.error(data.error?.message || 'Failed to update profile');
        }
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (!checkPasswordRequirements(newPassword, confirmNewPassword)) {
      toast.error('Please meet all password requirements');
      return;
    }

    setIsPasswordLoading(true);

    try {
      const endpoint = hasPassword
        ? '/api/auth/change-password'
        : '/api/auth/set-password';
      const body = hasPassword
        ? { currentPassword, newPassword, revokeOtherSessions: true }
        : { newPassword };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(
          hasPassword
            ? 'Password changed successfully!'
            : 'Password set successfully!'
        );
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        if (!hasPassword) setHasPassword(true);
      } else {
        const data = await response.json();
        toast.error(data.error?.message || 'Failed to update password');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <p className="text-muted-foreground">
          Please log in to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Profile Settings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account information and security settings
          </p>
        </div>
        {isDirty && (
          <span className="text-sm font-medium text-amber-500">
            Unsaved changes
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and avatar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="order-2 flex-1 md:order-1">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) =>
                        setUsername(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_]/g, '')
                        )
                      }
                      placeholder="username"
                      required
                      className={cn(
                        'pl-10 pr-10',
                        usernameAvailability &&
                          !usernameAvailability.available &&
                          'border-destructive focus-visible:ring-destructive',
                        usernameAvailability &&
                          usernameAvailability.available &&
                          'border-emerald-500/50 focus-visible:ring-emerald-500/30'
                      )}
                      maxLength={30}
                    />
                    <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                      {isCheckingUsername && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {!isCheckingUsername &&
                        usernameAvailability &&
                        (usernameAvailability.available ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        ))}
                    </div>
                  </div>
                  {usernameAvailability && (
                    <p
                      className={cn(
                        'text-[10px] font-medium transition-all duration-300',
                        usernameAvailability.available
                          ? 'text-emerald-500'
                          : 'text-destructive'
                      )}
                    >
                      {usernameAvailability.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    3-30 characters. Letters, numbers, and underscores only.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={session.user.email || ''}
                    disabled
                    className="cursor-not-allowed bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed at this time
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    !isDirty ||
                    isCheckingUsername ||
                    (usernameAvailability !== null &&
                      !usernameAvailability.available)
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </div>

            <div className="order-1 px-4 md:order-2 md:px-8">
              <div className="flex flex-col items-center gap-4">
                <Label className="text-base font-medium">Profile Picture</Label>
                <UserAvatar
                  user={{ name: `${firstName} ${lastName}`, image: avatar }}
                  className="border-muted/20 h-36 w-36 border-4"
                  fallbackClassName="text-4xl"
                />

                <div className="flex w-full flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploadingAvatar ? 'Uploading...' : 'Upload New'}
                  </Button>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {avatar && (
                    <Button
                      variant="destructive-ghost"
                      size="sm"
                      onClick={() => setShowRemoveAvatarDialog(true)}
                      className="w-full transition-colors"
                    >
                      Remove Picture
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConnectedAccountsCard
        hasPassword={hasPassword}
        onActionComplete={refetch}
      />

      <Card
        className={isHasPasswordLoading ? 'pointer-events-none opacity-50' : ''}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {hasPassword ? 'Change Password' : 'Set Password'}
          </CardTitle>
          <CardDescription>
            {hasPassword
              ? 'Update your password to keep your account secure'
              : 'Set a password to use email and password for sign-in'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-6">
            {hasPassword && (
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showCurrentPassword ? 'Hide password' : 'Show password'}
                    </span>
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">
                {hasPassword ? 'New Password' : 'Password'}
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showNewPassword ? 'Hide password' : 'Show password'}
                  </span>
                </Button>
              </div>
              <PasswordStrengthChecklist
                password={newPassword}
                confirmPassword={confirmNewPassword}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showConfirmPassword ? 'Hide password' : 'Show password'}
                  </span>
                </Button>
              </div>
              {newPassword && confirmNewPassword && (
                <div
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-medium transition-colors duration-300',
                    newPassword === confirmNewPassword
                      ? 'text-emerald-500'
                      : 'text-amber-500'
                  )}
                >
                  {newPassword === confirmNewPassword ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Passwords do not match yet</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <Button type="submit" disabled={isPasswordLoading}>
              {isPasswordLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {hasPassword ? 'Changing Password...' : 'Setting Password...'}
                </>
              ) : hasPassword ? (
                'Change Password'
              ) : (
                'Set Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AvatarCropDialog
        isOpen={cropDialogOpen}
        onClose={() => {
          setCropDialogOpen(false);
          setImageToCrop('');
        }}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
        isUploading={isUploadingAvatar}
      />

      <Dialog
        open={showRemoveAvatarDialog}
        onOpenChange={setShowRemoveAvatarDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Profile Picture?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove your profile picture? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRemoveAvatarDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveAvatar}
              disabled={isRemovingAvatar}
            >
              {isRemovingAvatar ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
      />
    </div>
  );
}
