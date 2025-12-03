"""
URL configuration for books_service project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    """Health check endpoint for Kubernetes probes"""
    return JsonResponse({'status': 'healthy', 'service': 'books-service'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('books.urls')),
    path('health', health_check, name='health'),
]

