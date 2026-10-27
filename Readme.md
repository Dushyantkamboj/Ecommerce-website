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
- **Order Placement:** Complete a purchase and view the order success page.
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
```

Use the exact environment variable names expected by your backend configuration. Add any other required variables, such as an email configuration, if those features are enabled.

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

- Integrate a real payment gateway.
- Add order tracking and cancellation.
- Add product reviews and ratings.
- Add pagination and advanced search.
- Add automated tests and deployment.
- Improve reporting and sales analytics for administrators.

## 📄 License

This project is intended for learning and development. Add a license if you plan to distribute or publish it publicly.