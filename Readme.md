# E-Commerce Web Application

A full-stack e-commerce web application built using React, Node.js, Express.js, Sequelize ORM, and MySQL. The application provides a shopping platform where customers can browse products, manage their cart, apply discounts and coupons, and place orders. Administrators can manage products and monitor customer purchases through an admin dashboard.

## 🚀 Features

### 👨‍💼 Admin Panel — Role Type 1

- **Admin Authentication:** Secure registration and login with role-based access.
- **Product Management:** Add, update, view, and delete products.
- **Product Images:** Upload and manage product images.
- **Inventory Management:** Manage product stock and availability.
- **Product Discounts:** Set and update product-level discount percentages.
- **Coupon Management:** Create and manage discount coupons with configurable usage limits and eligibility rules.
- **Customer Management:** View registered customers.
- **Purchase History:** View customer orders and purchase details.
- **Protected Routes:** Restrict administrative pages and operations to authorized administrators.

### 🛍️ Customer Panel — Role Type 2

- **User Authentication:** Register and log in to a customer account.
- **Browse Products:** View available products and product details.
- **Search and Filter:** Find products and filter or sort product listings.
- **Shopping Cart:** Add products, update quantities, and remove items.
- **Discounted Pricing:** View original prices, discounted prices, and savings.
- **Coupon Application:** Apply eligible coupons during checkout.
- **Checkout:** Review cart items, discounts, and the payable amount before placing an order.
- **Razorpay Payments:** Pay securely through Razorpay with server-side amount calculation and signature verification.
- **Order Placement:** Orders are confirmed only after a verified payment, then the success page is shown.
- **Purchase History:** View previous orders and purchased products.
- **Profile Management:** Access customer profile information and account features.

## 🧑‍💻 Technology Stack

### Frontend

- React.js
- React Router DOM
- Axios
- Context API
- Tailwind CSS / CSS
- JavaScript

### Backend

- Node.js
- Express.js
- Sequelize ORM
- JWT Authentication
- bcrypt password hashing
- Joi validation
- Multer for file uploads
- Razorpay Node SDK for payment orders
- dotenv for environment configuration

### Database

- MySQL
- phpMyAdmin for database management

## 🔐 Role-Based Access Control

The application supports two roles:

| Role | Type | Permissions |
|---|---:|---|
| Admin | `1` | Manage products, discounts, coupons, customers, and purchase history |
| Customer | `2` | Browse products, manage cart, apply coupons, place orders, and view purchase history |

Protected backend routes validate authorization so that customers cannot perform administrator-only operations. Customer-specific purchase actions must also be validated on the backend.

## 💰 Pricing, Discounts, and Coupons

The application supports product-level discounts and coupon-based discounts.

- Administrators can configure product discounts.
- Customers can see the original and discounted prices.
- Customers can apply eligible coupons during checkout.
- Coupon rules can include minimum order amounts and usage limits.
- The backend should calculate and validate the final price rather than trusting amounts submitted by the frontend.
- Purchase records should store the actual unit price paid and the relevant order totals.

## 🗄️ Database

The application uses MySQL with Sequelize ORM to define models and relationships.

Main entities include:

- **Users:** Stores customer and administrator account information.
- **Products:** Stores product details, prices, stock, image paths, and discounts.
- **Orders:** Stores customer purchase records and order totals.
- **Order Items:** Stores products, quantities, and prices associated with each order.
- **Coupons:** Stores coupon codes, discount rules, and usage limits.

The exact tables and fields depend on the current database models and migrations.

## 💳 Razorpay Payment Flow

1. The customer clicks **Proceed to Checkout** in the cart.
2. `POST /api_v1/payment/create-order` recalculates item prices, product discounts, delivery charges, and coupon discount on the server.
3. The backend creates a Razorpay order, saves a pending order and its items, and returns the Razorpay order id and public key id.
4. The browser opens the Razorpay checkout modal with that order id.
5. On success, `POST /api_v1/payment/verify` verifies the `razorpay_signature` using HMAC-SHA256, marks the order as paid, reduces stock, and updates coupon usage.
6. On failure, `POST /api_v1/payment/failed` marks the pending order as failed so it never appears in purchase history.
7. The cart is cleared and the customer is taken to the payment success page.

No order is marked as paid until the signature check passes. The `/api_v1/product/buying` endpoint is kept only for backwards compatibility and now also starts the Razorpay flow.

## ⚙️ Installation and Setup

### Prerequisites

Install the following before starting:

- Node.js and npm
- MySQL Server
- Git
- A code editor such as Visual Studio Code

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <your-project-folder>
```

### 2. Set up the backend

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file in the backend root:

```env
PORT=3000
API_VERSION=api_v1

