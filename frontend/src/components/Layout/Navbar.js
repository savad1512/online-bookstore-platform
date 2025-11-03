import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, cart } from '../../utils';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = auth.isAuthenticated();
  const user = auth.getUser();
  const cartCount = cart.getItemCount();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          📚 Bookstore
        </Link>
        
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/books" className="navbar-link">Books</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/orders" className="navbar-link">Orders</Link>
              <Link to="/profile" className="navbar-link">Profile</Link>
              <div className="navbar-user">
                <span>Hi, {user?.first_name || user?.username}</span>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
          
          <Link to="/cart" className="navbar-cart">
            🛒 Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

