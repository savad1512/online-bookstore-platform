# API Endpoints Reference

Complete list of all available API endpoints across all microservices.

## Users Service (Port 8001)

### Authentication & User Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users/register/` | Register a new user | No |
| POST | `/api/users/login/` | User login | No |
| GET | `/api/users/` | List all users | Yes |
| GET | `/api/users/{id}/` | Get user details | Yes |
| GET | `/api/users/me/` | Get current authenticated user | Yes |
| PUT | `/api/users/{id}/` | Update user | Yes |
| PATCH | `/api/users/{id}/` | Partially update user | Yes |
| DELETE | `/api/users/{id}/` | Delete user | Yes |

**Request Body Examples:**

**Register:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "password2": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "date_of_birth": "1990-01-01"
}
```

**Login:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

## Books Service (Port 8002)

### Books

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/books/` | List all books (paginated) | No |
| POST | `/api/books/` | Create a new book | No |
| GET | `/api/books/{id}/` | Get book details | No |
| PUT | `/api/books/{id}/` | Update book | No |
| PATCH | `/api/books/{id}/` | Partially update book | No |
| DELETE | `/api/books/{id}/` | Delete book | No |
| GET | `/api/books/by_category/?category_id=1` | Get books by category | No |
| GET | `/api/books/by_author/?author=AuthorName` | Get books by author | No |
| GET | `/api/books/search/?q=query` | Search books by title/author | No |

**Request Body Example (Create Book):**
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "description": "A classic American novel",
  "price": "29.99",
  "category": 1,
  "stock": 100,
  "isbn": "9780743273565",
  "published_date": "1925-04-10"
}
```

### Categories

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/categories/` | List all categories | No |
| POST | `/api/categories/` | Create a category | No |
| GET | `/api/categories/{id}/` | Get category details | No |
| PUT | `/api/categories/{id}/` | Update category | No |
| PATCH | `/api/categories/{id}/` | Partially update category | No |
| DELETE | `/api/categories/{id}/` | Delete category | No |

**Request Body Example (Create Category):**
```json
{
  "name": "Fiction",
  "description": "Fictional novels and stories"
}
```

---

## Orders Service (Port 8003)

### Orders

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/orders/` | List all orders | No |
| POST | `/api/orders/` | Create a new order | No |
| GET | `/api/orders/{id}/` | Get order details | No |
| PUT | `/api/orders/{id}/` | Update order | No |
| PATCH | `/api/orders/{id}/` | Partially update order | No |
| DELETE | `/api/orders/{id}/` | Delete order | No |
| GET | `/api/orders/by_user/?user_id=1` | Get orders by user ID | No |
| PATCH | `/api/orders/{id}/update_status/` | Update order status | No |

**Order Statuses:**
- `PENDING` - Order placed, awaiting confirmation
- `CONFIRMED` - Order confirmed
- `PROCESSING` - Order being processed
- `SHIPPED` - Order has been shipped
- `DELIVERED` - Order delivered
- `CANCELLED` - Order cancelled

**Request Body Example (Create Order):**
```json
{
  "user_id": 1,
  "shipping_address": "123 Main St, City, Country, 12345",
  "items": [
    {
      "book_id": 1,
      "quantity": 2,
      "price": 29.99
    },
    {
      "book_id": 2,
      "quantity": 1,
      "price": 19.99
    }
  ]
}
```

**Update Status:**
```json
{
  "status": "SHIPPED"
}
```

---

## Payments Service (Port 8004)

### Payments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/payments/` | List all payments | No |
| POST | `/api/payments/` | Process a payment | No |
| GET | `/api/payments/{id}/` | Get payment details | No |
| PUT | `/api/payments/{id}/` | Update payment | No |
| PATCH | `/api/payments/{id}/` | Partially update payment | No |
| DELETE | `/api/payments/{id}/` | Delete payment | No |
| GET | `/api/payments/by_order/?order_id=1` | Get payments by order ID | No |
| GET | `/api/payments/by_user/?user_id=1` | Get payments by user ID | No |
| POST | `/api/payments/{id}/refund/` | Process a refund | No |

**Payment Methods:**
- `CREDIT_CARD` - Credit card payment
- `DEBIT_CARD` - Debit card payment
- `PAYPAL` - PayPal payment
- `BANK_TRANSFER` - Bank transfer

**Payment Statuses:**
- `PENDING` - Payment pending
- `PROCESSING` - Payment processing
- `COMPLETED` - Payment completed
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded

**Request Body Example (Process Payment):**
```json
{
  "order_id": 1,
  "user_id": 1,
  "amount": "79.97",
  "payment_method": "CREDIT_CARD"
}
```

---

## Reviews Service (Port 8005)

### Reviews

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/reviews/` | List all reviews (paginated) | No |
| POST | `/api/reviews/` | Create a review | No |
| GET | `/api/reviews/{id}/` | Get review details | No |
| PUT | `/api/reviews/{id}/` | Update review | No |
| PATCH | `/api/reviews/{id}/` | Partially update review | No |
| DELETE | `/api/reviews/{id}/` | Delete review | No |
| GET | `/api/reviews/by_book/?book_id=1` | Get reviews by book ID | No |
| GET | `/api/reviews/by_user/?user_id=1` | Get reviews by user ID | No |
| GET | `/api/reviews/book_statistics/?book_id=1` | Get book review statistics | No |

**Ratings:**
- `1` - Poor
- `2` - Fair
- `3` - Good
- `4` - Very Good
- `5` - Excellent

**Request Body Example (Create Review):**
```json
{
  "book_id": 1,
  "user_id": 1,
  "rating": 5,
  "comment": "Excellent book! Highly recommended. The story is engaging and well-written."
}
```

**Response Example (by_book):**
```json
{
  "book_id": 1,
  "average_rating": 4.5,
  "total_reviews": 10,
  "reviews": [
    {
      "id": 1,
      "book_id": 1,
      "user_id": 1,
      "rating": 5,
      "comment": "Great book!",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

**Response Example (book_statistics):**
```json
{
  "book_id": 1,
  "average_rating": 4.5,
  "total_reviews": 10,
  "rating_distribution": [
    {"rating": 5, "count": 5},
    {"rating": 4, "count": 3},
    {"rating": 3, "count": 2},
    {"rating": 2, "count": 0},
    {"rating": 1, "count": 0}
  ]
}
```

---

## Response Formats

### Success Response (200/201)
```json
{
  "id": 1,
  "field1": "value1",
  "field2": "value2"
}
```

### Error Response (400/404/500)
```json
{
  "error": "Error message description",
  "detail": "Additional error details"
}
```

### Validation Error (400)
```json
{
  "field_name": [
    "Error message 1",
    "Error message 2"
  ]
}
```

---

## Notes

1. **Pagination**: Books and Reviews services use pagination (20 items per page by default)
2. **Service Communication**: Orders, Payments, and Reviews services validate data by calling other services
3. **Unique Constraints**: 
   - One review per user per book
   - One order item per book per order
4. **Inter-Service URLs**: Configured via environment variables in docker-compose.yml

