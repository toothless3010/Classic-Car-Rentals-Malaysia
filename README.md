# Classic Car Rentals Malaysia – MVC Web App

An Express + Prisma MVC web application for Classic Car Rentals Malaysia. The project focuses on delivering a concierge-style booking experience, optimised for modern browsers (Safari, Chrome, Edge) with a lightweight stack that is easy to extend and integrate with payment and social channels.

## ✨ Features

- **Responsive marketing site** with hero messaging, curated fleet highlights, rate packages, services, and FAQs.
- **Dynamic fleet pages** driven by Prisma models, including car galleries, specifications, and related vehicle suggestions.
- **Interactive booking flow** with deposit calculator (50% by default), outstation flag, and concierge-friendly validation.
- **Service catalogue** to showcase rentals, buy/sell programmes, insurance renewals, restoration management, and more.
- **RESTful API layer** (`/api/...`) exposing cars, services, rate packages, and booking submission endpoints for third-party integrations.
- **Brand kit page** detailing colours, typography, tone, and logo usage to ensure consistent marketing output.
- **Prisma + SQLite data layer** with seed script for sample cars, services, FAQs, and social links that can be adapted for production databases.
- **Helmet-enabled security headers** with a CSP tuned for the bundled assets.

## 🧱 Tech Stack

- **Node.js 18+**
- **Express 5** (server, routing, validation)
- **EJS** templates + vanilla JS + custom CSS (no heavy front-end framework)
- **Prisma ORM** with SQLite by default (swap to PostgreSQL/MySQL easily)
- **Day.js** for date handling
- **Helmet, compression, express-session, connect-flash** for production-readiness

## 🚀 Getting Started

```bash
git clone <repo-url>
cd Classic-Car-Rentals-Malaysia
npm install

# Apply migrations & generate Prisma client
npx prisma migrate dev --name init

# Seed sample data (cars, services, FAQs, social links)
npm run prisma:seed

# Start development server
npm run dev   # http://localhost:3000
```

For a production build you can run `npm run start` after configuring environment variables and deploying to your preferred host (Render, Railway, Fly.io, etc.).

## 🔧 Environment Configuration

Create a `.env` file (already scaffolded) and adjust as needed:

```
DATABASE_URL="file:./dev.db"
SESSION_SECRET="choose-a-secure-random-string"
PORT=3000
# Optional
STRIPE_PAYMENT_LINK="https://buy.stripe.com/..."
DEFAULT_OUTSTATION_FEE=1200
DEFAULT_HOURLY_RATE=550
DEFAULT_MIN_HOURS=3
# Admin access
ADMIN_PASSWORD="drive-classics"
```

- `STRIPE_PAYMENT_LINK` – if provided, the booking confirmation screen will surface a “Pay deposit online” button.
- `DEFAULT_OUTSTATION_FEE` – controls the estimated towing/outstation amount shown in the quote summary (set to blank to display “To be confirmed”).
- `DEFAULT_HOURLY_RATE` / `DEFAULT_MIN_HOURS` – override global defaults when cars do not specify their own values.
- `ADMIN_PASSWORD` – concierge dashboard password (defaults to `drive-classics` if omitted).

## 📂 Project Structure

```
src/
  app.js             # Express app configuration
  server.js          # HTTP bootstrap & graceful shutdown
  controllers/       # Home, fleet, booking, services, contact logic
  routes/            # Web + API routers
  lib/               # Prisma client, booking helpers
  middleware/        # async handler helper
  views/             # EJS templates (partials + pages)
public/
  styles/main.css    # Custom responsive design
  scripts/main.js    # Navigation, gallery, booking calculator
  images/hero-car.svg
  src/views/admin/     # Admin dashboard layouts, forms, and tables
prisma/
  schema.prisma      # Data models
  seed.js            # Seed script with sample data
```

## 🧭 Customisation Guide

- **Brand colours & tagline** – update `src/app.js` (`app.locals.brand`) to match official branding, contact channels, or WhatsApp links.
- **Fleet & services** – add/edit entries via Prisma (adjust `prisma/seed.js`, run `npm run prisma:seed`, or interact via Prisma Studio).
- **Policies, testimonials, press** – extend the existing views with more sections or create new Prisma models.
- **Payment integrations** – replace the Stripe payment link placeholder with your preferred gateway (ToyyibPay, iPay88, SenangPay, Stripe, etc.) by adding new controller logic after bookings are persisted.
- **Social feeds & automation** – use the `/api` endpoints to publish car listings to Facebook/Instagram or integrate with Zapier/Make.

## 🛠 Admin Dashboard

- Visit `/admin/login` (link in footer) and authenticate with `ADMIN_PASSWORD`.
- Dashboard widgets highlight fleet size, booking pipeline, and deposit totals.
- Manage resources:
  - **Cars** – create/edit/delete listings, update specs, upload image URLs (primary image = first line).
  - **Bookings** – review enquiries, update status (Pending → Confirmed → Paid → Completed/Cancelled).
  - **Rate Packages** – adjust pricing tiers and durations inline.
  - **Services** – maintain concierge offerings with summaries and long-form descriptions.
- Admin UI is built with the same responsive CSS and works across desktop/tablet.

## ✅ Testing & Validation

- Booking form uses `express-validator` to ensure valid contact details and future-dated events.
- Front-end estimator mirrors server-side pricing logic for consistency.
- Helmet CSP allows only `self`, CDN fonts, and `main.js`. No inline scripts/styles are required aside from Google Fonts.

## 🔄 Next Steps & Ideas

- Add authentication and an admin dashboard to manage fleet entries, bookings, and owner payouts.
- Integrate WhatsApp Cloud API for instant concierge notifications.
- Swap SQLite for PostgreSQL or MySQL when moving to production.
- Implement automated emails/SMS after booking submission.

---

Need help extending the platform (custom payment flow, admin CMS, or CRM integration)? Reach out and we can plan the next sprint. 🚗💍📸
