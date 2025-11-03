from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ('id', 'book_id', 'quantity', 'price')
        read_only_fields = ('id',)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'user_id', 'status', 'total_amount', 'shipping_address', 
                  'items', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at', 'total_amount')


class OrderCreateSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    shipping_address = serializers.CharField()
    items = OrderItemSerializer(many=True)

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        
        total_amount = 0
        for item_data in items_data:
            item = OrderItem.objects.create(order=order, **item_data)
            total_amount += item.price * item.quantity
        
        order.total_amount = total_amount
        order.save()
        return order

