// Shopping cart utilities
export const cart = {
  getCart: () => {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
  },

  addToCart: (book) => {
    const cartItems = cart.getCart();
    const existingItem = cartItems.find(item => item.id === book.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartItems.push({
        id: book.id,
        title: book.title,
        author: book.author,
        price: parseFloat(book.price),
        quantity: 1,
        stock: book.stock,
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    return cartItems;
  },

  removeFromCart: (bookId) => {
    const cartItems = cart.getCart().filter(item => item.id !== bookId);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    return cartItems;
  },

  updateQuantity: (bookId, quantity) => {
    const cartItems = cart.getCart();
    const item = cartItems.find(item => item.id === bookId);
    
    if (item) {
      if (quantity <= 0) {
        return cart.removeFromCart(bookId);
      }
      item.quantity = quantity;
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
    
    return cartItems;
  },

  clearCart: () => {
    localStorage.removeItem('cart');
  },

  getTotal: () => {
    const cartItems = cart.getCart();
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getItemCount: () => {
    const cartItems = cart.getCart();
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  },
};

