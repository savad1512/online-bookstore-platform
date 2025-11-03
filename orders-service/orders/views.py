from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
import requests
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for Order CRUD operations"""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        """Create a new order with validation"""
        serializer = OrderCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Validate user exists
            user_id = serializer.validated_data['user_id']
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
                return Response(
                    {'error': 'Unable to verify user. Users service unavailable.'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

            # Validate books exist and check stock
            items_data = serializer.validated_data['items']
            for item in items_data:
                book_id = item['book_id']
                quantity = item['quantity']
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
                    book_data = book_response.json()
                    if book_data.get('stock', 0) < quantity:
                        return Response(
                            {'error': f'Insufficient stock for book {book_id}'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    item['price'] = book_data.get('price', 0)
                except requests.RequestException:
                    return Response(
                        {'error': 'Unable to verify book. Books service unavailable.'},
                        status=status.HTTP_503_SERVICE_UNAVAILABLE
                    )

            order = serializer.save()
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def by_user(self, request):
        """Get orders by user ID"""
        user_id = request.query_params.get('user_id')
        if user_id:
            orders = Order.objects.filter(user_id=user_id)
            serializer = self.get_serializer(orders, many=True)
            return Response(serializer.data)
        return Response({'error': 'user_id parameter required'}, 
                       status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update order status"""
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        order.status = new_status
        order.save()
        return Response(OrderSerializer(order).data)

