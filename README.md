# URL Shortener Web Application

A scalable URL shortener built with Node.js, Express.js, MongoDB, and JWT authentication. This application allows users to shorten URLs, create custom aliases, generate QR codes, set expiration dates, and manage their URLs through a user dashboard.

## Features

- Shorten URLs (both for authenticated and anonymous users)
- Custom aliases for shortened URLs
- QR code generation for shortened URLs
- URL expiration options (1 hour, 1 day, 7 days, 30 days, or never)
- User registration and login with JWT authentication
- User dashboard to manage shortened URLs
- Click tracking for shortened URLs
- Copy to clipboard functionality
- Mobile-friendly design with Bootstrap 5
- Reusable Pug templates

## Tech Stack

- **Frontend:** Pug, HTML5, Bootstrap 5, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) with bcrypt for password hashing
- **Security:** Express-validator, Helmet, Rate limiting
- **QR Code:** QRCode.js library

## Prerequisites

- Node.js (v14 or above)
- MongoDB (local or Atlas URI)
- NPM or Yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/url-shortener.git
   cd url-shortener
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with the following variables:
   ```
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/urlshortener
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   BASE_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:3000`

## Project Structure

```
url-shortener/
│
├── public/            # Static assets
│   └── styles.css
│
├── views/             # Pug templates
│   ├── layouts/       # Base layout templates
│   │   └── layout.pug
│   ├── partials/      # Reusable components
│   │   ├── header.pug
│   │   ├── footer.pug
│   │   └── url-form.pug
│   ├── auth/          # Auth-related views
│   │   ├── login.pug
│   │   └── register.pug
│   ├── dashboard.pug  # Mini dashboard for user
│   ├── error.pug      # Error page
│   └── index.pug      # Home page
│
├── models/
│   ├── Url.js         # Shortened URL model
│   └── User.js        # User model
│
├── routes/
│   ├── index.js       # Homepage and public routes
│   ├── url.js         # Shorten/redirect routes
│   └── auth.js        # Login/Register routes
│
├── controllers/
│   ├── urlController.js    # URL logic
│   └── authController.js   # Auth logic
│
├── middleware/
│   ├── auth.js             # JWT verification middleware
│   ├── validateUrl.js      # URL validation middleware
│   ├── errorHandler.js     # Error handling middleware
│   └── rateLimit.js        # Rate limiting middleware
│
├── config/
│   └── db.js          # MongoDB config
│
├── .env
├── app.js
└── package.json
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate user and get JWT
- `GET /auth/logout` - Log out user (clear JWT)

### URLs

- `POST /url/shorten` - Create short URL (public)
- `POST /url/shorten/auth` - Create short URL (authenticated)
- `POST /url/delete/:id` - Delete a URL (authenticated only)
- `GET /url/qrcode/:id` - Generate QR code for URL (authenticated only)
- `GET /:shortId` - Redirect to original URL

## Advanced Features

### Custom Aliases

Users can specify their own custom alias for shortened URLs. Custom aliases must:
- Be 3-20 characters long
- Contain only letters, numbers, hyphens, and underscores
- Be unique in the system

### QR Code Generation

QR codes are automatically generated for each shortened URL.
- View QR codes directly in the dashboard
- Download QR codes as PNG images
- QR codes are regenerated if the URL changes

### URL Expiration

Users can set expiration times for their shortened URLs:
- 1 hour
- 1 day
- 7 days
- 30 days
- Never (default)
