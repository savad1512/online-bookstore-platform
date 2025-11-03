from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Book, Category
from .serializers import BookSerializer, BookCreateUpdateSerializer, CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for Category CRUD operations"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class BookViewSet(viewsets.ModelViewSet):
    """ViewSet for Book CRUD operations"""
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return BookCreateUpdateSerializer
        return BookSerializer

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get books by category"""
        category_id = request.query_params.get('category_id')
        if category_id:
            books = Book.objects.filter(category_id=category_id)
            serializer = self.get_serializer(books, many=True)
            return Response(serializer.data)
        return Response({'error': 'category_id parameter required'}, 
                       status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def by_author(self, request):
        """Get books by author"""
        author = request.query_params.get('author')
        if author:
            books = Book.objects.filter(author__icontains=author)
            serializer = self.get_serializer(books, many=True)
            return Response(serializer.data)
        return Response({'error': 'author parameter required'}, 
                       status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search books by title or author"""
        query = request.query_params.get('q')
        if query:
            books = Book.objects.filter(
                Q(title__icontains=query) | 
                Q(author__icontains=query)
            )
            serializer = self.get_serializer(books, many=True)
            return Response(serializer.data)
        return Response({'error': 'q parameter required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
