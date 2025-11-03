# Bookstore Frontend

React frontend application for the Online Bookstore Platform microservices.

## Features

- 🛍️ Browse and search books
- 👤 User authentication (login/register)
- 🛒 Shopping cart functionality
- 📦 Order management
- ⭐ Book reviews and ratings
- 💳 Payment processing
- 📱 Responsive design

## Tech Stack

- React 18
- React Router v6
- Axios for API calls
- Modern CSS with CSS Variables

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Running microservices backend (see main README.md)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.development

# Update .env.development with your local backend URLs
```

### Development

```bash
# Start development server
npm start

# Open http://localhost:3000
```

### Building for Production

```bash
# Build for production
npm run build

# The build folder contains optimized production files
```

### Deployment to AWS S3 + CloudFront

See [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md) for detailed instructions.

Quick deploy:
```bash
# Set environment variables
export S3_BUCKET_NAME="your-bucket-name"
export CLOUDFRONT_DISTRIBUTION_ID="your-distribution-id"

# Deploy
./deploy.sh  # Linux/Mac
# OR
.\deploy.ps1  # Windows PowerShell
```

## Environment Variables

### Development (.env.development)
```env
REACT_APP_USERS_SERVICE_URL=http://localhost:8001
REACT_APP_BOOKS_SERVICE_URL=http://localhost:8002
REACT_APP_ORDERS_SERVICE_URL=http://localhost:8003
REACT_APP_PAYMENTS_SERVICE_URL=http://localhost:8004
REACT_APP_REVIEWS_SERVICE_URL=http://localhost:8005
```

### Production (.env.production)
```env
REACT_APP_USERS_SERVICE_URL=https://api.yourdomain.com/users
REACT_APP_BOOKS_SERVICE_URL=https://api.yourdomain.com/books
REACT_APP_ORDERS_SERVICE_URL=https://api.yourdomain.com/orders
REACT_APP_PAYMENTS_SERVICE_URL=https://api.yourdomain.com/payments
REACT_APP_REVIEWS_SERVICE_URL=https://api.yourdomain.com/reviews
```

## Project Structure

```
frontend/
├── public/          # Static files
├── src/
│   ├── components/  # Reusable components
│   │   └── Layout/  # Layout components (Navbar, Footer)
│   ├── pages/       # Page components
│   ├── services/    # API service layer
│   ├── utils/       # Utility functions (auth, cart)
│   ├── App.js       # Main app component
│   └── index.js     # Entry point
├── package.json
└── README.md
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run deploy` - Build and deploy to AWS (requires AWS CLI)

## Features Implementation

### Authentication
- Login/Register pages
- Session management via localStorage
- Protected routes

### Shopping Cart
- Add/remove items
- Quantity management
- Persistent cart (localStorage)

### Order Management
- Create orders
- View order history
- Order status tracking

### Reviews
- Submit reviews
- View book ratings
- Review statistics

## API Integration

All API calls are handled through the service layer in `src/services/api.js`. Each microservice has its own API client configured with:
- Base URLs from environment variables
- Request/response interceptors
- Error handling

## Styling

- CSS Variables for theming
- Responsive design
- Modern UI components
- Consistent color scheme

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow React best practices
2. Use functional components with hooks
3. Keep components small and focused
4. Use meaningful variable names
5. Comment complex logic

## License

See main project README for license information.

