from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
import requests
from .models import Payment
from .serializers import PaymentSerializer, PaymentCreateSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for Payment CRUD operations"""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer

    def create(self, request, *args, **kwargs):
        """Create a new payment with order validation"""
        serializer = PaymentCreateSerializer(data=request.data)
        if serializer.is_valid():
            order_id = serializer.validated_data['order_id']
            
            # Validate order exists
            try:
                order_response = requests.get(
                    f"{settings.ORDERS_SERVICE_URL}/api/orders/{order_id}/",
                    timeout=5
                )
                if order_response.status_code != 200:
                    return Response(
                        {'error': f'Order {order_id} not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                order_data = order_response.json()
                
                # Verify payment amount matches order total
                if float(serializer.validated_data['amount']) != float(order_data.get('total_amount', 0)):
                    return Response(
                        {'error': 'Payment amount does not match order total'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except requests.RequestException:
                return Response(
                    {'error': 'Unable to verify order. Orders service unavailable.'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

            payment = serializer.save()
            payment.status = 'PROCESSING'
            payment.save()
            
            # Simulate payment processing
            payment.status = 'COMPLETED'
            payment.save()
            
            return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def by_order(self, request):
        """Get payments by order ID"""
        order_id = request.query_params.get('order_id')
        if order_id:
            payments = Payment.objects.filter(order_id=order_id)
            serializer = self.get_serializer(payments, many=True)
            return Response(serializer.data)
        return Response({'error': 'order_id parameter required'}, 
                       status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def by_user(self, request):
        """Get payments by user ID"""
        user_id = request.query_params.get('user_id')
        if user_id:
            payments = Payment.objects.filter(user_id=user_id)
            serializer = self.get_serializer(payments, many=True)
            return Response(serializer.data)
        return Response({'error': 'user_id parameter required'}, 
                       status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        """Process a refund for a payment"""
        payment = self.get_object()
        if payment.status != 'COMPLETED':
            return Response(
                {'error': 'Only completed payments can be refunded'},
                status=status.HTTP_400_BAD_REQUEST
            )
        payment.status = 'REFUNDED'
        payment.save()
        return Response(PaymentSerializer(payment).data)

