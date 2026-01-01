# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0-alpha.2] - 2025-12-31 - Email Verification & Polish

- **Email Verification System**: Complete email verification flow for new user registrations.
  - Verification emails sent via SMTP (Nodemailer integration).
  - Dedicated verification pages with token handling.
  - Verification banner prompting unverified users to confirm their email.
- **Password Reset Flow**: Full forgot/reset password functionality.
  - Request password reset via email.
  - Secure token-based password reset page.
  - Beautifully designed email templates.
- **Alpha Banner**: Eye-catching marquee banner indicating the app is in alpha stage.
- **Improved Logo**: New reusable SVG logo component with theme support.
- **Cookie Consent**: GDPR-compliant cookie consent banner.

### Infrastructure & DevOps

- **Docker Optimizations**: Reduced Docker image size and improved build times.
- **CI/CD Improvements**:
  - Explicit project naming for staging/production isolation.
  - Fixed database provisioning scripts.
  - Improved migration reliability with health checks.
- **Environment Isolation**: Staging and production now run on completely separate Docker networks and databases.

### Bug Fixes & Polish

- **Focus Ring Fix**: Eliminated white flash on input focus across all components.
- **Session Stability**: Prevented unnecessary session refreshes on window focus changes.
- **Improved Skeleton Loading**: Better loading states for session-dependent UI elements.

## [0.1.0-alpha.1] - 2025-12-30 - Security & Feature Update

- **Unified Dashboard**: Renamed `/links` to `/dashboard` and integrated real-time analytics directly above your link list for at-a-glance insights.
- **Enhanced Security**:
  - New warning screen for potentially unsafe links.
  - Zero-knowledge End-to-End encryption using AES-256 for private links.
  - Persistent Secure Vault: Your encryption keys now persist securely across sessions using browser-based IndexedDB.
- **Staging Pipeline**: Established a full staging environment with automated deployments triggered by the `dev` branch.
- **Improved Navigation**: Centralized common resources on the new [Features](/features) and [Contact](/contact) pages.
- **Account Control**: Redesigned Profile and Account settings with integrated backup/recovery phrase management.

### Improvements & Polish

- **UI Standardization**: Unified input borders and refined hover states across the application for a more consistent feel.
- **Better UX**:
  - Added skeleton loaders for all encryption-related states to prevent layout shifts.
  - Automated link safety checks on creation.
  - Custom slug editing for existing links.
- **Visual Updates**: Refined footer distribution and updated dashboard icons for better visual hierarchy.
- **Reliability**: Migrated to GitHub Container Registry (GHCR) for more reliable Docker image hosting.

## [0.1.0-alpha.0] - 2025-12-28 - Renaming & Automation

- **Welcome LinkOps**: We've officially renamed the project to LinkOps!
- **Custom Links**: You can now create custom link aliases and set advanced redirect options.
- **Avatars**: Formatting and storage for user profile pictures has been improved.

## [0.0.1-alpha] - 2025-12-27 - Initial Release

- **Core Features**: Create short links, track clicks, and manage your profile.
- **Dashboard**: A central place to manage all your links and view analytics.
