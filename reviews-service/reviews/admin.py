from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'book_id', 'user_id', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['book_id', 'user_id', 'comment']

