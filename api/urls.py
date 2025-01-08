from django.urls import path
from . import views

urlpatterns = [
    path('v1/landing/', views.LandingAPI.as_view(), name='firebase_resources' ),
]
