
from django.urls import path

from . import views
from .views import user_login, user_logout, dashboard,signup




urlpatterns = [
    path('', dashboard, name='dashboard'),

    path('api/events/', views.get_events),
    path('api/add-event/', views.add_event),
    path('login/', user_login, name='login'),
    path('logout/', user_logout, name='logout'),
    path('signup/', signup, name='signup')

]