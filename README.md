# Dosti Cafe POS

React + TypeScript cafe POS with QR-based customer self-ordering demo and a small Express API for cross-device order handoff.

## Requirements
- Node.js 18+
- npm

## Install
```bash
npm install
```

## Run frontend and API together
```bash
npm run dev:all
```
- POS web app: http://localhost:5173
- API: http://localhost:4000

You can also run them separately in two terminals:
```bash
npm run server
npm run dev
```

## Demo owner login
- Email: `owner@dosticafe.com`
- Password: `123456`

## Configure customer QR ordering
1. Sign in as Owner.
2. Open **QR Ordering** from the sidebar.
3. Enter the cafe's real UPI ID/VPA (example format: `yourcafe@okaxis`) and display name.
4. Keep customer QR ordering enabled.
5. Click **Save Settings & Sync Menu**.
6. Download or print the QR and scan it using a phone.
7. Customer opens the menu, adds items, enters name/mobile, chooses Dine-in or Takeaway, then proceeds to UPI.
8. Customer taps **I have completed the payment** after paying in their UPI app.
9. The POS Orders page receives the order. Owner/Branch Manager must check the actual bank/UPI credit and click **Verify UPI & Accept**. Only after this manual verification is the KOT sent to kitchen.

## Important QR deployment notes
- The QR encodes the public URL of the current app. `localhost` QR codes cannot be scanned and opened from another phone. Deploy the frontend and API on an internet-accessible HTTPS domain before using customer phones.
- Vite proxies `/api` to `http://localhost:4000` during local development. In production, configure your hosting/reverse proxy to route `/api` to the Express API server.
- API data is stored in `server/store.json` for this demo. Back up this file. Replace this demo JSON store with MySQL before production use.
- Customer orders and menu sync use the Express API, so the POS computer and customer phones share orders when connected to the same deployed API.

## UPI payment limitation
This demo opens a UPI app using a `upi://pay` intent with the configured VPA and exact order amount. The browser cannot independently verify that money reached the cafe bank account. The customer can only submit a payment-completed claim; staff must verify the credit in the merchant UPI/bank app before accepting the order. For automatic verification, integrate a payment gateway (for example Razorpay) with server-side payment signature verification and webhooks. Do not treat the customer's button click as proof of payment.

## Production security checklist
This project still contains demo authentication and demo API routes. Before public production deployment, implement server-side JWT/session authentication, role and branch authorization on every admin API, rate limiting, input validation, HTTPS, secure secrets, payment gateway webhooks, and MySQL persistence. Do not expose the demo admin API routes publicly without those protections.
