import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { username } from 'better-auth/plugins';
import { prisma } from './prisma';
import { generateUniqueUsername } from './username-generator';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_URL,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  trustedOrigins: [process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'],
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      console.log(`Reset password link for ${user.email}: ${url}`);
      // In production, send an actual email here.
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [username()],
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const generatedUsername = await generateUniqueUsername(
            user.name,
            user.email
          );
          return {
            data: {
              ...user,
              username: generatedUsername,
            },
          };
        },
      },
    },
  },
});
