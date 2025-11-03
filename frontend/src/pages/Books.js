import React, { useEffect, useState } from 'react';
import { bookService } from '../services/api';
import BookCard from '../components/BookCard';
import './Books.css';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [selectedCategory]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      let data;
      if (selectedCategory) {
        data = await bookService.getBooksByCategory(selectedCategory);
      } else {
        data = await bookService.getBooks();
      }
      setBooks(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await bookService.getCategories();
      setCategories(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchBooks();
      return;
    }

    try {
      setLoading(true);
      const data = await bookService.searchBooks(searchQuery);
      setBooks(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="books-page">
      <div className="container">
        <div className="books-header">
          <h1>Browse Books</h1>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>

        <div className="books-filters">
          <button
            className={`filter-btn ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              className={`filter-btn ${selectedCategory === category.id.toString() ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id.toString())}
            >
              {category.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner"></div>
        ) : books.length > 0 ? (
          <div className="books-grid">
            {books.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="no-books">
            <p>No books found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;

