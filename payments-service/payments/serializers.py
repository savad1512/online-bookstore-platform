from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ('id', 'order_id', 'user_id', 'amount', 'payment_method', 
                  'status', 'transaction_id', 'payment_date', 'updated_at')
        read_only_fields = ('id', 'payment_date', 'updated_at', 'transaction_id')


class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ('order_id', 'user_id', 'amount', 'payment_method')

    def create(self, validated_data):
        import uuid
        payment = Payment.objects.create(
            transaction_id=str(uuid.uuid4()),
            **validated_data
        )
        return payment

