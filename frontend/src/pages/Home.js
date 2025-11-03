import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookService } from '../services/api';
import BookCard from '../components/BookCard';
import './Home.css';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await bookService.getBooks();
        setBooks(Array.isArray(data) ? data : data.results || []);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Online Bookstore</h1>
          <p>Discover your next great read from our vast collection of books</p>
          <Link to="/books" className="btn btn-primary btn-large">
            Browse Books
          </Link>
        </div>
      </section>

      <section className="featured-books">
        <div className="container">
          <h2>Featured Books</h2>
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <div className="books-grid">
              {books.slice(0, 6).map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
          <div className="text-center">
            <Link to="/books" className="btn btn-outline">
              View All Books
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

