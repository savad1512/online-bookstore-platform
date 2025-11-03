from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from django.db.models import Avg, Count
import requests
from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for Review CRUD operations"""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def create(self, request, *args, **kwargs):
        """Create a new review with validation"""
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            book_id = serializer.validated_data['book_id']
            user_id = serializer.validated_data['user_id']
            
            # Check if review already exists
            if Review.objects.filter(book_id=book_id, user_id=user_id).exists():
                return Response(
                    {'error': 'You have already reviewed this book'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate book exists (optional - for better error messages)
            try:
                book_response = requests.get(
                    f"{settings.BOOKS_SERVICE_URL}/api/books/{book_id}/",
                    timeout=5
                )
                if book_response.status_code != 200:
                    return Response(
                        {'error': f'Book {book_id} not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            except requests.RequestException:
                pass  # Continue if service is unavailable
            
            # Validate user exists (optional)
            try:
                user_response = requests.get(
                    f"{settings.USERS_SERVICE_URL}/api/users/{user_id}/",
                    timeout=5
                )
                if user_response.status_code != 200:
                    return Response(
                        {'error': f'User {user_id} not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            except requests.RequestException:
                pass  # Continue if service is unavailable

            review = serializer.save()
            return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def by_book(self, request):
        """Get reviews by book ID"""
        book_id = request.query_params.get('book_id')
        if book_id:
            reviews = Review.objects.filter(book_id=book_id)
            serializer = self.get_serializer(reviews, many=True)
            
            # Calculate average rating
            avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
            total_reviews = reviews.count()
            
            return Response({
                'book_id': book_id,
                'average_rating': round(avg_rating, 2),
                'total_reviews': total_reviews,
                'reviews': serializer.data
            })
        return Response({'error': 'book_id parameter required'}, 
                       status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def by_user(self, request):
        """Get reviews by user ID"""
        user_id = request.query_params.get('user_id')
        if user_id:
            reviews = Review.objects.filter(user_id=user_id)
            serializer = self.get_serializer(reviews, many=True)
            return Response(serializer.data)
        return Response({'error': 'user_id parameter required'}, 
                       status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def book_statistics(self, request):
        """Get review statistics for a book"""
        book_id = request.query_params.get('book_id')
        if book_id:
            reviews = Review.objects.filter(book_id=book_id)
            stats = reviews.aggregate(
                avg_rating=Avg('rating'),
                total_reviews=Count('id')
            )
            rating_distribution = reviews.values('rating').annotate(count=Count('id'))
            return Response({
                'book_id': book_id,
                'average_rating': round(stats['avg_rating'] or 0, 2),
                'total_reviews': stats['total_reviews'],
                'rating_distribution': list(rating_distribution)
            })
        return Response({'error': 'book_id parameter required'}, 
                       status=status.HTTP_400_BAD_REQUEST)

