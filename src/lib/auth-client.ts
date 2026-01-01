'use client';

import { createAuthClient } from 'better-auth/react';
import { usernameClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  plugins: [usernameClient()],
  sessionOptions: {
    refetchOnWindowFocus: false,
  },
});

export const { signIn, signUp, useSession, signOut } = authClient;
