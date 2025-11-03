from rest_framework import serializers
from .models import Book, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'created_at')
        read_only_fields = ('id', 'created_at')


class BookSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Book
        fields = ('id', 'title', 'author', 'description', 'price', 'category', 
                  'category_name', 'stock', 'isbn', 'published_date', 
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class BookCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ('title', 'author', 'description', 'price', 'category', 
                  'stock', 'isbn', 'published_date')

