

# MaceyRunners — Delivery Service Platform
**Owner:** Emanuel Macey | **Currency:** GYD (Guyanese Dollars) | **Colors:** Deep Red, Black, White

---

## Phase 1: Foundation & Authentication
Set up the core infrastructure that everything else depends on.

- **Landing Page** — Hero section, How It Works, Services, Pricing, CTA buttons. Modern Uber Eats / Instacart inspired design with deep red + black + white theme, bold typography, smooth animations, mobile-first
- **Supabase Backend** — Database tables (profiles, orders, drivers, payments, promo_codes, notifications), Row Level Security, role-based access (customer, driver, admin)
- **Authentication** — Sign up, Login, Forgot password, Email verification. Role-based redirects to correct dashboard after login
- **Protected Routes** — Customers → Customer App, Drivers → Driver Dashboard, Admin → Admin Dashboard

## Phase 2: Customer Ordering Flow
The core customer experience — placing and paying for orders.

- **Customer Dashboard** — Clean order placement UI with two order types: Delivery ($1,000 GYD) and Errand ($1,500 GYD)
- **Address Management** — Save and select delivery addresses
- **Errand Image Upload** — Upload images for errand requests using Supabase Storage
- **Order History** — View past orders with status
- **Order Cancellation** — Cancel before a driver accepts

## Phase 3: Stripe & Cash Payments
Enable customers to pay for orders.

- **Stripe Integration** — Card payments with webhook confirmation, payment status tracking
- **Cash on Delivery** — Option to select cash payment
- **Promo Codes** — Apply discount codes at checkout
- **Admin Payment View** — See Paid / Pending / Refunded statuses, process refunds

## Phase 4: Driver Dashboard
Let drivers receive and fulfill orders.

- **Online/Offline Toggle** — Drivers control availability
- **Order Alerts** — Real-time incoming order notifications with sound alert and in-app popup
- **Accept/Reject Flow** — 30-second timer, auto-reassign if not accepted
- **Order Status Updates** — Mark as Accepted → Picked Up → On the Way → Delivered
- **Customer Contact** — Call customer directly from order details

## Phase 5: Admin Dashboard
Full control panel for Emanuel.

- **User Management** — View all users, approve drivers, suspend accounts
- **Order Management** — View all orders, manually assign drivers
- **Pricing Control** — Update delivery and errand pricing
- **Promo Code Management** — Create and manage discount codes
- **Revenue Analytics** — Dashboard with charts showing earnings, order volume, trends
- **Stripe Payment Logs** — View and manage all payments

## Phase 6: Real-Time Tracking
Live map tracking for customers and drivers.

- **Google Maps Integration** — Display map with driver location and route
- **Live Location Updates** — Driver location broadcasts every 5 seconds via Supabase Realtime
- **Route Display** — Show pickup to drop-off route on map
- **Customer Tracking View** — Customers watch their driver in real-time

## Phase 7: Notifications & Chat
Keep everyone informed and connected.

- **Browser Push Notifications** — Service worker registration, permission requests, push token storage, background notification handling
- **Supabase Realtime Notifications** — In-app notifications for order events (placed, accepted, on the way, delivered, cancelled, payment successful)
- **Email Notifications via Resend** — Confirmation emails with fallback if push fails
- **Customer-Driver Chat** — Real-time messaging within an active order
- **Admin Broadcast** — Send push notifications to all users, drivers only, or customers only

