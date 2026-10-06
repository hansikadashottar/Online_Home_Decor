# OnlineHomeDecor Frontend

React + Vite frontend for the OnlineHomeDecor / HOMELY Spring Boot backend.

## Run locally

1. Make sure the Spring Boot backend is running on `http://localhost:8080`.
2. Open this frontend folder in IntelliJ or VS Code.
3. Run:

```bash
npm install
npm run dev
```

4. Open the Vite URL shown in the terminal, normally `http://localhost:5174`.

## Razorpay

The frontend reads the Razorpay public key from `.env` using:

```text
VITE_RAZORPAY_KEY_ID=...
```

The Razorpay **secret key stays only in the backend**. Never move it into frontend code.

## Backend files required for this frontend

Replace these two backend files from the supplied backend project with the versions provided with this delivery:

```text
src/main/java/com/homedecor/onlinehomedecor/config/SecurityConfig.java
src/main/java/com/homedecor/onlinehomedecor/controller/OrderController.java
```

The first fixes admin-order authorization rule ordering. The second makes order creation return the created order JSON (including `orderId`) so the frontend can create and verify the Razorpay payment for that order.

## Connected functionality

- Customer registration, login, logout and automatic expired-token logout
- Customer profile view, edit and account deletion
- Product listing, category filtering and backend name search
- Product details and live stock display
- Add/update/remove/clear cart
- Customer order creation, history, details and cancellation
- Stock reduction during order creation is performed by the backend
- COD and Razorpay checkout + backend signature verification
- Customer payment status on order details
- Admin dashboard with live counts
- Admin product CRUD
- Admin category CRUD
- Admin order status management using the backend's supported statuses
- Admin payment records
- Four Home Inspiration cards