DB_HOST=localhost
DB_PORT=3306
DB_NAME=myfirstdb
DB_USER=root
DB_PASSWORD=

JWT_SECRET=replace_with_a_secure_random_secret

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=replace_with_your_razorpay_key_secret
```

Use the exact environment variable names expected by your backend configuration. Add any other required variables, such as an email configuration, if those features are enabled. Copy `backend/.env.example` to `backend/.env` and fill in your values.

Create a `.env` file in the frontend root (or copy `frontend/.env.example`):

```env
VITE_API_URL=https://api.yourdomain.com
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
```

`VITE_API_URL` tells the frontend where the Express backend lives. It defaults to `http://localhost:3000` for local development. When deploying the frontend to Vercel, set it to your public **HTTPS** backend URL.

The frontend key id is public. The key secret must only exist in the backend `.env` and must never be exposed to the browser.

### 3. Set up the database

1. Start MySQL.
2. Create the database named `myfirstdb` using MySQL or phpMyAdmin.
3. Verify the database credentials in `.env`.
4. Start the backend and ensure the Sequelize models and associations are configured correctly.

```sql
CREATE DATABASE myfirstdb;
```

### 4. Start the backend server

```bash
npm run dev
```

The backend will run on the port configured in `.env`, which is `3000` in this example.

### 5. Set up the frontend

Open a second terminal and navigate to your frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by your frontend development server, typically `http://localhost:5173`.

> Adjust the directory names and commands if your project uses a different setup.

## 🔗 API Overview

The backend uses REST APIs to communicate with the React frontend.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api_v1/product/list` | Retrieve products |
| GET | `/api_v1/product/details/:id` | Retrieve product details |
| POST | `/api_v1/product/add` | Add a product (admin) |
| PATCH | `/api_v1/product/update/:id` | Update a product (admin) |
| DELETE | `/api_v1/product/delete/:id` | Delete a product (admin) |
| GET | `/api_v1/user/list` | Retrieve the user/product listing exposed by the configured route |
| GET | `/api_v1/user/history` | Retrieve purchase history, subject to authorization |

Authentication, registration, checkout, coupon, and discount endpoints depend on the routes configured in the current backend.

## 🔒 Security

- Passwords should be hashed using bcrypt.
- Authentication should validate JWTs on protected backend routes.
- Role permissions must be enforced on the backend, not only in the frontend.
- Secrets and database credentials must remain in `.env`.
- Uploaded files should be validated before being stored.
- Coupon eligibility, usage limits, stock, and order totals must be validated on the backend.
- Never commit real credentials or private configuration files to Git.

## 🚀 Deploy the frontend on Vercel

The React app can be deployed on Vercel while the Express/MySQL backend keeps running on your Ubuntu server.

1. Push the latest code to GitHub.
2. In Vercel, choose **Add New → Project** and import `Dushyantkamboj/Ecommerce-website`.
3. Configure the project:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add an environment variable:
   - `VITE_API_URL` = your public backend URL, e.g. `https://api.yourdomain.com`
5. Click **Deploy**.

`frontend/vercel.json` contains the SPA rewrite so routes like `/adminlogin` and `/cart` work after a page refresh.

> The backend must be served over **HTTPS**. A Vercel site is HTTPS-only, so an `http://` backend URL will be blocked as mixed content. Put the Ubuntu backend behind Nginx with a Let's Encrypt certificate, or move it to a host that provides HTTPS.

## 📁 Project Structure

```text
project/
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── model/
│   │   ├── routes/
│   │   ├── controller/
│   │   ├── middleware/
│   │   └── utils/
│   ├── uploads/
│   ├── .env
│   ├── .gitignore
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── component/
    │   ├── context/
    │   ├── pages/
    │   └── App.jsx
    └── package.json
```

This is an illustrative structure; update it to match your actual project folders.

## 🎯 Project Objective

The goal of this project is to develop a full-stack e-commerce application while learning and applying frontend development, REST API design, database relationships, authentication, role-based authorization, state management, file uploads, and secure order processing.

## 👨‍🎓 Learning Outcomes

- Building dynamic user interfaces with React.
- Managing shared state using Context API.
- Handling API requests with Axios.
- Creating REST APIs using Node.js and Express.
- Designing relational database models with Sequelize and MySQL.
- Implementing authentication and role-based access control.
- Managing products, carts, orders, discounts, and coupons.
- Validating purchase calculations on the backend.

## 📌 Future Improvements

- Add order tracking and cancellation.
- Add product reviews and ratings.
- Add pagination and advanced search.
- Add automated tests.
- Improve reporting and sales analytics for administrators.

## 📄 License

This project is intended for learning and development. Add a license if you plan to distribute or publish it publicly.