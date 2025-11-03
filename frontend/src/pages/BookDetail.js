import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cart as cartUtil, auth } from '../utils';
import { bookService as bookApi, reviewService as reviewApi } from '../services/api';
import './BookDetail.css';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const isAuthenticated = auth.isAuthenticated();
  const user = auth.getUser();

  useEffect(() => {
    fetchBook();
    fetchReviews();
    fetchStats();
  }, [id]);

  const fetchBook = async () => {
    try {
      const data = await bookApi.getBook(id);
      setBook(data);
    } catch (error) {
      console.error('Error fetching book:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await reviewApi.getReviewsByBook(id);
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await reviewApi.getBookStatistics(id);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddToCart = () => {
    if (!book) return;
    
    for (let i = 0; i < quantity; i++) {
      cartUtil.addToCart(book);
    }
    alert(`${quantity} item(s) added to cart!`);
    navigate('/cart');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to submit a review');
      navigate('/login');
      return;
    }

    try {
      await reviewApi.createReview({
        book_id: parseInt(id),
        user_id: user.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      alert('Review submitted successfully!');
      setReviewForm({ rating: 5, comment: '' });
      fetchReviews();
      fetchStats();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!book) {
    return <div className="container">Book not found</div>;
  }

  return (
    <div className="book-detail">
      <div className="container">
        <div className="book-detail-content">
          <div className="book-image-section">
            <div className="book-image-large">
              <div className="book-placeholder-large">📖</div>
            </div>
          </div>

          <div className="book-info-section">
            <h1>{book.title}</h1>
            <p className="book-author">by {book.author}</p>
            {book.category_name && (
              <span className="book-category">{book.category_name}</span>
            )}
            
            <div className="book-price-section">
              <span className="book-price">${parseFloat(book.price).toFixed(2)}</span>
              <span className={`book-stock ${book.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {book.description && (
              <div className="book-description">
                <h3>Description</h3>
                <p>{book.description}</p>
              </div>
            )}

            {stats && (
              <div className="book-rating-summary">
                <div className="rating-display">
                  <span className="rating-number">{stats.average_rating?.toFixed(1)}</span>
                  <span className="rating-stars">
                    {'★'.repeat(Math.round(stats.average_rating || 0))}
                    {'☆'.repeat(5 - Math.round(stats.average_rating || 0))}
                  </span>
                  <span className="rating-count">({stats.total_reviews} reviews)</span>
                </div>
              </div>
            )}

            <div className="book-actions">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={book.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(book.stock, parseInt(e.target.value) || 1)))}
                  className="form-input"
                  style={{ width: '80px' }}
                />
              </div>
              <button
                onClick={handleAddToCart}
                disabled={book.stock === 0}
                className="btn btn-primary btn-large"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        <div className="book-reviews-section">
          <h2>Reviews</h2>
          
          {isAuthenticated && (
            <form onSubmit={handleSubmitReview} className="review-form">
              <h3>Write a Review</h3>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                  className="form-select"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={3}>3 - Good</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="form-textarea"
                  placeholder="Share your thoughts about this book..."
                />
              </div>
              <button type="submit" className="btn btn-primary">Submit Review</button>
            </form>
          )}

          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="review-rating">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    <span className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && <p className="review-comment">{review.comment}</p>}
                </div>
              ))
            ) : (
              <p>No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;

