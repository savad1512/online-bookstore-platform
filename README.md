# Online Bookstore Platform - Microservices Architecture

A complete Django-based microservices application for an online bookstore platform, featuring 5 independent microservices with REST APIs, containerization, and PostgreSQL database connectivity.

## 🏗️ Architecture Overview

The application consists of:

### Backend Microservices (5 Django Services)

1. **Users Service** (Port 8001) - User registration, authentication, and profile management
2. **Books Service** (Port 8002) - Book catalog management with categories
3. **Orders Service** (Port 8003) - Order management and processing
4. **Payments Service** (Port 8004) - Payment processing and transaction management
5. **Reviews Service** (Port 8005) - Book reviews and ratings

Each service has its own:
- Django REST Framework APIs
- PostgreSQL database
- Docker container
- Independent deployment capability

### Frontend Application

- **React Frontend** - Modern, responsive web application
  - User authentication and profiles
  - Book browsing and search
  - Shopping cart and checkout
  - Order management
  - Book reviews and ratings
  - Ready for AWS S3 + CloudFront deployment

## 📁 Project Structure

```
online-bookstore/
├── users-service/
│   ├── accounts/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   ├── users_service/
│   ├── requirements.txt
│   └── Dockerfile
├── books-service/
│   ├── books/
│   ├── books_service/
│   ├── requirements.txt
│   └── Dockerfile
├── orders-service/
│   ├── orders/
│   ├── orders_service/
│   ├── requirements.txt
│   └── Dockerfile
├── payments-service/
│   ├── payments/
│   ├── payments_service/
│   ├── requirements.txt
│   └── Dockerfile
├── reviews-service/
│   ├── reviews/
│   ├── reviews_service/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── public/
│   ├── package.json
│   ├── deploy.sh
│   ├── deploy.ps1
│   └── AWS_DEPLOYMENT.md
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Git (optional, for cloning)

### Step 1: Clone or Navigate to Project Directory

```bash
cd microservice
```

### Step 2: Build and Start All Services

```bash
docker-compose up --build
```

This command will:
- Build Docker images for all 5 services
- Start 5 PostgreSQL database containers
- Start all microservice containers
- Run database migrations automatically
- Expose services on ports 8001-8005

### Step 3: Start Frontend (Optional)

```bash
cd frontend
npm install
npm start
```

The frontend will run on http://localhost:3000

### Step 4: Access Services

Once all containers are running, you can access:

- **Frontend**: http://localhost:3000
- **Users Service**: http://localhost:8001
- **Books Service**: http://localhost:8002
- **Orders Service**: http://localhost:8003
- **Payments Service**: http://localhost:8004
- **Reviews Service**: http://localhost:8005

### Alternative: Run Services Individually

To rebuild a specific service:

```bash
docker-compose up --build users-service
```

To stop all services:

```bash
docker-compose down
```

To stop and remove volumes (deletes database data):

```bash
docker-compose down -v
```

## 📡 API Endpoints

### Users Service (Port 8001)

- `POST /api/users/register/` - Register a new user
- `POST /api/users/login/` - User login
- `GET /api/users/` - List all users
- `GET /api/users/{id}/` - Get user details
- `GET /api/users/me/` - Get current authenticated user
- `PUT /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user

**Example Registration:**
```bash
curl -X POST http://localhost:8001/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "password2": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Books Service (Port 8002)

- `GET /api/books/` - List all books
- `POST /api/books/` - Create a book
- `GET /api/books/{id}/` - Get book details
- `PUT /api/books/{id}/` - Update book
- `DELETE /api/books/{id}/` - Delete book
- `GET /api/books/by_category/?category_id=1` - Get books by category
- `GET /api/books/by_author/?author=AuthorName` - Get books by author
- `GET /api/books/search/?q=query` - Search books
- `GET /api/categories/` - List categories
- `POST /api/categories/` - Create category

**Example Create Book:**
```bash
curl -X POST http://localhost:8002/api/books/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "price": "29.99",
    "stock": 100,
    "description": "A classic American novel"
  }'
```

### Orders Service (Port 8003)

- `GET /api/orders/` - List all orders
- `POST /api/orders/` - Create an order
- `GET /api/orders/{id}/` - Get order details
- `PUT /api/orders/{id}/` - Update order
- `DELETE /api/orders/{id}/` - Delete order
- `GET /api/orders/by_user/?user_id=1` - Get orders by user
- `PATCH /api/orders/{id}/update_status/` - Update order status

**Example Create Order:**
```bash
curl -X POST http://localhost:8003/api/orders/ \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "shipping_address": "123 Main St, City, Country",
    "items": [
      {
        "book_id": 1,
        "quantity": 2,
        "price": 29.99
      }
    ]
  }'
```

### Payments Service (Port 8004)

- `GET /api/payments/` - List all payments
- `POST /api/payments/` - Process a payment
- `GET /api/payments/{id}/` - Get payment details
- `GET /api/payments/by_order/?order_id=1` - Get payments by order
- `GET /api/payments/by_user/?user_id=1` - Get payments by user
- `POST /api/payments/{id}/refund/` - Process refund

**Example Process Payment:**
```bash
curl -X POST http://localhost:8004/api/payments/ \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 1,
    "user_id": 1,
    "amount": "59.98",
    "payment_method": "CREDIT_CARD"
  }'
