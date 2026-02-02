# 🎟️ Coop-on Backend API

This is the backend REST API for **Coop-on**, a cashless payment system designed for events and festivals. This application manages users, organizers, events, digital wallets, and transactions.

Built with **NestJS**, **Drizzle ORM**, and **MySQL**.

- **Student:** Jonas Slenders
- **Student ID:** 2023395591
- **Email:** jonas.slenders@student.hogent.be
- **Course:** Web Services

---

## 🛠️ Requirements

Ensure the following software is installed on your system:

- [NodeJS v22 (LTS)](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (Package Manager)
- [MySQL v8](https://dev.mysql.com/downloads/installer/) (Ensure the MySQL server is running on port 3306)
- A database client (e.g., [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) or DBeaver)
- [Stripe CLI](https://docs.stripe.com/stripe-cli/install)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Installation

Clone the repository and install the dependencies:

```bash
pnpm install
```
Generate stripe webhook key in stripe CLI.

```bash
 stripe login
 stripe listen --forward-to localhost:3000/webhooks/stripe
```

### 2. Configuration (.env)Create a `.env` file in the root of the project.
**Note:** You must manually create an empty database in MySQL (e.g., named `coop_on`) before proceeding.

Copy the following configuration into your `.env` file:

```bash
NODE_ENV=development
PORT=3000
# Update 'user' and 'password' to match your local MySQL credentials
DATABASE_URL=mysql://user:password@127.0.0.1:3306/coop_on
AUTH_JWT_SECRET = <YOUR_JWT_SECRET>
LOG_LEVELS=["log", "error", "warn", "debug"]
STRIPE_API_KEY = <YOUR_SECRET_STRIPE_API_KEY>
STRIPE_WEBHOOK_SECRET = <YOUR_GENERATED_WEBHOOK_SCRET>

```

### 3. Database Setup
Run the migrations to create the tables and seed the database with test data:

```bash
# Apply migrations (create tables)
pnpm db:migrate

# Seed database (populate with test users, events, wallets)
pnpm db:seed

```

### 4. Running the Application
| Environment     | Command          | Description |
| --------------- | ---------------- | ------------------------------------------------ |
| **Development** | `pnpm start:dev` | Starts the server in 'watch mode' (restarts on file changes). |
| **Production** | `pnpm start:prod` | Starts the optimized build (requires `pnpm build` first). |

---

## 🖥️ Frontend (Vite React)

A simple admin frontend lives in `frontend/` to explore the API. Start it after the backend:

```bash
cd frontend
pnpm install
pnpm dev
```

By default the UI expects the backend at `http://localhost:3000/api`. Adjust the base URL in the sidebar if needed.

---

## 🧪 Testing
This project includes **End-to-End (E2E) integration test suite**.

**Instructions:**

1. Ensure a `.env.test` file exists (it can be empty).
2. Run the test command:

```bash
pnpm test:e2e

```

When running tests, a temporary test database is automatically created and dropped for each test suite. You do **not** need to configure a specific database URL in `.env.test`.

> **Note:** Logging is disabled during testing to keep the output clean. The User-module tests may take slightly longer (±6s) due to cryptographic operations (password hashing).

---

## 🐳 Deployment (Production)To deploy this application to a production environment:

1. Install dependencies: `pnpm install`
2. Ensure all environment variables (DATABASE_URL, etc.) are set in the host environment.
3. Build the application: `pnpm build`
4. Run migrations on the production database: `pnpm db:migrate`
5. Start the server: `pnpm start:prod`
