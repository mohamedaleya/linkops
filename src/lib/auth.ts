import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { username } from 'better-auth/plugins';
import { prisma } from './prisma';
import { generateUniqueUsername } from './username-generator';

// Helper to get secret with build-time fallback
const getSecret = () => {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      // Allow build to pass even if secret is missing (it will be provided at runtime)
      return 'a-very-long-dummy-secret-used-only-for-build-validation-purposes';
    }
  }
  return secret;
};

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_URL,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: getSecret(),
  trustedOrigins: [
    process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'https://linkops.at',
    'https://staging.linkops.at',
  ].filter(Boolean) as string[],
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

      // Non-blocking send
      sendEmail({
        to: user.email,
        subject: 'Reset your password - LinkOps',
        html,
        text: `Reset your password by visiting this link: ${publicUrl}`,
      }).catch((err) => {
        console.error('Failed to send reset password email:', err);
      });

      console.log(`Reset password email task initiated for ${user.email}`);
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

      // Non-blocking send
      sendEmail({
        to: user.email,
        subject: 'Verify your email - LinkOps',
        html,
        text: `Verify your email by visiting this link: ${publicUrl}`,
      }).catch((err) => {
        console.error('Failed to send verification email:', err);
      });

      console.log(`Verification email task initiated for ${user.email}`);
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
  // Server-side rate limiting to protect against abuse
  rateLimit: {
    enabled: true,
    window: 60, // 60 second window
    max: 100, // max 100 requests per minute by default
    customRules: {
      // Strict limit for sending verification emails: 1 per 60 seconds
      '/send-verification-email': {
        window: 60,
        max: 1,
      },
      // Strict limit for password reset: 3 per 60 seconds
      '/forget-password': {
        window: 60,
        max: 3,
      },
      // Limit sign-in attempts: 5 per 60 seconds
      '/sign-in/*': {
        window: 60,
        max: 5,
      },
      // Limit sign-up attempts: 5 per 60 seconds
      '/sign-up/*': {
        window: 60,
        max: 5,
      },
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
