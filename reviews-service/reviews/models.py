from django.db import models


class Review(models.Model):
    """Review model for books"""
    RATING_CHOICES = [
        (1, '1 - Poor'),
        (2, '2 - Fair'),
        (3, '3 - Good'),
        (4, '4 - Very Good'),
        (5, '5 - Excellent'),
    ]

    book_id = models.IntegerField()  # Reference to Books service
    user_id = models.IntegerField()  # Reference to Users service
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Review for Book {self.book_id} by User {self.user_id} - Rating {self.rating}"

    class Meta:
        unique_together = ['book_id', 'user_id']  # One review per user per book
        ordering = ['-created_at']

