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
      const { sendEmail } = await import('./email/client');
      const { getResetPasswordEmailHtml } =
        await import('./email/templates/reset-password');

      // Replace /api/auth with /auth for cleaner user-facing URLs
      const publicUrl = url.replace('/api/auth/', '/auth/');
      const html = getResetPasswordEmailHtml(
        publicUrl,
        user.name || user.email
      );

      await sendEmail({
        to: user.email,
        subject: 'Reset your password - LinkOps',
        html,
        text: `Reset your password by visiting this link: ${publicUrl}`,
      });

      console.log(`Reset password email sent to ${user.email}`);
    },
    requireEmailVerification: false,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { sendEmail } = await import('./email/client');
      const { getVerificationEmailHtml } =
        await import('./email/templates/verification');

      // Replace /api/auth with /auth for cleaner user-facing URLs
      const publicUrl = url.replace('/api/auth/', '/auth/');
      const html = getVerificationEmailHtml(publicUrl, user.name || user.email);

      await sendEmail({
        to: user.email,
        subject: 'Verify your email - LinkOps',
        html,
        text: `Verify your email by visiting this link: ${publicUrl}`,
      });

      console.log(`Verification email sent to ${user.email}`);
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
