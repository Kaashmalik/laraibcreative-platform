# 🧵 Laraib Creative - Backend API

> Production-ready backend API for custom tailoring e-commerce platform built with Node.js, Express, and MongoDB.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- 🔐 **Secure Authentication** - JWT-based auth with refresh tokens
- 👥 **User Management** - Customer and admin role-based access
- 📦 **Product Management** - Full CRUD operations for products
- 🛍️ **Order Processing** - Complete order lifecycle management
- 💳 **Payment Integration** - Multiple payment methods (Bank Transfer, JazzCash, EasyPaisa, COD)
- 📸 **Image Upload** - Cloudinary integration for image storage
- 📧 **Email Notifications** - Automated email notifications using Nodemailer
- 💬 **WhatsApp Integration** - Order updates via WhatsApp using Twilio
- 📊 **Analytics Dashboard** - Sales and order analytics
- 🔍 **Search & Filters** - Advanced product search and filtering
- 📝 **Blog Management** - CMS for blog posts
- ⭐ **Review System** - Product reviews and ratings

### Custom Tailoring Features
- 📏 **Measurement Management** - Store customer measurements
- 👗 **Custom Orders** - Handle custom stitching requests
- 🎨 **Design References** - Upload reference images
- 📋 **Order Tracking** - Real-time order status updates

### Security Features
- 🔒 Helmet.js for security headers
- 🛡️ Rate limiting to prevent brute force
- 🚫 NoSQL injection protection
- 🔐 Password hashing with bcrypt
- 🍪 Secure HTTP-only cookies
- ✅ Input validation and sanitization

## 🛠️ Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **WhatsApp**: Twilio API
- **Validation**: Joi
- **Logging**: Winston & Morgan
- **Security**: Helmet, express-rate-limit, express-mongo-sanitize
- **PDF Generation**: PDFKit
- **Image Processing**: Sharp

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (Atlas or local)
- **Git**

### Required Accounts

You'll need accounts for:
- MongoDB Atlas (free tier available)
- Cloudinary (for image storage)
- Gmail (for SMTP email)
- Twilio (optional - for WhatsApp)

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/laraibcreative-backend.git
cd laraibcreative-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` file with your credentials (see [Environment Variables](#environment-variables) section).

### 4. Create required directories

```bash
mkdir -p uploads/temp uploads/receipts uploads/references logs
```

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure the following:

### Essential Variables

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Secrets (generate secure random strings)
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Admin Account
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_password
```

**Note**: To generate Gmail App Password:
1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail"
4. Use that password in `EMAIL_PASSWORD`

## 🎯 Running the Application

### Development Mode

```bash
npm run dev
```

Server will start on `http://localhost:5000` with hot reload enabled.

### Production Mode

```bash
npm start
```

### Seed Database

```bash
# Seed all data
npm run seed

# Seed specific data
npm run seed:categories
npm run seed:products
npm run seed:settings
```

### Other Commands

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Backup database
npm run backup
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── db.js        # MongoDB connection
│   │   ├── constants.js # App constants
│   │   └── cloudinary.js
│   │
│   ├── models/          # Mongoose models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── ...
│   │
│   ├── controllers/     # Route controllers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── ...
│   │
│   ├── routes/          # API routes
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   └── ...
│   │
│   ├── middleware/      # Custom middleware
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.js
│   │   └── ...
│   │
│   ├── utils/           # Utility functions
│   │   ├── emailService.js
│   │   ├── whatsappService.js
│   │   └── ...
│   │
│   └── seeds/           # Database seeders
│       └── ...
│
├── uploads/             # Temporary uploads
├── logs/                # Application logs
├── tests/               # Test files
├── .env                 # Environment variables
├── .env.example         # Example env file
├── .gitignore
├── server.js            # Entry point
├── package.json
└── README.md
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication Endpoints

```
POST   /api/v1/auth/register      - Register new user
POST   /api/v1/auth/login         - Login user
POST   /api/v1/auth/logout        - Logout user
POST   /api/v1/auth/refresh       - Refresh access token
POST   /api/v1/auth/forgot-password - Request password reset
POST   /api/v1/auth/reset-password - Reset password
GET    /api/v1/auth/me           - Get current user
```

### Product Endpoints

```
GET    /api/v1/products           - Get all products
GET    /api/v1/products/:id       - Get single product
POST   /api/v1/products           - Create product (Admin)
PUT    /api/v1/products/:id       - Update product (Admin)
DELETE /api/v1/products/:id       - Delete product (Admin)
```

### Order Endpoints

```
GET    /api/v1/orders             - Get user orders
GET    /api/v1/orders/:id         - Get single order
POST   /api/v1/orders             - Create order
PUT    /api/v1/orders/:id/status  - Update order status (Admin)
POST   /api/v1/orders/:id/verify  - Verify payment (Admin)
```

*Full API documentation will be available at `/api/docs` (coming soon)*

## 🗄️ Database Schema

### User Model
- Email, password (hashed)
- Name, phone, address
- Role (customer/admin)
- Measurements
- Order history

### Product Model
- Title, description, SKU
- Category, fabric type
- Price, stock quantity
- Images (Cloudinary URLs)
- Sizes available
- Custom order options

### Order Model
- Customer details
- Order items
- Payment method & status
- Shipping address
- Order status tracking
- Custom measurements (if applicable)

*Detailed schema documentation available in `/docs/schema.md`*

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚢 Deployment

### Prerequisites
- Node.js hosting (Heroku, DigitalOcean, Railway, etc.)
- MongoDB Atlas account
- Domain name (optional)

### Steps

1. **Set environment to production**
```env
NODE_ENV=production
```

2. **Deploy to your platform**

**Heroku:**
```bash
heroku create laraibcreative-api
heroku config:set $(cat .env | xargs)
git push heroku main
```

**Railway:**
```bash
railway login
railway init
railway up
```

3. **Set up environment variables** on your hosting platform

4. **Run database seeds** (if needed)
```bash
npm run seed
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Muhammad Kashif**
- Email: kaash0297@gmail.com
- Phone: +92 302 0718182
- Location: Lahore, Pakistan

## 🙏 Acknowledgments

- Express.js team
- MongoDB team
- All open-source contributors

## 📞 Support

For support, email kaash0297@gmail.com or WhatsApp +92 302 0718182

---

Made with ❤️ by Laraib Creative