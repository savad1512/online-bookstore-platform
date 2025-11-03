import React from 'react';
import { Link } from 'react-router-dom';
import './BookCard.css';

const BookCard = ({ book }) => {
  return (
    <Link to={`/books/${book.id}`} className="book-card">
      <div className="book-card-image">
        <div className="book-placeholder">
          📖
        </div>
      </div>
      <div className="book-card-content">
        <h3 className="book-card-title">{book.title}</h3>
        <p className="book-card-author">by {book.author}</p>
        {book.category_name && (
          <span className="book-card-category">{book.category_name}</span>
        )}
        <div className="book-card-footer">
          <span className="book-card-price">${parseFloat(book.price).toFixed(2)}</span>
          <span className={`book-card-stock ${book.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;

