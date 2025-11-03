from django.db import models


class Order(models.Model):
    """Order model"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('PROCESSING', 'Processing'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    ]

    user_id = models.IntegerField()  # Reference to Users service
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    shipping_address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} - User {self.user_id} - {self.status}"

    class Meta:
        ordering = ['-created_at']


class OrderItem(models.Model):
    """Order item model"""
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    book_id = models.IntegerField()  # Reference to Books service
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Order {self.order.id} - Book {self.book_id} - Qty {self.quantity}"

    class Meta:
        unique_together = ['order', 'book_id']

