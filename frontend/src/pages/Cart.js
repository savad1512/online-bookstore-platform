import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cart as cartUtil, auth } from '../utils';
import { orderService, paymentService } from '../services/api';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const isAuthenticated = auth.isAuthenticated();
  const user = auth.getUser();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    setCartItems(cartUtil.getCart());
  };

  const updateQuantity = (bookId, quantity) => {
    cartUtil.updateQuantity(bookId, quantity);
    loadCart();
  };

  const removeItem = (bookId) => {
    cartUtil.removeFromCart(bookId);
    loadCart();
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert('Please login to checkout');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (!shippingAddress.trim()) {
      alert('Please enter shipping address');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderData = {
        user_id: user.id,
        shipping_address: shippingAddress,
        items: cartItems.map(item => ({
          book_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const order = await orderService.createOrder(orderData);
      
      // Create payment
      const paymentData = {
        order_id: order.id,
        user_id: user.id,
        amount: cartUtil.getTotal().toFixed(2),
        payment_method: 'CREDIT_CARD',
      };

      const payment = await paymentService.createPayment(paymentData);
      
      alert('Order placed successfully!');
      cartUtil.clearCart();
      navigate('/orders');
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const total = cartUtil.getTotal();

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/books" className="btn btn-primary">Browse Books</Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <h3>{item.title}</h3>
                    <p>by {item.author}</p>
                    <span className="cart-item-price">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="btn btn-outline"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="btn btn-outline"
                        disabled={item.quantity >= item.stock}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="btn btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-card">
                <h2>Order Summary</h2>
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {isAuthenticated ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Shipping Address</label>
                      <textarea
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="form-textarea"
                        placeholder="Enter your shipping address"
                        rows="3"
                        required
                      />
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="btn btn-primary btn-block"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Checkout'}
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="btn btn-primary btn-block">
                    Login to Checkout
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

