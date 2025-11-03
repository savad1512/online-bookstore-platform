import axios from 'axios';

// API Base URLs
const API_CONFIG = {
  users: process.env.REACT_APP_USERS_SERVICE_URL || 'http://localhost:8001',
  books: process.env.REACT_APP_BOOKS_SERVICE_URL || 'http://localhost:8002',
  orders: process.env.REACT_APP_ORDERS_SERVICE_URL || 'http://localhost:8003',
  payments: process.env.REACT_APP_PAYMENTS_SERVICE_URL || 'http://localhost:8004',
  reviews: process.env.REACT_APP_REVIEWS_SERVICE_URL || 'http://localhost:8005',
};

// Create axios instances for each service
const createApiClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred';
      return Promise.reject(new Error(message));
    }
  );

  return client;
};

// API Clients
export const usersApi = createApiClient(`${API_CONFIG.users}/api`);
export const booksApi = createApiClient(`${API_CONFIG.books}/api`);
export const ordersApi = createApiClient(`${API_CONFIG.orders}/api`);
export const paymentsApi = createApiClient(`${API_CONFIG.payments}/api`);
export const reviewsApi = createApiClient(`${API_CONFIG.reviews}/api`);

// Users Service
export const userService = {
  register: (data) => usersApi.post('/users/register/', data),
  login: (data) => usersApi.post('/users/login/', data),
  getCurrentUser: () => usersApi.get('/users/me/'),
  getUser: (id) => usersApi.get(`/users/${id}/`),
  updateUser: (id, data) => usersApi.put(`/users/${id}/`, data),
};

// Books Service
export const bookService = {
  getBooks: (params) => booksApi.get('/books/', { params }),
  getBook: (id) => booksApi.get(`/books/${id}/`),
  createBook: (data) => booksApi.post('/books/', data),
  updateBook: (id, data) => booksApi.put(`/books/${id}/`, data),
  deleteBook: (id) => booksApi.delete(`/books/${id}/`),
  searchBooks: (query) => booksApi.get('/books/search/', { params: { q: query } }),
  getBooksByCategory: (categoryId) => booksApi.get('/books/by_category/', { params: { category_id: categoryId } }),
  getBooksByAuthor: (author) => booksApi.get('/books/by_author/', { params: { author } }),
  getCategories: () => booksApi.get('/categories/'),
  createCategory: (data) => booksApi.post('/categories/', data),
};

// Orders Service
export const orderService = {
  getOrders: () => ordersApi.get('/orders/'),
  getOrder: (id) => ordersApi.get(`/orders/${id}/`),
  createOrder: (data) => ordersApi.post('/orders/', data),
  updateOrder: (id, data) => ordersApi.put(`/orders/${id}/`, data),
  updateOrderStatus: (id, status) => ordersApi.patch(`/orders/${id}/update_status/`, { status }),
  getOrdersByUser: (userId) => ordersApi.get('/orders/by_user/', { params: { user_id: userId } }),
};

// Payments Service
export const paymentService = {
  getPayments: () => paymentsApi.get('/payments/'),
  getPayment: (id) => paymentsApi.get(`/payments/${id}/`),
  createPayment: (data) => paymentsApi.post('/payments/', data),
  getPaymentsByOrder: (orderId) => paymentsApi.get('/payments/by_order/', { params: { order_id: orderId } }),
  getPaymentsByUser: (userId) => paymentsApi.get('/payments/by_user/', { params: { user_id: userId } }),
  refundPayment: (id) => paymentsApi.post(`/payments/${id}/refund/`),
};

// Reviews Service
export const reviewService = {
  getReviews: () => reviewsApi.get('/reviews/'),
  getReview: (id) => reviewsApi.get(`/reviews/${id}/`),
  createReview: (data) => reviewsApi.post('/reviews/', data),
  updateReview: (id, data) => reviewsApi.put(`/reviews/${id}/`, data),
  deleteReview: (id) => reviewsApi.delete(`/reviews/${id}/`),
  getReviewsByBook: (bookId) => reviewsApi.get('/reviews/by_book/', { params: { book_id: bookId } }),
  getReviewsByUser: (userId) => reviewsApi.get('/reviews/by_user/', { params: { user_id: userId } }),
  getBookStatistics: (bookId) => reviewsApi.get('/reviews/book_statistics/', { params: { book_id: bookId } }),
};

export default {
  users: userService,
  books: bookService,
  orders: orderService,
  payments: paymentService,
  reviews: reviewService,
};

