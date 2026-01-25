# LaraibCreative - Full-Stack E-Commerce Platform

[![Build Status](https://img.shields.io/vercel/build/YOUR_VERCEL_PROJECT_ID?token=YOUR_VERCEL_TOKEN&label=vercel-build)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This repository contains the full-stack LaraibCreative platform (frontend + backend) for bespoke Pakistani fashion e-commerce. The frontend is built with **Next.js 14** (App Router) and the backend runs on **Node.js/Express** with JWT-based authentication.

**[View Live Demo (https://www.laraibcreative.studio/)](#)**

---

## 🌟 Key Features

This application is a complete e-commerce solution with a separate admin panel.

### Customer-Facing Features
* **Full E-commerce Flow:** Browse products, add to cart, and complete a multi-step checkout.
* **Bespoke Custom Orders:** A unique wizard for customers to submit designs, measurements, and fabric choices.
* **Customer Accounts:** Users can sign up, log in, and manage their profile, saved addresses, and measurement sets.
* **Order Tracking:** View order history, order details, and real-time status timelines.
* **Dynamic Content:** Full-featured blog, product reviews, and static pages (About Us, FAQ, Size Guide).
* **Rich Product Experience:** Advanced search, dynamic filters, image galleries with zoom, and related products.

### Admin Panel Features
* **Analytics Dashboard:** View key metrics like revenue, new orders, and popular products.
* **Order Management:** View all orders, update statuses (e.g., "In Progress," "Shipped"), and verify payments.
* **Product Management:** Create, read, update, and delete products, including managing images and inventory.
* **Customer Management (CRM):** View customer details, order history, and saved measurements.
* **Content Management (CMS):** Update homepage content, manage blog posts, and edit site settings.

## 🚀 Tech Stack

* **Frontend:** [Next.js](https://nextjs.org/) 14 (App Router), Tailwind CSS, Zustand, Axios
* **Backend:** Node.js/Express, JWT auth (httpOnly cookies), MongoDB
* **Testing:** Jest, React Testing Library, Playwright (E2E)
* **Infra/Docs:** Roadmap + hybrid architecture docs in `/docs`

## 📂 Folder Structure

The project uses a feature-colocated structure within the Next.js App Router. Here is a high-level overview of the `src/` directory:

---

## 📌 Phase 0 Baseline Docs
- `docs/PHASE_0_AUDIT_BASELINE.md` — current-state baseline + open decisions
- `docs/PERFORMANCE_BUDGETS.md` — Core Web Vitals + API latency targets
- `docs/adr/README.md` — ADR index (auth strategy, data ownership, caching)
