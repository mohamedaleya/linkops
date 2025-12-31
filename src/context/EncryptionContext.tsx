'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  EncryptedData,
  WrappedKeyData,
  EncryptionSetupResult,
  setupEncryption,
  unlockEncryption,
  encryptUrl,
  decryptUrl,
  recoverWithPhrase,
  rewrapWithNewPassword,
  isEncryptionSupported,
} from '@/lib/crypto';
import { useSession } from '@/lib/auth-client';

// ============================================================================
// Types
// ============================================================================

interface EncryptionContextType {
  /** Whether the browser supports WebCrypto */
  isSupported: boolean;

  /** Whether the user has encryption enabled on their account */
  isEncryptionEnabled: boolean;

  /** Whether the encryption key is currently unlocked (in memory) */
  isKeyUnlocked: boolean;

  /** Whether encryption operations are in progress */
  isLoading: boolean;

  /** Error message if any */
  error: string | null;

  /** Initialize encryption for a new user */
  initializeEncryption: (password: string) => Promise<EncryptionSetupResult>;

  /** Unlock encryption with password */
  unlock: (password: string) => Promise<void>;

  /** Lock encryption (clear key from memory) */
  lock: () => void;

  /** Encrypt a URL */
  encrypt: (url: string) => Promise<EncryptedData>;

  /** Decrypt a URL */
  decrypt: (data: EncryptedData) => Promise<string>;

  /** Recover encryption with recovery phrase */
  recover: (phrase: string[]) => Promise<void>;

  /** Re-wrap DEK with new password (for password changes) */
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<WrappedKeyData>;

  /** Set user encryption data from session */
  setUserEncryptionData: (data: UserEncryptionData | null) => void;

  /** Whether initial encryption data is being fetched */
  isFetching: boolean;
}

export interface UserEncryptionData {
  encryptionEnabled: boolean;
  wrappedDek: string | null;
  dekSalt: string | null;
  recoveryWrappedDek: string | null;
  recoverySalt: string | null;
}

// ============================================================================
// Context
// ============================================================================

const EncryptionContext = createContext<EncryptionContextType | undefined>(
  undefined
);

// ============================================================================
// Provider
// ============================================================================

interface EncryptionProviderProps {
  children: React.ReactNode;
}

