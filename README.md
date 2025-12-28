# LinkOps 🚀

LinkOps is a professional, high-performance URL management platform designed for modern needs. It goes beyond simple shortening, offering detailed analytics, enhanced security features, and a premium user experience with a sleek, responsive design.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat&logo=redis)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat&logo=docker)](https://www.docker.com/)

## ✨ Key Features

- **🚀 Advanced URL Shortening**: Create custom, branded aliases with support for various redirect types (301, 302, 307, etc.).
- **📊 Robust Analytics Dashboard**:
  - **Click Tracking**: Real-time monitoring of link engagement.
  - **Geographic Insights**: Heatmaps and data on clicks by country.
  - **Referrer Analysis**: Identify which platforms are driving traffic.
  - **Time-Series Data**: Daily and cumulative click statistics.
- **🔒 Security & Control**:
  - **Password Protection**: Secure your links with encrypted passwords.
  - **Expiration Dates**: Set links to automatically deactivate after a certain period.
  - **Enable/Disable**: Instantly toggle link availability without deleting.
- **👤 Premium User Experience**:
  - **Better-Auth Integration**: Secure authentication via credentials or OAuth (Google, GitHub).
  - **Advanced Profile Management**: Custom usernames, display names, and profile picture management with integrated cropping.
  - **Responsive & Dynamic UI**: Built with Shadcn UI, Framer Motion, and support for Dark Mode.

## 🏗️ Architecture & Tech Stack

LinkOps is built with a focus on scalability, performance, and developer experience.

### **Frontend & Backend**

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & Server Components) for optimal performance and SEO.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for rapid, consistent UI development.
- **Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI primitives) for accessible, premium-feel components.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for smooth layout transitions and micro-interactions.

### **Data & Infrastructure**

- **ORM**: [Prisma](https://www.prisma.io/) for type-safe database access.
- **Primary Database**: [PostgreSQL 16](https://www.postgresql.org/) (Relational data, Users, Links, Analytics).
- **In-Memory Store**: [Redis 7](https://redis.io/) (via `ioredis`) for high-performance rate limiting and potential caching.
- **Auth Service**: [Better-Auth](https://better-auth.com/) for a managed-yet-flexible authentication flow.
- **Storage**: [UploadThing](https://uploadthing.com/) for secure and easy profile image handling.

### **DevOps & Deployment**

- **Containerization**: [Docker](https://www.docker.com/) & Docker Compose for consistent environments.
- **Deployment**: Custom automated bash scripts for building and pushing to Docker Hub, then deploying to a VPS (OVH) via SSH.
- **Testing**:
  - **Unit/Integration**: [Jest](https://jestjs.io/) & React Testing Library.
  - **E2E**: [Playwright](https://playwright.dev/) for robust browser automation tests.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL instance
- Redis instance
- UploadThing API keys

### Installation & Setup

1. **Clone & Install**:

   ```bash
   git clone https://github.com/mohamedaleya/linkops.git
   cd linkops
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file based on `.env.example`. Ensure you provide valid credentials for PostgreSQL, Redis, and Better-Auth.

3. **Database Initialization**:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 🐳 Deployment

The project includes a `docker-deploy.sh` script for automated deployment:

```bash
npm run deploy
```

This builds the production image for `linux/amd64`, pushes it to Docker Hub, and triggers a pull/redeploy on the target VPS.

## 📄 License

Open-source under the MIT License. Built with ❤️ by [mohamedaleya](https://github.com/mohamedaleya).
