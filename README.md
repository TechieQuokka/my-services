# My Services

A sleek, lightweight service management and promotion platform built with **Hono** and **Cloudflare Workers**.

## 🚀 Features

- **Service Management**: Easily add, edit, and organize the services you offer.
- **Dynamic Front-end**: A clean, responsive landing page to showcase your services.
- **Admin Dashboard**: Secure management interface for handling inquiries, notices, and service content.
- **Visitor Analytics**: Comprehensive tracking of visitor sessions, device info, and bot detection.
- **Inquiry System**: Integrated contact form and message management for potential clients.
- **Daily Cleanup**: Automated Cron Trigger to purge old visitor logs and maintain database efficiency.

## 🛠 Tech Stack

- **Framework**: [Hono](https://hono.dev/)
- **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite)
- **Styling**: Vanilla CSS with modern aesthetics.
- **Language**: TypeScript

## 📦 Getting Started

### 1. Prerequisites
- Node.js & npm
- Cloudflare Account (for D1 and deployment)

### 2. Installation
```bash
npm install
```

### 3. Database Setup
Create your D1 database and apply the initial schema:
```bash
npx wrangler d1 create my-services-db
npx wrangler d1 execute my-services-db --local --file=./schema.sql
```

### 4. Local Development
```bash
npm run dev
```

### 5. Deployment
```bash
npm run deploy
```

## 🔒 Environment Variables
Make sure to set the following in your `.dev.vars` (for local) or via Cloudflare Dashboard (for production):
- `ADMIN_PASSWORD`: Your secret password for the admin dashboard.

## 📜 License
MIT