export function EncryptionProvider({ children }: EncryptionProviderProps) {
  const [isSupported] = useState(() => isEncryptionSupported());
  const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(false);
  const [isKeyUnlocked, setIsKeyUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // In-memory storage for the DEK (cleared on logout/tab close)
  const dekRef = React.useRef<CryptoKey | null>(null);

  // User's encryption data from their account
  const [userEncryptionData, setUserEncryptionData] =
    useState<UserEncryptionData | null>(null);

  // Update encryption enabled state when user data changes
  useEffect(() => {
    setIsEncryptionEnabled(userEncryptionData?.encryptionEnabled ?? false);
  }, [userEncryptionData]);

  // IndexedDB constants
  const DB_NAME = 'linkops-vault';
  const STORE_NAME = 'keys';
  const KEY_NAME = 'dek';

  // Helper for IndexedDB
  const getDB = useCallback(() => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE_NAME);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, []);

  const saveKeyToStorage = useCallback(
    async (key: CryptoKey, userId: string) => {
      try {
        const db = await getDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(key, `${KEY_NAME}-${userId}`);
      } catch (err) {
        console.error('Failed to save key to IndexedDB:', err);
      }
    },
    [getDB]
  );

  const getKeyFromStorage = useCallback(
    async (userId: string): Promise<CryptoKey | null> => {
      try {
        const db = await getDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).get(`${KEY_NAME}-${userId}`);
        return new Promise((resolve) => {
          request.onsuccess = () =>
            resolve((request.result as CryptoKey) || null);
          request.onerror = () => resolve(null);
        });
      } catch (err) {
        console.error('Failed to get key from IndexedDB:', err);
        return null;
      }
    },
    [getDB]
  );

  const removeKeyFromStorage = useCallback(
    async (userId: string) => {
      try {
        const db = await getDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(`${KEY_NAME}-${userId}`);
      } catch (err) {
        console.error('Failed to remove key from IndexedDB:', err);
      }
    },
    [getDB]
  );

  // Fetch encryption data when user logs in and attempt to restore key
  const { data: session } = useSession();

  useEffect(() => {
    const fetchEncryptionData = async () => {
      if (!session?.user) {
        setUserEncryptionData(null);
        dekRef.current = null;
        setIsKeyUnlocked(false);
        setIsFetching(false);
        return;
      }

      setIsFetching(true);
      try {
        const response = await fetch('/api/users/encryption');
        if (response.ok) {
          const data = await response.json();
          setUserEncryptionData(data);

          // Try to restore key from IndexedDB
          const restoredKey = await getKeyFromStorage(session.user.id);
          if (restoredKey) {
            dekRef.current = restoredKey;
            setIsKeyUnlocked(true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user encryption data:', err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchEncryptionData();
  }, [session, getKeyFromStorage]);

  // DO NOT clear DEK on page unload anymore to allow persistence
  // useEffect(() => {
  //   const handleUnload = () => {
  //     dekRef.current = null;
  //     setIsKeyUnlocked(false);
  //   };
  //
  //   window.addEventListener('beforeunload', handleUnload);
  //   return () => window.removeEventListener('beforeunload', handleUnload);
  // }, []);

  /**
   * Initialize encryption for a new user
   */
  const initializeEncryption = useCallback(
    async (password: string): Promise<EncryptionSetupResult> => {
      if (!isSupported) {
        throw new Error('Encryption is not supported in this browser');
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await setupEncryption(password);

        // After setup, automatically unlock
        const wrappedKeyData: WrappedKeyData = {
          wrappedKey: result.wrappedDek.wrappedKey,
          salt: result.wrappedDek.salt,
          iv: result.wrappedDek.iv,
        };

        dekRef.current = await unlockEncryption(password, wrappedKeyData);
        if (session?.user?.id) {
          await saveKeyToStorage(dekRef.current, session.user.id);
        }
        setIsKeyUnlocked(true);
        setIsEncryptionEnabled(true);

        return result;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to initialize encryption';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isSupported, session, saveKeyToStorage]
  );

  /**
   * Unlock encryption with password
   */
  const unlock = useCallback(
    async (password: string): Promise<void> => {
      if (!userEncryptionData?.wrappedDek || !userEncryptionData?.dekSalt) {
        throw new Error('No encryption data available');
      }

      setIsLoading(true);
      setError(null);

      try {
        const wrappedKeyData: WrappedKeyData = {
          wrappedKey: userEncryptionData.wrappedDek,
          salt: userEncryptionData.dekSalt,
          iv: '',
        };

        dekRef.current = await unlockEncryption(password, wrappedKeyData);
        if (session?.user?.id) {
          await saveKeyToStorage(dekRef.current, session.user.id);
        }
        setIsKeyUnlocked(true);
      } catch (err) {
        const message =
          err instanceof Error
            ? 'Incorrect password'
            : 'Failed to unlock encryption';
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [userEncryptionData, session, saveKeyToStorage]
  );

  /**
   * Lock encryption (clear key from memory)
   */
  const lock = useCallback(() => {
    dekRef.current = null;
    if (session?.user?.id) {
      removeKeyFromStorage(session.user.id);
    }
    setIsKeyUnlocked(false);
    setError(null);
  }, [session, removeKeyFromStorage]);

  /**
   * Encrypt a URL
   */
  const encrypt = useCallback(async (url: string): Promise<EncryptedData> => {
    if (!dekRef.current) {
      throw new Error('Encryption key not unlocked');
    }

    return encryptUrl(url, dekRef.current);
  }, []);

  /**
   * Decrypt a URL
   */
  const decrypt = useCallback(async (data: EncryptedData): Promise<string> => {
    if (!dekRef.current) {
      throw new Error('Encryption key not unlocked');
    }

    return decryptUrl(data, dekRef.current);
  }, []);

  /**
   * Recover encryption with recovery phrase
   */
  const recover = useCallback(
    async (phrase: string[]): Promise<void> => {
      if (
        !userEncryptionData?.recoveryWrappedDek ||
        !userEncryptionData?.recoverySalt
      ) {
        throw new Error('No recovery data available');
      }

      setIsLoading(true);
      setError(null);

      try {
        const wrappedKeyData: WrappedKeyData = {
          wrappedKey: userEncryptionData.recoveryWrappedDek,
          salt: userEncryptionData.recoverySalt,
          iv: '',
        };

        dekRef.current = await recoverWithPhrase(phrase, wrappedKeyData);
        if (session?.user?.id) {
          await saveKeyToStorage(dekRef.current, session.user.id);
        }
        setIsKeyUnlocked(true);
      } catch (err) {
        const message =
          err instanceof Error
            ? 'Invalid recovery phrase'
            : 'Failed to recover encryption';
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [userEncryptionData, session, saveKeyToStorage]
  );

  /**
   * Re-wrap DEK with new password (for password changes)
   */
  const changePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string
    ): Promise<WrappedKeyData> => {
      // First unlock with current password if not already unlocked
      if (!dekRef.current) {
        await unlock(currentPassword);
      }

      if (!dekRef.current) {
        throw new Error('Failed to unlock with current password');
      }

      setIsLoading(true);
      setError(null);

      try {
        const newWrappedKeyData = await rewrapWithNewPassword(
          dekRef.current,
          newPassword
        );
        return newWrappedKeyData;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to change encryption password';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [unlock]
  );

  const value: EncryptionContextType = {
    isSupported,
    isEncryptionEnabled,
    isKeyUnlocked,
    isLoading,
    error,
    initializeEncryption,
    unlock,
    lock,
    encrypt,
    decrypt,
    recover,
    changePassword,
    setUserEncryptionData,
    isFetching,
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useEncryption(): EncryptionContextType {
  const context = useContext(EncryptionContext);

  if (context === undefined) {
    throw new Error('useEncryption must be used within an EncryptionProvider');
  }

  return context;
}

// ============================================================================
// Helper Hook - Auto-lock on inactivity
// ============================================================================

export function useAutoLock(inactivityMinutes: number = 15) {
  const { isKeyUnlocked, lock } = useEncryption();

  useEffect(() => {
    if (!isKeyUnlocked) return;

    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(
        () => {
          lock();
        },
        inactivityMinutes * 60 * 1000
      );
    };

    // Events that reset the timer
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Start initial timer
    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isKeyUnlocked, lock, inactivityMinutes]);
}
