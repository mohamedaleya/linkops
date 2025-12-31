# Changelog

All notable changes to this project will be documented in this file.

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