```

### Reviews Service (Port 8005)

- `GET /api/reviews/` - List all reviews
- `POST /api/reviews/` - Create a review
- `GET /api/reviews/{id}/` - Get review details
- `PUT /api/reviews/{id}/` - Update review
- `DELETE /api/reviews/{id}/` - Delete review
- `GET /api/reviews/by_book/?book_id=1` - Get reviews by book
- `GET /api/reviews/by_user/?user_id=1` - Get reviews by user
- `GET /api/reviews/book_statistics/?book_id=1` - Get book review statistics

**Example Create Review:**
```bash
curl -X POST http://localhost:8005/api/reviews/ \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": 1,
    "user_id": 1,
    "rating": 5,
    "comment": "Excellent book! Highly recommended."
  }'
```

## 🔧 Configuration

### Environment Variables

Each service uses environment variables for configuration. Key variables include:

- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DEBUG` - Django debug mode

### Inter-Service Communication

Services communicate via HTTP using environment variables:

- **Orders Service** uses:
  - `USERS_SERVICE_URL` (default: http://users-service:8001)
  - `BOOKS_SERVICE_URL` (default: http://books-service:8002)

- **Payments Service** uses:
  - `ORDERS_SERVICE_URL` (default: http://orders-service:8003)

- **Reviews Service** uses:
  - `USERS_SERVICE_URL` (default: http://users-service:8001)
  - `BOOKS_SERVICE_URL` (default: http://books-service:8002)

## 🗄️ Database Schema

Each service has its own PostgreSQL database:

- **users_db** - User accounts and profiles
- **books_db** - Books and categories
- **orders_db** - Orders and order items
- **payments_db** - Payment transactions
- **reviews_db** - Book reviews and ratings

## 🔐 Authentication

Currently, services use Django's session authentication. For production, consider:

- JWT tokens for stateless authentication
- API keys for service-to-service communication
- OAuth2 for third-party authentication

## 🧪 Testing the Services

### 1. Create a User
```bash
curl -X POST http://localhost:8001/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "testpass123", "password2": "testpass123"}'
```

### 2. Create a Book
```bash
curl -X POST http://localhost:8002/api/books/ \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Book", "author": "Test Author", "price": "19.99", "stock": 50}'
```

### 3. Create an Order
```bash
curl -X POST http://localhost:8003/api/orders/ \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "shipping_address": "123 Test St", "items": [{"book_id": 1, "quantity": 1, "price": 19.99}]}'
```

### 4. Process Payment
```bash
curl -X POST http://localhost:8004/api/payments/ \
  -H "Content-Type: application/json" \
  -d '{"order_id": 1, "user_id": 1, "amount": "19.99", "payment_method": "CREDIT_CARD"}'
```

### 5. Create a Review
```bash
curl -X POST http://localhost:8005/api/reviews/ \
  -H "Content-Type: application/json" \
  -d '{"book_id": 1, "user_id": 1, "rating": 5, "comment": "Great book!"}'
```

## 💻 Frontend Development

See [frontend/README.md](./frontend/README.md) for detailed frontend documentation.

### Quick Start

```bash
cd frontend
npm install
npm start
```

### Deploy to AWS S3 + CloudFront

See [frontend/AWS_DEPLOYMENT.md](./frontend/AWS_DEPLOYMENT.md) for complete deployment guide.

Quick deploy:
```bash
cd frontend
export S3_BUCKET_NAME="your-bucket-name"
export CLOUDFRONT_DISTRIBUTION_ID="your-distribution-id"
./deploy.sh  # Linux/Mac
# OR
.\deploy.ps1  # Windows PowerShell
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f users-service

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild specific service
docker-compose up --build users-service

# Execute command in container
docker-compose exec users-service python manage.py createsuperuser
```

## 📝 Database Migrations

Migrations run automatically on container startup. To manually run migrations:

```bash
docker-compose exec users-service python manage.py migrate
docker-compose exec books-service python manage.py migrate
docker-compose exec orders-service python manage.py migrate
docker-compose exec payments-service python manage.py migrate
docker-compose exec reviews-service python manage.py migrate
```

## 🚀 Production Considerations

1. **Security**:
   - Change default SECRET_KEY values
   - Use environment variables for sensitive data
   - Enable HTTPS/TLS
   - Implement proper authentication (JWT)
   - Add rate limiting

2. **Performance**:
   - Add caching (Redis)
   - Use connection pooling
   - Implement API gateway
   - Add load balancing

3. **Monitoring**:
   - Add health check endpoints
   - Implement logging and monitoring
   - Set up error tracking

4. **Deployment**:
   - Use Kubernetes for orchestration
   - Set up CI/CD pipelines
   - Use managed databases
   - Implement service mesh (Istio)

## 🤝 Contributing

This is a template microservices architecture. Feel free to extend and customize for your needs.

## 📄 License

This project is open source and available for educational and commercial use.

---

**Built with Django, Django REST Framework, PostgreSQL, and Docker**

