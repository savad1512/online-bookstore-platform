from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline]
    list_display = ['id', 'user_id', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'created_at']


admin.site.register(OrderItem)

