import React from 'react';
import { useParams } from 'react-router-dom';

const Reviews = () => {
  const { bookId } = useParams();
  // Reviews are handled in BookDetail component
  return <div>Reviews page for book {bookId}</div>;
};

export default Reviews;

