from django.urls import path
from . import views

urlpatterns = [
    path('', views.home),  # homepage
    path('api/events/', views.get_events),
    path('api/add-event/', views.add_event),
]