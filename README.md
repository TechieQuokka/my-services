# My Services v1.3.15

A professional service management and promotion platform built with **Hono** and **Cloudflare Workers**. Designed for high performance, security, and edge-native scalability.

## 🚀 Key Features

- **Service Management (CRUD)**:
  - Categorized service listings (`webdev`, `ai`).
  - Dynamic thumbnails (Upload to ImageKit or external URL).
  - Rich HTML content support for service-specific landing pages.
- **Advanced Visitor Analytics**:
  - **Fingerprinting**: Tracks unique visitor sessions without invasive cookies.
  - **Bot Detection**: Multi-factor heuristic scoring and automated verdict.
  - **Granular Logging**: Captures device specs (OS, Browser, Screen), performance metrics (CPU, RAM), and network info.
- **Secure Inquiry System**:
  - **Threaded Messaging**: Full conversation history between admin and users.
  - **Accountless Tracking**: Users can follow up on inquiries using secure tokens and IP verification.
  - **Read Receipts**: Admin can track when inquiries were viewed.
- **Robust Admin Dashboard**:
  - **Secure Auth**: PBKDF2 hashed password protection with custom middleware.
  - **Statistics**: Visualized traffic data, bot ratios, and device distribution.
  - **Content Management**: Complete control over services, notices, and inquiries.
- **Security & Infrastructure**:
  - **Rate Limiting**: Integrated using Cloudflare KV to prevent abuse.
  - **Field Encryption**: Sensitive API keys and tokens stored with AES-GCM encryption.
  - **Image Optimization**: Custom ImageKit integration with Signed URL support for secure, optimized asset delivery.
  - **Self-Maintenance**: Automated Cron Trigger for daily cleanup of expired visitor logs.

## 🛠 Tech Stack

- **Framework**: [Hono](https://hono.dev/) (Lightweight web framework for the Edge)
- **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite at the Edge)
- **Storage**: [Cloudflare KV](https://developers.cloudflare.com/kv/) (Low-latency key-value store)
- **Media CDN**: [ImageKit](https://imagekit.io/) (Image optimization and transformation)
- **Language**: TypeScript

## 📂 Project Structure

```text
src/
├── index.ts          # Application entry point & Cron handler
├── lib/              # Core libraries (DB, Crypto, ImageKit, RateLimit)
├── middleware/       # Auth and security middlewares
├── routes/           # Hono route definitions (API, Admin, Front-end)
├── types/            # TypeScript interfaces and global constants
├── views/            # Layouts and UI components
└── static/           # Client-side assets (JS/CSS)
```

## 📦 Getting Started

### 1. Prerequisites
- Node.js & npm
- Cloudflare Account
- ImageKit Account (for media management)

### 2. Installation
```bash
npm install
```

### 3. Database Setup
Create your D1 database and apply the initial schema:
```bash
# Create the database
npx wrangler d1 create my-services-db

# Initialize the schema
npx wrangler d1 execute my-services-db --local --file=./schema.sql
```

### 4. Environment Variables
Create a `.dev.vars` file for local development:
```env
ADMIN_PASSWORD=your_secure_password
MASTER_KEY=your_encryption_key_for_api_keys
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

### 5. Local Development
```bash
npm run dev
```

### 6. Deployment
```bash
npm run deploy
```

## ⚙️ Configuration
The platform is managed via `wrangler.jsonc`. Key bindings include:
- `my_services_db`: Cloudflare D1 instance.
- `RATE_LIMIT_KV`: KV namespace for rate limiting logic.
- `triggers.crons`: Daily maintenance task scheduled at `03:00 UTC`.

## 📜 License
MIT
